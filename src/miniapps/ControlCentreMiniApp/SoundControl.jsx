import React, { useState } from 'react';
import SliderControlWidgetAsset from './SliderControlWidgetAsset';
import volumeIcon from '../../media/assets/volume.png';

function SoundControl() {
  const [volume, setVolume] = useState(50);

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
  };

  return (
    <div>
      <SliderControlWidgetAsset
        label="Sound"
        icon={volumeIcon}
        value={volume}
        onChange={handleVolumeChange}
        min={3}
        max={98}
        fadeThumbBorder={true}
        removeFocusOutline={true}
      />
    </div>
  );
}

export default SoundControl;
