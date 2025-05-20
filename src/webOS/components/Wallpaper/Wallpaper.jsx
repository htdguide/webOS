// src/components/Wallpaper/Wallpaper.jsx
import React, { useState } from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';

/**
 * The raw wallpaper markup — no FocusWrapper.
 * Accepts `className` to merge with `.wallpaper`.
 */
function WallpaperContent({ className }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  return (
    <div className={`wallpaper${className ? ` ${className}` : ''}`}>
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
        <source
          src="/WebintoshHD/Wallpapers/SequoiaSunrise.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

/**
 * Exported for when you want the wallpaper **without** FocusWrapper.
 */
export function WallpaperPlain(props) {
  return <WallpaperContent {...props} />;
}

/**
 * Default export: wraps the above in FocusWrapper as before.
 */
export default function Wallpaper(props) {
  return (
    <FocusWrapper name="Wallpaper">
      <WallpaperContent {...props} />
    </FocusWrapper>
  );
}
