import React from 'react';
import './ControlCentreMiniApp.css';

// Import your “pluggable apps” / segments
import DisplayControl from './ControlCentreWidgets/DisplayControl/DisplayControl';
import SoundControl from './ControlCentreWidgets/SoundControl/SoundControl';
import MusicControl from './ControlCentreWidgets/MusicControl/MusicControl';

function ControlCentreMiniApp() {
  return (
    <div className="cc-main-container">

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

    </div>
  );
}

export default ControlCentreMiniApp;
