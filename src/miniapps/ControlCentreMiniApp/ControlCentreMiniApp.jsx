import React, { useState, useRef, useLayoutEffect } from 'react';
import './ControlCentreMiniApp.css';
import play from '../../media/assets/play.png';
import fastforward from '../../media/assets/fastforward.png';
import rewind from '../../media/assets/rewind.png';
import volumeIcon from '../../media/assets/volume.png';

function ControlCentreMiniApp() {
  const [volume, setVolume] = useState(50);
  const [sliderWidth, setSliderWidth] = useState(0);
  const sliderRef = useRef(null);
  const thumbRadius = 9; // half of thumb's 18px width

  useLayoutEffect(() => {
    const updateSliderWidth = () => {
      if (sliderRef.current) {
        setSliderWidth(sliderRef.current.offsetWidth);
      }
    };
    updateSliderWidth();
    window.addEventListener('resize', updateSliderWidth);
    return () => window.removeEventListener('resize', updateSliderWidth);
  }, []);

  // Compute the current fill position in pixels
  const computedFill = (volume / 100) * sliderWidth;
  // Clamp the fill so it never goes below the thumb's center (thumbRadius) or beyond the track's limit
  const effectiveFill =
    sliderWidth > 0
      ? Math.min(Math.max(computedFill, thumbRadius), sliderWidth - thumbRadius)
      : thumbRadius;
  // Convert to a percentage of the slider width
  const whiteStopPercentage =
    sliderWidth > 0 ? (effectiveFill / sliderWidth) * 100 : 0;

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
            ref={sliderRef}
            type="range"
            className="volume-slider"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={{
              '--volume': `${volume}%`,
              '--white-stop': `${whiteStopPercentage}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
