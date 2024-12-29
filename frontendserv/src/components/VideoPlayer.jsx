import React, { useEffect, useRef, useState } from 'react';
import { getVideoDetails } from '../api/api';

const VideoPlayer = ({ videoId, token, onClose, onNext, onPrevious }) => {
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
        const { data } = await getVideoDetails(videoId, token);
        setVideoDetails(data);
      } catch (err) {
        console.error('Failed to fetch video details:', err);
      }
    };

    fetchVideoDetails();
  }, [videoId, token]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoDetails?.url}
        autoPlay
        loop
        onClick={handleVideoClick}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Video Info */}
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
            marginBottom: 10,
          }}
        >
          {/* User Avatar */}
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: '#555',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
              marginRight: 10,
            }}
          >
            {videoDetails?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3 style={{ margin: 0 }}>{videoDetails?.title || 'Loading...'}</h3>
        </div>
        <p style={{ margin: 0 }}>{videoDetails?.description || ''}</p>
      </div>

      {/* Close Button */}
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

      {/* Navigation Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 10,
          transform: 'translateY(-50%)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 30,
        }}
        onClick={onPrevious}
      >
        ◀
      </div>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: 10,
          transform: 'translateY(-50%)',
          color: 'white',
          cursor: 'pointer',
          fontSize: 30,
        }}
        onClick={onNext}
      >
        ▶
      </div>
    </div>
  );
};

export default VideoPlayer;
