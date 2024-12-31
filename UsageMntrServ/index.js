const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3002;
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Usage schema
const usageSchema = new mongoose.Schema({
    username: String,
    date: { type: String, default: () => new Date().toISOString().split("T")[0] }, // Date string
    usedBandwidth: { type: Number, required: true }, // Positive or negative values for usage
});

const Usage = mongoose.model("Usage", usageSchema);

// Middleware to authenticate and decode JWT
const authenticate = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.username = decoded.username;
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        res.status(403).json({ error: "Invalid token" });
    }
};

const DAILY_BANDWIDTH_LIMIT = 10; // Daily bandwidth limit in MB
const TOTAL_BANDWIDTH_LIMIT = 50; // Total bandwidth limit in MB

// Helper function to calculate usage
const calculateUsage = async (username) => {
    const today = new Date().toISOString().split("T")[0];
    const dailyUsage = await Usage.aggregate([
        { $match: { username, date: today } },
        { $group: { _id: null, total: { $sum: "$usedBandwidth" } } },
    ]);

    const totalUsage = await Usage.aggregate([
        { $match: { username } },
        { $group: { _id: null, total: { $sum: "$usedBandwidth" } } },
    ]);

    return {
        dailyUsed: dailyUsage[0]?.total || 0,
        totalUsed: totalUsage[0]?.total || 0,
    };
};

// Middleware to check bandwidth usage
const checkBandwidth = async (req, res, next) => {
    try {
        const { dailyUsed, totalUsed } = await calculateUsage(req.username);

        // Check total bandwidth
        if (totalUsed >= TOTAL_BANDWIDTH_LIMIT) {
            return res.status(403).json({
                error: "Total bandwidth limit exceeded. Please contact support.",
            });
        }

        // Check daily bandwidth
        if (dailyUsed >= DAILY_BANDWIDTH_LIMIT) {
            return res.status(403).json({
                error: "Daily bandwidth limit exceeded. Please wait until tomorrow to upload again.",
            });
        }

        req.usageStats = { dailyUsed, totalUsed };
        next();
    } catch (error) {
        console.error("Error checking bandwidth usage:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// API to log upload usage
app.post("/log-upload", authenticate, checkBandwidth, async (req, res) => {
    const { size } = req.body; // Size in MB

    if (!size || size <= 0) {
        return res.status(400).json({ error: "Invalid size value" });
    }

    try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date
        const usage = new Usage({
            username: req.username,
            date: today, // Include the date
            usedBandwidth: size,
        });

        await usage.save();

        res.status(200).json({ message: "Usage logged successfully" });
    } catch (error) {
        console.error("Error logging usage:", error);
        res.status(500).json({ error: "Failed to log usage" });
    }
});

// API to log deletion usage
app.post("/log-deletion", authenticate, async (req, res) => {
    const { size } = req.body; // Size in MB

    if (!size || size <= 0) {
        return res.status(400).json({ error: "Invalid size value" });
    }

    try {
        const today = new Date().toISOString().split("T")[0]; // Get today's date
        const usage = new Usage({
            username: req.username,
            date: today, // Include the date
            usedBandwidth: -size, // Log negative usage
        });

        await usage.save();

        res.status(200).json({ message: "Deletion logged successfully" });
    } catch (error) {
        console.error("Error logging deletion:", error);
        res.status(500).json({ error: "Failed to log deletion" });
    }
});


// API to get daily and total usage
app.get("/usage", authenticate, async (req, res) => {
    try {
        const { dailyUsed, totalUsed } = await calculateUsage(req.username);

        res.status(200).json({
            usedBandwidth: dailyUsed,
            remainingBandwidth: Math.max(0, DAILY_BANDWIDTH_LIMIT - dailyUsed),
            totalUsedBandwidth: totalUsed,
        });
    } catch (error) {
        console.error("Error fetching usage:", error);
        res.status(500).json({ error: "Failed to fetch usage" });
    }
});

// Start the server
app.listen(PORT, () => console.log(`UsageMntrServ running on port ${PORT}`));
