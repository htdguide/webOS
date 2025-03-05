import React, { useState } from 'react';
import SliderControlWidgetAsset from './SliderControlWidgetAsset';
import brightnessIcon from '../../media/assets/volume.png';

function DisplayControl() {
  const [brightness, setBrightness] = useState(50);

  const handleBrightnessChange = (newValue) => {
    setBrightness(newValue);
  };

  return (
    <div>
      <SliderControlWidgetAsset
        label="Display"
        icon={brightnessIcon}
        value={brightness}
        onChange={handleBrightnessChange}
        min={0}
        max={100}
        fadeThumbBorder={true}
        removeFocusOutline={true}
      />
    </div>
  );
}

export default DisplayControl;
