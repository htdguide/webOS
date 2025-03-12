import React, { useState } from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';
import { FocusWrapper } from '../../interactions/FocusControl/FocusControl.jsx'; // Import FocusWrapper

function Wallpaper() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <FocusWrapper name="Wallpaper">
      <div className="wallpaper">
        {/* Static image (fallback) */}
        <img
          className="wallpaper-fallback"
          src={SequoiaSunriseImage}
          alt="Wallpaper Fallback"
        />

        {/* Background video */}
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
          <source src="/WebintoshHD/Wallpapers/SequoiaSunrise.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </FocusWrapper>
  );
}

export default Wallpaper;