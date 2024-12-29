import React, { useState, useEffect } from 'react';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import { getAllVideos } from '../api/api';

const Home = ({ token }) => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data } = await getAllVideos(token);
      setVideos(data);
    };
    fetchVideos();
  }, [token]);

  return (
    <div>
      {selectedVideo ? (
        <VideoPlayer videoId={selectedVideo} token={token} onClose={() => setSelectedVideo(null)} />
      ) : (
        <VideoGrid videos={videos} onVideoClick={setSelectedVideo} />
      )}
    </div>
  );
};

export default Home;
