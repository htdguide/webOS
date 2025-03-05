import React, { useState, useEffect, useRef } from 'react';
import './MusicControl.css';
import play from '../../../../media/assets/play.png';
import pause from '../../../../media/assets/pause.png';
import fastforward from '../../../../media/assets/fastforward.png';
import rewind from '../../../../media/assets/rewind.png';
import albumThumbnail from '../../../../media/assets/album.jpg';

function MusicControl() {
  // PLAYBACK
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  // TIMELINE in seconds
  const [currentTime, setCurrentTime] = useState(72);
  const totalTime = 204; // 3m24s

  // SONG INFO
  const songTitle = "Keep Moving";
  const artistName = "Jungle - Loving In Stereo";

  // Marquee for Song Title
  const titleContainerRef = useRef(null);
  const titleTextRef = useRef(null);
  const [marqueeStyle, setMarqueeStyle] = useState({});
  const [dynamicKeyframes, setDynamicKeyframes] = useState("");

  // Marquee for Artist
  const artistContainerRef = useRef(null);
  const artistTextRef = useRef(null);
  const [artistMarqueeStyle, setArtistMarqueeStyle] = useState({});
  const [artistDynamicKeyframes, setArtistDynamicKeyframes] = useState("");

  const speed = 50; // px/sec
  const pauseTime = 3; // seconds before scrolling

  // Title marquee
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
        setDynamicKeyframes("");
      }
    }
    updateMarquee();
    window.addEventListener('resize', updateMarquee);
    return () => window.removeEventListener('resize', updateMarquee);
  }, [songTitle]);

  // Artist marquee
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
        setArtistDynamicKeyframes("");
      }
    }
    updateArtistMarquee();
    window.addEventListener('resize', updateArtistMarquee);
    return () => window.removeEventListener('resize', updateArtistMarquee);
  }, [artistName]);

  // Progress bar changes
  const handleProgressChange = (e) => {
    setCurrentTime(Number(e.target.value));
  };

  // Convert seconds to mm:ss
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // For the progress bar background
  const progressPercent = (currentTime / totalTime) * 100;
  const progressBarStyle = {
    background: `linear-gradient(to right,
      #000 0%,
      #000 ${progressPercent}%,
      #ccc ${progressPercent}%,
      #ccc 100%)`
  };

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
              {songTitle}
            </div>
          </div>
          <div className="song-artist" ref={artistContainerRef}>
            <div
              className="song-artist-text"
              ref={artistTextRef}
              style={artistMarqueeStyle}
            >
              {artistName}
            </div>
          </div>
        </div>
      </div>

      {/* Progress/Timeline in the middle */}
      <div className="progress-container">
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={totalTime}
          value={currentTime}
          onChange={handleProgressChange}
          style={progressBarStyle}
        />
        <div className="time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalTime)}</span>
        </div>
      </div>

      {/* BOTTOM SECTION: Playback buttons */}
      <div className="music-buttons">
        <button className="music-btn">
          <img src={rewind} alt="Previous" />
        </button>
        <button className="music-btn" onClick={handlePlayToggle}>
          <img src={isPlaying ? pause : play} alt={isPlaying ? "Pause" : "Play"} />
        </button>
        <button className="music-btn">
          <img src={fastforward} alt="Next" />
        </button>
      </div>
    </div>
  );
}

export default MusicControl;
