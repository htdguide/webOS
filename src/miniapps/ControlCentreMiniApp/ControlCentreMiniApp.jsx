import React from 'react';
import './ControlCentreMiniApp.css';

// Import your “pluggable apps” / segments
import QuickControls from './QuickControls';
import DisplayControl from './DisplayControl';
import SoundControl from './SoundControl';
import MusicControl from './MusicControl';
import BatteryControl from './BatteryControl';

function ControlCentreMiniApp() {
  return (
    <div className="cc-main-container">
      {/* Top row with Wi-Fi, Bluetooth, AirDrop, Focus, etc. */}
      <div className="cc-segment cc-segment-toprow">
        <QuickControls />
      </div>

      {/* Below that: Display slider */}
      <div className="cc-segment">
        <DisplayControl />
      </div>

      {/* Sound slider */}
      <div className="cc-segment">
        <SoundControl />
      </div>

      {/* Music player */}
      <div className="cc-segment">
        <MusicControl />
      </div>

      {/* Battery */}
      <div className="cc-segment">
        <BatteryControl />
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
