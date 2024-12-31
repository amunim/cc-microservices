import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const VideoGrid = ({ videos, onVideoClick, onDelete, userId }) => (
  <Grid container spacing={2}>
    {videos.map((video) => (
      <Grid item xs={6} sm={4} md={3} key={video._id}>
        <Card
          sx={{
            position: "relative",
            cursor: "pointer",
            "&:hover": { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)" },
          }}
        >
          <CardMedia
            component="img"
            image={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            sx={{ aspectRatio: "16/9" }}
            onClick={() => onVideoClick(video._id)} // Navigate to video details
          />
          <CardContent>
            <Typography variant="body2" color="textPrimary" noWrap>
              {video.title}
            </Typography>
          </CardContent>
          {userId && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                zIndex: 1,
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  onDelete(video._id); // Trigger delete callback
                }}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                }}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          )}
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default VideoGrid;
