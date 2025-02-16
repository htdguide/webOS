import React from 'react';
import './Wallpaper.css';
import SequoiaSunriseVideo from '../../media/wallpaper/SequoiaSunrise.mp4';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';

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
        <source src={SequoiaSunriseVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <img
        className="wallpaper-fallback"
        src={SequoiaSunriseImage}
        alt="Wallpaper"
      />
    </div>
  );
}

export default Wallpaper;
