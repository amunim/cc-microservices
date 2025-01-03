import React, { useState, useEffect, useContext } from "react";
import { Box, CircularProgress, Typography, AppBar, Toolbar, Button } from "@mui/material";
import VideoGrid from "../components/VideoGrid";
import VideoPlayer from "../components/VideoPlayer";
import { getAllVideos } from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const Home = () => {
  const { token, logout } = useContext(AuthContext); // Use AuthContext to get the token and logout function
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use navigate for redirection

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await getAllVideos(token);
        setVideos(data);
      } catch (err) {
        if (err.response?.status === 403) {
          // If the server returns 403, clear token and redirect to login
          logout();
          navigate("/auth", { replace: true });
        } else {
          setError("Failed to fetch videos. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVideos();
    } else {
      setError("Authentication required. Please log in.");
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      {/* Navbar */}
      <AppBar position="static" style={{backgroundColor: "#FF1E0A"}}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => navigate("/")}> 
            Video Library
          </Typography>
          {token && (
            <Button color="inherit" onClick={() => navigate("/upload")}>Upload</Button>
          )}
          {token ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={() => navigate("/auth")}>Login</Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          padding: 2,
        }}
      >
        {loading ? (
          <CircularProgress sx={{ color: "#FF3B30" }} />
        ) : error ? (
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        ) : selectedVideo ? (
          <VideoPlayer
            videoId={selectedVideo}
            token={token}
            onClose={() => setSelectedVideo(null)}
          />
        ) : (
          <>
            <Typography variant="h4" sx={{ mb: 4, color: "#333" }}>
              Video Library
            </Typography>
            <VideoGrid videos={videos} onVideoClick={setSelectedVideo} />
          </>
        )}
      </Box>
    </Box>
  );
};

export default Home;
