import React, { useState } from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';

function Wallpaper() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div className="wallpaper">
      {/* The static image is always in the DOM, behind the video */}
      <img
        className="wallpaper-fallback"
        src={SequoiaSunriseImage}
        alt="Wallpaper Fallback"
      />

      {/* The video is placed absolutely on top. We only show it once loaded.
          If the video fails to load, it remains hidden and the fallback image shows. */}
      <video
        className={isVideoLoaded ? 'wallpaper-video' : 'wallpaper-video hidden'}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setIsVideoLoaded(true)}
        onError={(e) => {
          console.error('Video failed to load:', e);
        }}
      >
        <source src='/WebintoshHD/Wallpapers/SequoiaSunrise.mp4' type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default Wallpaper;
