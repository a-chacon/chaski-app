import React from 'react';
import ReactPlayer from 'react-player/lazy';

interface VideoPlayerProps {
  url: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url }) => {
  return (
    <ReactPlayer
      url={url}
      controls={true}
      width="100%"
      height="100%"
      light={true}
    />
  );
};

export default VideoPlayer;

