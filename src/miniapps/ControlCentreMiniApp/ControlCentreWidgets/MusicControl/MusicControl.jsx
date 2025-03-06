// MusicControl.jsx

import React, { useState, useRef, useEffect } from 'react';
import './MusicControl.css';

// Icons
import playIcon from '../../../../media/assets/play.png';
import pauseIcon from '../../../../media/assets/pause.png';
import fastForwardIcon from '../../../../media/assets/fastforward.png';
import rewindIcon from '../../../../media/assets/rewind.png';
import defaultThumbnail from '../../../../media/assets/album.jpg';

// Import the music service
import { useMusicService } from '../../../../services/MusicService/MusicService';

function MusicControl() {
  // Grab data/functions from the MusicService
  const {
    isPlaying,
    currentTime,
    duration,
    trackInfo,
    togglePlay,
    handleNext,
    handlePrev,
    seek,
  } = useMusicService();

  // For the slider background
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const progressBarStyle = {
    background: `linear-gradient(to right,
      #000 0%,
      #000 ${progressPercent}%,
      #888 ${progressPercent}%,
      #888 80%)`
  };

  // Convert seconds to mm:ss, cutting off milliseconds
  const formatTime = (secs) => {
    if (!secs || secs < 0) secs = 0;
    const totalSeconds = Math.floor(secs);       // <-- Truncate decimal part
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // MARQUEE for Title
  const titleContainerRef = useRef(null);
  const titleTextRef = useRef(null);
  const [marqueeStyle, setMarqueeStyle] = useState({});
  const [dynamicKeyframes, setDynamicKeyframes] = useState('');

  // MARQUEE for Artist
  const artistContainerRef = useRef(null);
  const artistTextRef = useRef(null);
  const [artistMarqueeStyle, setArtistMarqueeStyle] = useState({});
  const [artistDynamicKeyframes, setArtistDynamicKeyframes] = useState('');

  const speed = 50; // px/sec
  const pauseTime = 3; // seconds before scrolling

  // Title marquee effect
  useEffect(() => {
    function updateMarquee() {
      const containerWidth = titleContainerRef.current?.offsetWidth || 0;
      const textWidth = titleTextRef.current?.scrollWidth || 0;
      if (textWidth > containerWidth) {
        const slideDuration = textWidth / speed;
        const totalDuration = slideDuration + pauseTime;
        const pausePercent = (pauseTime / totalDuration) * 100;
        const keyframes = `
          @keyframes marquee-dynamic {
            0% { transform: translateX(0); }
            ${pausePercent}% { transform: translateX(0); }
            100% { transform: translateX(-${textWidth}px); }
          }
        `;
        setDynamicKeyframes(keyframes);
        setMarqueeStyle({
          animation: `marquee-dynamic ${totalDuration}s linear infinite`
        });
      } else {
        setMarqueeStyle({ animation: 'none' });
        setDynamicKeyframes('');
      }
    }
    updateMarquee();
    window.addEventListener('resize', updateMarquee);
    return () => window.removeEventListener('resize', updateMarquee);
  }, [trackInfo.title]);

  // Artist marquee effect
  useEffect(() => {
    function updateArtistMarquee() {
      const containerWidth = artistContainerRef.current?.offsetWidth || 0;
      const textWidth = artistTextRef.current?.scrollWidth || 0;
      if (textWidth > containerWidth) {
        const slideDuration = textWidth / speed;
        const totalDuration = slideDuration + pauseTime;
        const pausePercent = (pauseTime / totalDuration) * 100;
        const keyframes = `
          @keyframes marquee-dynamic-artist {
            0% { transform: translateX(0); }
            ${pausePercent}% { transform: translateX(0); }
            100% { transform: translateX(-${textWidth}px); }
          }
        `;
        setArtistDynamicKeyframes(keyframes);
        setArtistMarqueeStyle({
          animation: `marquee-dynamic-artist ${totalDuration}s linear infinite`
        });
      } else {
        setArtistMarqueeStyle({ animation: 'none' });
        setArtistDynamicKeyframes('');
      }
    }
    updateArtistMarquee();
    window.addEventListener('resize', updateArtistMarquee);
    return () => window.removeEventListener('resize', updateArtistMarquee);
  }, [trackInfo.artist]);

  // Slider change => seek
  const handleProgressChange = (e) => {
    seek(Number(e.target.value));
  };

  // Use the extracted albumArt if it exists, otherwise a default
  const albumThumbnail = trackInfo.albumArt || defaultThumbnail;

  return (
    <div className="music-control-container">
      {/* Dynamic Keyframes for Marquee */}
      {dynamicKeyframes && <style>{dynamicKeyframes}</style>}
      {artistDynamicKeyframes && <style>{artistDynamicKeyframes}</style>}

      {/* TOP SECTION: Album + Title + Artist */}
      <div className="music-info-top">
        <div className="album-artwork">
          <img src={albumThumbnail} alt="Album Artwork" />
        </div>
        <div className="song-details">
          <div className="song-title-container" ref={titleContainerRef}>
            <div
              className="song-title-text"
              ref={titleTextRef}
              style={marqueeStyle}
            >
              {trackInfo.title || 'Unknown Title'}
            </div>
          </div>
          <div className="song-artist" ref={artistContainerRef}>
            <div
              className="song-artist-text"
              ref={artistTextRef}
              style={artistMarqueeStyle}
            >
              {trackInfo.artist || 'Unknown Artist'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleProgressChange}
          style={progressBarStyle}
        />
        <div className="time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback buttons */}
      <div className="music-buttons">
        <button className="music-btn" onClick={handlePrev}>
          <img src={rewindIcon} alt="Previous" />
        </button>
        <button className="music-btn" onClick={togglePlay}>
          <img
            src={isPlaying ? pauseIcon : playIcon}
            alt={isPlaying ? "Pause" : "Play"}
          />
        </button>
        <button className="music-btn" onClick={handleNext}>
          <img src={fastForwardIcon} alt="Next" />
        </button>
      </div>
    </div>
  );
}

export default MusicControl;
