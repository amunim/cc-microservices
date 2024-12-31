import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import UploadVideo from "../components/UploadVideo";
import VideoGrid from "../components/VideoGrid";
import { getUsageStats, getUserVideos, deleteVideo } from "../api/api";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  const fetchUsageStats = async () => {
    try {
      const { data } = await getUsageStats(token);
      setUsageStats(data);
    } catch (err) {
      setError("Failed to fetch usage stats.");
    }
  };

  const fetchUserVideos = async () => {
    try {
      const { data } = await getUserVideos(token);
      setVideos(data); // Filter videos uploaded by the current user
    } catch (err) {
      setError("Failed to fetch user videos.");
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteVideo(videoId, token);
      setVideos((prev) => prev.filter((video) => video._id !== videoId));
    } catch (err) {
      alert("Failed to delete the video.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchUsageStats(), fetchUserVideos()]);
      setLoading(false);
    };
    fetchData();
  }, [token]);

  const getCardBackgroundColor = (used, total) => {
    const usagePercentage = (used / total) * 100;
    if (usagePercentage > 90) return "#ffcccc"; // Red
    if (usagePercentage > 80) return "#fff4cc"; // Yellow
    return "#e6ffe6"; // Green
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 3,
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      {usageStats && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: 800,
            gap: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              padding: 2,
              borderRadius: 2,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: getCardBackgroundColor(
                usageStats.usedBandwidth,
                usageStats.remainingBandwidth + usageStats.usedBandwidth
              ),
            }}
          >
            <Typography variant="h6" sx={{ color: "#333", mb: 1 }}>
              Today's Bandwidth
            </Typography>
            <Typography variant="body1" sx={{ color: "#555" }}>
              Used: {usageStats.usedBandwidth.toFixed(2)} MB
            </Typography>
            <Typography variant="body1" sx={{ color: "#555" }}>
              Remaining: {usageStats.remainingBandwidth.toFixed(2)} MB
            </Typography>
          </Box>
          <Box
            sx={{
              padding: 2,
              borderRadius: 2,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              backgroundColor: getCardBackgroundColor(
                usageStats.totalUsedBandwidth,
                50 // Total Bandwidth Limit
              ),
            }}
          >
            <Typography variant="h6" sx={{ color: "#333", mb: 1 }}>
              Total Bandwidth
            </Typography>
            <Typography variant="body1" sx={{ color: "#555" }}>
              Used: {usageStats.totalUsedBandwidth.toFixed(2)} MB
            </Typography>
            <Typography variant="body1" sx={{ color: "#555" }}>
              Remaining: {(50 - usageStats.totalUsedBandwidth).toFixed(2)} MB
            </Typography>
          </Box>
        </Box>
      )}
      <Typography variant="h4" sx={{ mb: 3 }}>
        Upload Video
      </Typography>
      <UploadVideo />
      <Typography variant="h5" sx={{ mt: 5, mb: 3 }}>
        Your Videos
      </Typography>
      <VideoGrid
        videos={videos} // Only user's videos
        onVideoClick={(id) => navigate(`/videos/${id}`)}
        onDelete={handleDeleteVideo}
        userId={true} // Pass userId to control delete button visibility
      />
    </Box>
  );
};

export default Upload;
