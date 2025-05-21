// src/components/WallpaperSync.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';

/**
 * Provides isVideoLoaded + currentTime from a single hidden master video.
 */
export const VideoSyncContext = createContext({
  isVideoLoaded: false,
  currentTime: 0,
});

export function WallpaperSync({ children }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      setIsVideoLoaded(true);
      vid.play().catch(() => {});
    };
    const onTimeUpdate = () => {
      setCurrentTime(vid.currentTime);
    };

    vid.addEventListener('loadeddata', onLoaded);
    vid.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      vid.removeEventListener('loadeddata', onLoaded);
      vid.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  return (
    <VideoSyncContext.Provider value={{ isVideoLoaded, currentTime }}>
      {children}

      {/* 
        Hidden master video:
        • preload="auto" so browser fetches it ASAP  
        • CSS makes it invisible but still loading
      */}
      <video
        ref={videoRef}
        src="/WebintoshHD/Wallpapers/SequoiaSunrise.mp4"
        type="video/mp4"
        muted
        loop
        playsInline
        preload="auto"
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
    </VideoSyncContext.Provider>
  );
}
