import React, { useState, useEffect, useRef } from 'react';
import './ControlCentreMiniApp.css';
import play from '../../media/assets/play.png';
import fastforward from '../../media/assets/fastforward.png';
import rewind from '../../media/assets/rewind.png';
import volumeIcon from '../../media/assets/volume.png';
import albumThumbnail from '../../media/assets/album.jpg';

function ControlCentreMiniApp() {
  const [volume, setVolume] = useState(50);

  // Example song details
  const songTitle = "Keep Moving";
  const artistName = "Jungle";

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };

  // Compute thumb border opacity (example logic)
  const thumbBorderOpacity =
    volume < 20 ? 0 : volume < 20 ? (volume - 20) / 60 : 1;

  // Adaptive marquee logic with a 3-second pause for the song title
  const titleContainerRef = useRef(null);
  const titleTextRef = useRef(null);
  const [marqueeStyle, setMarqueeStyle] = useState({});
  const [dynamicKeyframes, setDynamicKeyframes] = useState("");

  // Adaptive marquee logic with a 3-second pause for the artist name
  const artistContainerRef = useRef(null);
  const artistTextRef = useRef(null);
  const [artistMarqueeStyle, setArtistMarqueeStyle] = useState({});
  const [artistDynamicKeyframes, setArtistDynamicKeyframes] = useState("");

  const speed = 50; // pixels per second
  const pauseTime = 3; // seconds to wait before sliding

  // Update marquee for song title
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
        setMarqueeStyle({
          animation: 'none'
        });
        setDynamicKeyframes("");
      }
    }
    updateMarquee();
    window.addEventListener('resize', updateMarquee);
    return () => {
      window.removeEventListener('resize', updateMarquee);
    };
  }, [songTitle]);

  // Update marquee for artist name
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
        setArtistMarqueeStyle({
          animation: 'none'
        });
        setArtistDynamicKeyframes("");
      }
    }
    updateArtistMarquee();
    window.addEventListener('resize', updateArtistMarquee);
    return () => {
      window.removeEventListener('resize', updateArtistMarquee);
    };
  }, [artistName]);

  return (
    <div className="control-centre-container">
      {dynamicKeyframes && <style>{dynamicKeyframes}</style>}
      {artistDynamicKeyframes && <style>{artistDynamicKeyframes}</style>}
      {/* Music Control (song info & control buttons) */}
      <div className="music-control-container">
        {/* Left section: album art + song info */}
        <div className="music-info">
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

        {/* Right section: playback buttons */}
        <div className="music-buttons">
          <button className="music-btn">
            <img src={rewind} alt="Previous" />
          </button>
          <button className="music-btn">
            <img src={play} alt="Play" />
          </button>
          <button className="music-btn">
            <img src={fastforward} alt="Next" />
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Sound Control */}
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
