import React from 'react';
import { Card, CardMedia, Grid } from '@mui/material';

const VideoGrid = ({ videos, onVideoClick }) => (
  <Grid container spacing={2}>
    {videos.map((video) => (
      <Grid item xs={6} sm={4} md={3} key={video._id}>
        <Card onClick={() => onVideoClick(video._id)}>
          <CardMedia
            component="img"
            style={{cursor: 'pointer'}}
            image={video.thumbnail || '/placeholder.svg'}
            alt={video.title}
            sx={{ aspectRatio: '9/16' }}
          />
        </Card>
      </Grid>
    ))}
  </Grid>
);

export default VideoGrid;
