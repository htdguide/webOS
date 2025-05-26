// src/components/Wallpaper/WallpaperSrc.jsx
import React, { createContext, useState, useEffect, useRef } from 'react';

export const VideoSyncContext = createContext({
  isVideoLoaded: false,
  currentTime: 0,
  mediaStream: null,
});

export function WallpaperSrc({ children }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [mediaStream, setMediaStream] = useState(null);

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

  return (
    <VideoSyncContext.Provider value={{ isVideoLoaded, currentTime, mediaStream }}>
      {children}

      {/* Hidden master video, drives the stream */}
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
