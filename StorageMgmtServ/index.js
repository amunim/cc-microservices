const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const ffmpeg = require('fluent-ffmpeg');
const { unlink } = require('fs/promises');
const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3001
const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } }); // Limit file size to 50MB
// const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
const storage = new Storage();
const bucketName = process.env.GCS_BUCKET_NAME;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const videoSchema = new mongoose.Schema({
    username: String,
    originalName: String,
    compressedName: String,
    size: Number,
    compressedSize: Number, // Store the size of the compressed video
    url: String,
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    uploadedAt: { type: Date, default: Date.now },
});
const Video = mongoose.model('Video', videoSchema);

// Middleware to authenticate and decode JWT
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Middleware to check bandwidth usage
const checkBandwidth = async (req, res, next) => {
    try {
        const response = await axios.get(
            `${process.env.USAGE_MONITORING_SERVICE_URL}/usage`,
            { headers: { Authorization: req.headers['authorization'] } }
        );

        const { remainingBandwidth, totalUsedBandwidth } = response.data;

        // Check if total bandwidth exceeds the total limit (50MB)
        if (totalUsedBandwidth >= 50) {
            return res.status(403).json({ error: 'Total bandwidth limit exceeded. Please contact support.' });
        }

        // Check if the daily bandwidth exceeds the daily limit (10MB)
        if (remainingBandwidth <= 0) {
            return res.status(403).json({ error: 'Daily bandwidth limit exceeded. Please wait until tomorrow to upload again.' });
        }

        next();
    } catch (error) {
        console.error('Error checking bandwidth:', error);
        res.status(500).json({ error: 'Failed to verify bandwidth usage' });
    }
};

// Upload endpoint
app.post('/upload', authenticate, checkBandwidth, upload.single('video'), async (req, res) => {
    const { file, body } = req;
    const { title, description } = body; // Get title and description from the request

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = file.path;
    const outputPath = `uploads/${file.filename}-compressed.mp4`;

    try {
        // Compress the video
        await new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .output(outputPath)
                .videoCodec('libx264')
                .size('640x360') // Compress to 360p
                .on('end', resolve)
                .on('error', reject)
                .run();
        });

        // Get the compressed video size
        const compressedSize = (await promisify(require('fs').stat)(outputPath)).size;

        // Upload to Google Cloud Storage
        const destination = `${file.filename}-compressed.mp4`;
        await storage.bucket(bucketName).upload(outputPath, {
            destination,
        });
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;

        // Save metadata to MongoDB, including compressed video size, title, and description
        const videoMetadata = new Video({
            username: req.username,
            originalName: file.originalname,
            compressedName: destination,
            size: file.size / (1024 * 1024), // Convert original size to MB
            compressedSize: compressedSize / (1024 * 1024), // Convert compressed size to MB
            url: publicUrl,
            title: title || '',
            description: description || '',
            uploadedAt: new Date(),
        });
        await videoMetadata.save();

        // Log usage to Usage Monitoring Service (compressed size)
        await axios.post(
            `${process.env.USAGE_MONITORING_SERVICE_URL}/log-upload`,
            { size: compressedSize / (1024 * 1024) }, // Send size in MB
            { headers: { Authorization: req.headers['authorization'] } }
        );

        // Clean up temporary files
        await unlink(inputPath);
        await unlink(outputPath);

        res.status(200).json({ message: 'File uploaded successfully', url: publicUrl });
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).json({ error: 'Failed to upload file' });

        // Clean up in case of errors
        if (fs.existsSync(inputPath)) await unlink(inputPath);
        if (fs.existsSync(outputPath)) await unlink(outputPath);
    }
});

// Get all videos for a user
app.get('/videos', authenticate, async (req, res) => {
    try {
        const videos = await Video.find({ username: req.username });
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Get a single video by ID
app.get('/videos/:id', authenticate, async (req, res) => {
    try {
        const video = await Video.findOne({ _id: req.params.id, username: req.username });
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.status(200).json(video);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Delete a video by ID
app.delete('/videos/:id', authenticate, async (req, res) => {
    try {
        const video = await Video.findOneAndDelete({ _id: req.params.id, username: req.username });
        if (!video) return res.status(404).json({ error: 'Video not found' });

        // Delete video from GCS
        await storage.bucket(bucketName).file(video.compressedName).delete();

        // Log usage to Usage Monitoring Service (deletion)
        await axios.post(
            `${process.env.USAGE_MONITORING_SERVICE_URL}/log-deletion`,
            { size: video.compressedSize }, // Send size in MB
            { headers: { Authorization: req.headers['authorization'] } }
        );

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

// Edit video metadata (title and description)
app.patch('/videos/:id', authenticate, async (req, res) => {
    const { title, description } = req.body;
    try {
        const video = await Video.findOneAndUpdate(
            { _id: req.params.id, username: req.username },
            { title, description },
            { new: true }
        );
        if (!video) return res.status(404).json({ error: 'Video not found' });
        res.status(200).json(video);
    } catch (error) {
        console.error('Error updating video metadata:', error);
        res.status(500).json({ error: 'Failed to update video metadata' });
    }
});

app.listen(PORT, () => console.log('StorageMgmtServ running on port 3001'));
