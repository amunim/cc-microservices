// src/pages/FullscreenVideo.js
import React, { useState } from 'react';

const FullscreenVideo = ({ video }) => {
  const [currentVideo, setCurrentVideo] = useState(video);

  const handleScroll = (e) => {
    if (e.deltaY > 0 && currentVideo.next) {
      setCurrentVideo(currentVideo.next);
    } else if (e.deltaY < 0 && currentVideo.previous) {
      setCurrentVideo(currentVideo.previous);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'black',
      }}
      onWheel={handleScroll}
    >
      <video
        src={currentVideo.url}
        controls
        autoPlay
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
};

export default FullscreenVideo;
