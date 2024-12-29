const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Import the CORS middleware
const { Storage } = require('@google-cloud/storage');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { unlink } = require('fs/promises');
const { promisify } = require('util');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

// Enable CORS for all routes and origins
app.use(cors());

// Parse JSON requests
app.use(express.json());

const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } }); // Limit file size to 50MB
const storage = new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });
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

app.listen(PORT, () => console.log(`StorageMgmtServ running on port ${PORT}`));
