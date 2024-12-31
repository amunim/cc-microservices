import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getVideoDetails } from "../api/api";
import { AuthContext } from "../contexts/AuthContext";

const VideoDetail = () => {
  const { id } = useParams(); // Extract the video ID from the URL
  const { token } = useContext(AuthContext); // Access token from AuthContext
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await getVideoDetails(id, token);
        setVideo(data);
      } catch (err) {
        setError("Failed to fetch video details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, token]);

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

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#000",
      }}
    >
      <IconButton
        sx={{ position: "absolute", top: 16, right: 16, color: "#fff" }}
        onClick={() => navigate("/")}
      >
        <CloseIcon />
      </IconButton>
      {video && (
        <video
          src={video.url}
          controls
          autoPlay
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </Box>
  );
};

export default VideoDetail;
