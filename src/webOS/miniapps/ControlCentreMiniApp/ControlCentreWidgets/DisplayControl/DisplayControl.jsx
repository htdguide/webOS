import React from 'react';
import { useBrightness } from '../../../../drivers/DisplayController/DisplayController'; // adjust the relative path as needed
import SliderControlWidgetAsset from '../../WidgetsComponents/SliderControl/SliderControlAsset';
import brightnessIcon from '../../../../media/assets/brightness.png';

function DisplayControl() {
  const { brightness, setBrightness } = useBrightness();

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
        min={3}
        max={97}
        fadeThumbBorder={true}
        removeFocusOutline={true}
      />
    </div>
  );
}

export default DisplayControl;
