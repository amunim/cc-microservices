// src/components/VideoPlayer.js
import React, { useEffect, useRef, useState } from 'react';
import { getVideoDetails } from '../api/api';

const VideoPlayer = ({ videoId, onClose, token, onNext, onPrevious }) => {
  const videoRef = useRef(null);
  const [videoDetails, setVideoDetails] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleVideoClick = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPaused(false);
    } else {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const { data } = await getVideoDetails(videoId);
        setVideoDetails(data);
      } catch (err) {
        console.error('Failed to fetch video details:', err);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        flexDirection: 'column',
      }}
    >
      <video
        ref={videoRef}
        src={videoDetails?.url}
        controls={false}
        autoPlay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          maxHeight: '100vh',
        }}
        onClick={handleVideoClick}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          color: 'white',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#555',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: 'white',
              marginRight: '10px',
            }}
          >
            {videoDetails?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3>{videoDetails?.title || 'Loading...'}</h3>
        </div>
        <p>{videoDetails?.description || ''}</p>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          color: 'white',
          cursor: 'pointer',
          fontSize: '24px',
        }}
        onClick={onClose}
      >
        ✕
      </div>
    </div>
  );
};

export default VideoPlayer;
