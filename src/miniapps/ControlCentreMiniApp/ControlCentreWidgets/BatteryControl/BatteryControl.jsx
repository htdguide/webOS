import React from 'react';
import './BatteryControl.css';
import batteryIcon from '../../../../media/assets/battery.png'; // (just an example)

function BatteryControl() {
  const batteryPercentage = 87; // Hard-coded for now

  return (
    <div className="battery-control-container">
      <img src={batteryIcon} alt="Battery" className="battery-icon" />
      <span className="battery-percentage">{batteryPercentage} %</span>
    </div>
  );
}

export default BatteryControl;
