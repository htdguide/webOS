// src/components/Wallpaper/Wallpaper.jsx
import React, { useRef, useContext, useLayoutEffect, useState } from 'react';
import './Wallpaper.css';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';
import { FocusWrapper } from '../../contexts/FocusControl/FocusControl.jsx';
import { VideoSyncContext } from './WallpaperSrc.jsx';

function WallpaperContent({ className }) {
  const videoRef = useRef(null);
  const { mediaStream } = useContext(VideoSyncContext);
  const [hasSynced, setHasSynced] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  useLayoutEffect(() => {
    const vid = videoRef.current;
    if (!vid || !mediaStream || hasSynced) return;

    // “Broadcast” stream onto this <video>
    vid.srcObject = mediaStream;

    const handleLoaded = () => {
      setIsLocalLoaded(true);
      vid.play().catch(() => {});
    };

    // If metadata’s already available (because our master has loaded),
    // do the “loaded” branch immediately before paint
    if (vid.readyState >= 1) {
      handleLoaded();
    } else {
      vid.addEventListener('loadedmetadata', handleLoaded, { once: true });
    }

    setHasSynced(true);
  }, [mediaStream, hasSynced]);

  return (
    <div className={`wallpaper${className ? ` ${className}` : ''}`}>
      {/* always-behind fallback */}
      <img
        className="wallpaper-fallback"
        src={SequoiaSunriseImage}
        alt="Wallpaper Fallback"
      />

      {/* hidden until we know we’ve got a frame */}
      <video
        ref={videoRef}
        className={isLocalLoaded ? 'wallpaper-video' : 'wallpaper-video hidden'}
        muted
        loop
        playsInline
        preload="auto"
        poster={SequoiaSunriseImage}
      />
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
