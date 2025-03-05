import React, { useState } from 'react';
import './DisplayControl.css';

function DisplayControl() {
  const [brightness, setBrightness] = useState(50);

  const handleBrightnessChange = (e) => {
    setBrightness(Number(e.target.value));
  };

  return (
    <div className="display-control-container">
      <div className="display-title">Display</div>
      <input
        type="range"
        className="display-slider"
        min="0"
        max="100"
        value={brightness}
        onChange={handleBrightnessChange}
      />
    </div>
  );
}

export default DisplayControl;
