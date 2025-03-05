import React from 'react';
import './QuickControls.css';

function QuickControls() {
  return (
    <div className="quick-controls-container">
      <div className="quick-control-block">
        <div className="quick-control-title">Wi-Fi</div>
        <div className="quick-control-sub">FSA Device</div>
      </div>

      <div className="quick-control-block">
        <div className="quick-control-title">Bluetooth</div>
        <div className="quick-control-sub">On</div>
      </div>

      <div className="quick-control-block">
        <div className="quick-control-title">AirDrop</div>
        <div className="quick-control-sub">Everyone</div>
      </div>

      <div className="quick-control-block">
        <div className="quick-control-title">Focus</div>
      </div>
    </div>
  );
}

export default QuickControls;
