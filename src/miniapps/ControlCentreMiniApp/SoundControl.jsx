import React, { useState } from 'react';
import './SoundControl.css';
import volumeIcon from '../../media/assets/volume.png';

function SoundControl() {
  const [volume, setVolume] = useState(50);

  const handleVolumeChange = (event) => {
    setVolume(Number(event.target.value));
  };

  const thumbBorderOpacity =
    volume < 20 ? 0 : volume < 20 ? (volume - 20) / 60 : 1;

  return (
    <div className="sound-control-container-outer">
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

export default SoundControl;
