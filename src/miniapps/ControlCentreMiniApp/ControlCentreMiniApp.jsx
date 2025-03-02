import React from 'react';
import './ControlCentreMiniApp.css';
import controlCentreIcon from '../../media/assets/controlcentre.png';

function ControlCentreMiniApp() {
  return (
    <div class="control-centre-container">
      <h3>Control Centre</h3>
      <p>Quick access to essential controls</p>

      <div className="control-centre-items">
        <button className="control-btn">Wi-Fi</button>
        <button className="control-btn">Bluetooth</button>
        <button className="control-btn">Do Not Disturb</button>
        <button className="control-btn">Brightness</button>
        <button className="control-btn">Volume</button>
      </div>
    </div>
  );
}

export default ControlCentreMiniApp;
