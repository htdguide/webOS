// src/components/Wallpaper/Wallpaper.jsx
import React, { useRef, useContext, useEffect, useState } from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';
import { VideoSyncContext } from './WallpaperSync.jsx';

function WallpaperContent({ className }) {
  const videoRef = useRef(null);
  const { isVideoLoaded, currentTime } = useContext(VideoSyncContext);
  const [hasSynced, setHasSynced] = useState(false);

  // One-time sync on mount
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !isVideoLoaded || hasSynced) return;
    vid.currentTime = currentTime;
    vid.play().catch(() => {});
    setHasSynced(true);
  }, [isVideoLoaded]);

  return (
    <div className={`wallpaper${className ? ` ${className}` : ''}`}>
      {/* fallback behind everything */}
      <img
        className="wallpaper-fallback"
        src={SequoiaSunriseImage}
        alt="Wallpaper Fallback"
      />

      <video
        ref={videoRef}
        className={isVideoLoaded ? 'wallpaper-video' : 'wallpaper-video hidden'}
        muted
        loop
        playsInline
        preload="auto"
        poster={SequoiaSunriseImage}
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

export function WallpaperPlain(props) {
  return <WallpaperContent {...props} />;
}

export default function Wallpaper(props) {
  return (
    <FocusWrapper name="Wallpaper">
      <WallpaperContent {...props} />
    </FocusWrapper>
  );
}
