import React, { useState, useEffect, useRef } from 'react';
import './ControlCentreMiniApp.css';
import play from '../../media/assets/play.png';
import pause from '../../media/assets/pause.png';
import fastforward from '../../media/assets/fastforward.png';
import rewind from '../../media/assets/rewind.png';
import volumeIcon from '../../media/assets/volume.png';
import albumThumbnail from '../../media/assets/album.jpg';

function ControlCentreMiniApp() {
  // Volume
  const [volume, setVolume] = useState(50);
  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };
  const thumbBorderOpacity =
    volume < 20 ? 0 : volume < 20 ? (volume - 20) / 60 : 1;

  // Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  // Fake timeline (in seconds)
  const [currentTime, setCurrentTime] = useState(72); // 1m12s
  const totalTime = 204; // 3m24s

  // Song info
  const songTitle = "Keep Moving";
  const artistName = "Jungle";

  // For marquee (song title)
  const titleContainerRef = useRef(null);
  const titleTextRef = useRef(null);
  const [marqueeStyle, setMarqueeStyle] = useState({});
  const [dynamicKeyframes, setDynamicKeyframes] = useState("");

  // For marquee (artist)
  const artistContainerRef = useRef(null);
  const artistTextRef = useRef(null);
  const [artistMarqueeStyle, setArtistMarqueeStyle] = useState({});
  const [artistDynamicKeyframes, setArtistDynamicKeyframes] = useState("");

  const speed = 50; // pixels per second
  const pauseTime = 3; // seconds to wait before sliding

  // --- MARQUEE FOR SONG TITLE ---
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
    return () => {
      window.removeEventListener('resize', updateMarquee);
    };
  }, [songTitle]);

  // --- MARQUEE FOR ARTIST ---
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
    return () => {
      window.removeEventListener('resize', updateArtistMarquee);
    };
  }, [artistName]);

  // --- PROGRESS SLIDER HANDLING ---
  const handleProgressChange = (e) => {
    setCurrentTime(Number(e.target.value));
  };

  // Convert seconds to mm:ss format
  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Style for the progress bar background (black for “played”, gray for “remaining”)
  const progressPercent = (currentTime / totalTime) * 100;
  const progressBarStyle = {
    background: `linear-gradient(to right, 
      #000 0%, 
      #000 ${progressPercent}%, 
      #ccc ${progressPercent}%, 
      #ccc 100%)`
  };

  return (
    <div className="control-centre-container">
      {/* Keyframe styles for the marquee animations */}
      {dynamicKeyframes && <style>{dynamicKeyframes}</style>}
      {artistDynamicKeyframes && <style>{artistDynamicKeyframes}</style>}

      {/* TOP SECTION: Album art, Title, Artist */}
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

      {/* MIDDLE SECTION: Progress bar + times */}
      <div className="progress-container">
        <div className="time-text">{formatTime(currentTime)}</div>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={totalTime}
          value={currentTime}
          onChange={handleProgressChange}
          style={progressBarStyle}
        />
        <div className="time-text">{formatTime(totalTime)}</div>
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

      <div className="divider" />

      {/* SOUND SECTION */}
      <div className="sound-title">Sound</div>
      <div className="sound-control-container">
        <div className="volume-slider-container">
          <img
            src={volumeIcon}
            alt="Volume Icon"
            className="volume-icon-ontrack"
          />
          <input
            type="range"
            className="volume-slider"
            min="3"
            max="98"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              '--volume': `${volume}%`,
              '--white-stop': `${volume}%`,
              '--thumb-border-opacity': thumbBorderOpacity,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
