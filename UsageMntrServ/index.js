const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = process.env.PORT || 3002
const app = express();
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const usageSchema = new mongoose.Schema({
    username: String,
    date: { type: Date, default: () => new Date().toISOString().split('T')[0] }, // Store only the date
    usedBandwidth: { type: Number, default: 0 }, // Daily usage in MB
    totalUsedBandwidth: { type: Number, default: 0 }, // Total usage across all days in MB
});

const Usage = mongoose.model('Usage', usageSchema);

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

const DAILY_BANDWIDTH_LIMIT = 10; // Daily bandwidth limit in MB
const TOTAL_BANDWIDTH_LIMIT = 50; // Total bandwidth limit in MB

// Middleware to check bandwidth usage
const checkBandwidth = async (req, res, next) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        let usage = await Usage.findOne({ username: req.username, date: today });

        if (!usage) {
            usage = new Usage({ username: req.username });
            await usage.save();
        }

        req.usage = usage;

        // Check if the total bandwidth exceeds the total limit
        if (usage.totalUsedBandwidth >= TOTAL_BANDWIDTH_LIMIT) {
            return res.status(403).json({ error: 'Total bandwidth limit exceeded. Please contact support.' });
        }

        // Check if the daily bandwidth exceeds the daily limit
        if (usage.usedBandwidth >= DAILY_BANDWIDTH_LIMIT) {
            return res.status(403).json({ error: 'Daily bandwidth limit exceeded. Please wait until tomorrow to upload again.' });
        }

        next();
    } catch (error) {
        console.error('Error checking bandwidth usage:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// API to log upload usage
app.post('/log-upload', authenticate, checkBandwidth, async (req, res) => {
    const { size } = req.body; // Size in MB

    if (!size || size <= 0) {
        return res.status(400).json({ error: 'Invalid size value' });
    }

    try {
        req.usage.usedBandwidth += size;
        req.usage.totalUsedBandwidth += size; // Increment total bandwidth used
        await req.usage.save();

        res.status(200).json({ message: 'Usage logged successfully', usedBandwidth: req.usage.usedBandwidth });
    } catch (error) {
        console.error('Error logging usage:', error);
        res.status(500).json({ error: 'Failed to log usage' });
    }
});

// API to log deletion usage
app.post('/log-deletion', authenticate, async (req, res) => {
    const { size } = req.body; // Size in MB

    if (!size || size <= 0) {
        return res.status(400).json({ error: 'Invalid size value' });
    }

    try {
        const today = new Date().toISOString().split('T')[0];
        let usage = await Usage.findOne({ username: req.username, date: today });

        if (!usage) {
            usage = new Usage({ username: req.username });
        }

        usage.usedBandwidth = Math.max(0, usage.usedBandwidth - size);
        usage.totalUsedBandwidth = Math.max(0, usage.totalUsedBandwidth - size); // Decrement total bandwidth used
        await usage.save();

        res.status(200).json({ message: 'Deletion logged successfully', usedBandwidth: usage.usedBandwidth });
    } catch (error) {
        console.error('Error logging deletion:', error);
        res.status(500).json({ error: 'Failed to log deletion' });
    }
});

// API to get daily and total usage
app.get('/usage', authenticate, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const usage = await Usage.findOne({ username: req.username, date: today });

        res.status(200).json({
            usedBandwidth: usage ? usage.usedBandwidth : 0,
            remainingBandwidth: usage ? Math.max(0, DAILY_BANDWIDTH_LIMIT - usage.usedBandwidth) : DAILY_BANDWIDTH_LIMIT,
            totalUsedBandwidth: usage ? usage.totalUsedBandwidth : 0,
        });
    } catch (error) {
        console.error('Error fetching usage:', error);
        res.status(500).json({ error: 'Failed to fetch usage' });
    }
});

app.listen(PORT, () => console.log('UsageMntrServ running on port 3002'));
