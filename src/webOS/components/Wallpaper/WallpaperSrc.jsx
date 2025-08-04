// src/components/Wallpaper/WallpaperSrc.jsx

// ── Area 1: Context Setup ─────────────────────────────────────────────────────
// 1.1: React hooks and manager import
import React, { createContext, useState, useEffect, useRef } from 'react';
import { wallpaperVideoSrc } from './WallpaperManager.jsx';

// 1.2: Create and export VideoSyncContext with default values
export const VideoSyncContext = createContext({
  isVideoLoaded: false,
  currentTime: 0,
  mediaStream: null,
});


// ── Area 2: WallpaperSrc Provider ──────────────────────────────────────────────
// 2.1: Initialize refs and state for loading and stream
export function WallpaperSrc({ children }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);

  // 2.2: On load, play hidden video and capture its stream if supported
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      setIsVideoLoaded(true);
      vid.play().catch(() => {});
      if (!mediaStream && typeof vid.captureStream === 'function') {
        const stream = vid.captureStream();
        setMediaStream(stream);
      }
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
  }, [mediaStream]);

  // 2.3: Provide context and render hidden master video offscreen
  return (
    <VideoSyncContext.Provider value={{ isVideoLoaded, currentTime, mediaStream }}>
      {children}
      <video
        ref={videoRef}
        src={wallpaperVideoSrc}
        muted
        autoPlay
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: 1,
          height: 1,
          visibility: 'hidden',
        }}
      />
    </VideoSyncContext.Provider>
  );
}

// 3.1: Default export
export default WallpaperSrc;
