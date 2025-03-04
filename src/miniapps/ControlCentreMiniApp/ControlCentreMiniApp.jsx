import React, { useState } from 'react';
import './ControlCentreMiniApp.css';

function ControlCentreMiniApp() {
  const [volume, setVolume] = useState(50);

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  return (
    <div className="control-centre-container">

      {/* Music Control (one line: song info on left, control buttons on right) */}
      <div className="music-control-container">
        <span className="song-info">
          Benson Boone – Sorry I'm Here For Something
        </span>
        <div className="music-buttons">
          <button className="music-btn">
            <img src="prev.png" alt="Previous" />
          </button>
          <button className="music-btn">
            <img src="play.png" alt="Play" />
          </button>
          <button className="music-btn">
            <img src="next.png" alt="Next" />
          </button>
        </div>
      </div>

      <div className="divider" />

      {/* Sound Control */}
      <div className="sound-title">Sound</div>
      <div className="sound-control-container">
        {/* Swap volume.png with mute.png in your real logic if volume===0 */}
        <img
          src="volume.png"
          alt="Volume Icon"
          className="volume-icon"
        />

        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          /*
            Pass a CSS variable to the slider so the track can 
            use it to create a dynamic gradient in CSS.
          */
          style={{ '--volume': `${volume}%` }}
        />
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
