// src/components/Wallpaper/Wallpaper.jsx

// ── Area 1: Imports & Signature ────────────────────────────────────────────────
// 1.1: React, CSS, manager, and context
import React, { useRef, useContext, useLayoutEffect, useState } from 'react';
import './Wallpaper.css';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';
import { VideoSyncContext } from './WallpaperSrc.jsx';
import { wallpaperVideoSrc, wallpaperFallbackImage } from './WallpaperManager.jsx';


// 1.2: Define WallpaperContent component
function WallpaperContent({ className }) {
  // ── Area 2: Synchronization Logic ────────────────────────────────────────────
  // 2.1: Refs, context values, and local loaded/synced flags
  const videoRef = useRef(null);
  const { mediaStream, isVideoLoaded, currentTime } = useContext(VideoSyncContext);
  const [hasSynced, setHasSynced] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  // 2.2: Sync stream or fallback src before paint
  useLayoutEffect(() => {
    const vid = videoRef.current;
    if (!vid || hasSynced) return;

    let assigned = false;

    // use captured stream when available
    if (mediaStream) {
      vid.srcObject = mediaStream;
      assigned = true;
    }
    // fallback for Safari/iOS: assign direct video src once master has loaded
    else if (isVideoLoaded) {
      vid.src = wallpaperVideoSrc;
      assigned = true;
    }

    if (!assigned) return;

    const handleLoaded = () => {
      setIsLocalLoaded(true);
      // sync time for fallback branch
      if (!mediaStream && currentTime) {
        vid.currentTime = currentTime;
      }
      vid.play().catch(() => {});
    };

    if (vid.readyState >= 1) {
      handleLoaded();
    } else {
      vid.addEventListener('loadedmetadata', handleLoaded, { once: true });
    }

    setHasSynced(true);
  }, [mediaStream, isVideoLoaded, currentTime, hasSynced]);


  // 2.3: Render fallback image and video element
  return (
    <div className={`wallpaper${className ? ` ${className}` : ''}`}>
      {/* fallback image always behind */}
      <img
        className="wallpaper-fallback"
        src={wallpaperFallbackImage}
        alt="Wallpaper Fallback"
      />
      <video
        ref={videoRef}
        className={isLocalLoaded ? 'wallpaper-video' : 'wallpaper-video hidden'}
        muted
        autoPlay
        loop
        playsInline
        webkit-playsinline="true"
        preload="auto"
        poster={wallpaperFallbackImage}
      />
    </div>
  );
}


// ── Area 3: Exported Wrappers ─────────────────────────────────────────────────
// 3.1: Plain wallpaper (no focus tracking)
export function WallpaperPlain(props) {
  return <WallpaperContent {...props} />;
}

// 3.2: Default wallpaper with focus control
export default function Wallpaper(props) {
  return (
    <FocusWrapper name="Wallpaper">
      <WallpaperContent {...props} />
    </FocusWrapper>
  );
}
