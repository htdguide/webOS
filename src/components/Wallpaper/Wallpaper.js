import React from 'react';
import './Wallpaper.css';

function Wallpaper() {
  return (
    <div className="wallpaper">
      <video
        autoPlay
        muted
        loop
        playsInline
        onError={(e) => {
          // If video fails to load, hide it and let the image fallback show
          e.target.style.display = 'none';
        }}
      >
        <source src="/wallpaper/SequoiaSunrise.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <img
        className="wallpaper-fallback"
        src="/wallpaper/SequoiaSunrise.jpg"
        alt="Wallpaper"
      />
    </div>
  );
}

export default Wallpaper;
