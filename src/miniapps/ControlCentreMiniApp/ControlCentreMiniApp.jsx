import React, { useState } from 'react';
import './ControlCentreMiniApp.css';
import play from '../../media/assets/play.png';
import fastforward from '../../media/assets/fastforward.png';
import rewind from '../../media/assets/rewind.png';
import volumeIcon from '../../media/assets/volume.png';

function ControlCentreMiniApp() {
  const [volume, setVolume] = useState(50);

  const handleVolumeChange = (event) => {
    setVolume(event.target.value);
  };

  return (
    <div className="control-centre-container">
      {/* Music Control (song info & control buttons) */}
      <div className="music-control-container">
        <span className="song-info">
          Benson Boone – Sorry I'm Here For Something
        </span>
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
              '--white-stop': `${volume}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
