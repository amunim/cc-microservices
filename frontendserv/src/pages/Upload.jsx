import React from 'react';
import { Box, Typography } from '@mui/material';
import UploadVideo from '../components/UploadVideo';

const Upload = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9f9f9',
        padding: 3,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: '#333',
          marginBottom: 4,
        }}
      >
        Upload Video
      </Typography>
      <UploadVideo />
    </Box>
  );
};

export default Upload;
