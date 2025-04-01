import React from 'react';
import SliderControlWidgetAsset from '../../WidgetsComponents/SliderControl/SliderControlAsset';
import volumeIcon from '../../../../media/assets/volume.png';
import { useMusicService } from '../../../../drivers/MusicService/MusicService';

function SoundControl() {
  // Now we pull `volume` and `setVolume` from the MusicService
  const { volume, setVolume } = useMusicService();

  const handleVolumeChange = (newVolume) => {
    // Directly call setVolume from context. newVolume is 0–100 (slider range).
    setVolume(newVolume);
  };

  return (
    <div>
      <SliderControlWidgetAsset
        label="Sound"
        icon={volumeIcon}
        // Use the context-based volume as the slider's value
        value={volume}
        onChange={handleVolumeChange}
        min={3}
        max={97}
        fadeThumbBorder={true}
        removeFocusOutline={true}
      />
    </div>
  );
}

export default SoundControl;
