// src/components/UploadVideo.js
import React, { useState } from 'react';
import { uploadVideo } from '../api/api';

const UploadVideo = () => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleUpload = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) return alert('You must log in first.');

        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', title);
        formData.append('description', description);

        try {
            await uploadVideo(formData, token);
            alert('Video uploaded successfully!');
        } catch (err) {
            alert('Upload failed');
        }
    };

    return (
        <form onSubmit={handleUpload}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <button type="submit">Upload</button>
        </form>
    );
};

export default UploadVideo;
