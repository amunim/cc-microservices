import React, { useState } from 'react';
import { Box, Button, TextField, TextareaAutosize, Typography } from '@mui/material';
import { uploadVideo } from '../api/api';

const UploadVideo = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('authToken'); // Using the updated token logic
    if (!token) return alert('You must log in first.');

    if (!file) {
      return alert('Please select a video file to upload.');
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      await uploadVideo(formData, token);
      alert('Video uploaded successfully!');
      setFile(null);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Upload failed');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleUpload}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#555',
          marginBottom: 2,
        }}
      >
        Upload Your Video
      </Typography>
      <Button
        variant="outlined"
        component="label"
        fullWidth
        sx={{
          borderColor: '#FF3B30',
          color: '#FF3B30',
          ':hover': { borderColor: '#FF1E0A', color: '#FF1E0A' },
        }}
      >
        Choose Video File
        <input
          type="file"
          accept="video/*" // Accept only video files
          hidden
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </Button>
      {file && (
        <Typography
          variant="body2"
          sx={{
            color: '#777',
            textAlign: 'center',
            marginTop: 1,
          }}
        >
          {file.name}
        </Typography>
      )}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextareaAutosize
        placeholder="Description"
        minRows={4}
        style={{
          width: '100%',
          borderRadius: 4,
          padding: 10,
          fontFamily: 'inherit',
          fontSize: '16px',
          border: '1px solid #ccc',
        }}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        sx={{
          bgcolor: '#FF3B30',
          ':hover': { bgcolor: '#FF1E0A' },
        }}
      >
        Upload
      </Button>
    </Box>
  );
};

export default UploadVideo;
