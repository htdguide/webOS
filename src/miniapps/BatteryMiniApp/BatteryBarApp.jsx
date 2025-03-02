// BatteryBarApp.jsx
import React from 'react';
import './BatteryBarApp.css';
import batteryPng from '../../media/assets/battery.png';
import { useDeviceInfo } from '../../services/DeviceInfoProvider/DeviceInfoProvider';

function BatteryBarApp() {
  const deviceInfo = useDeviceInfo();
  const batteryLevel =
    deviceInfo.battery && deviceInfo.battery.level != null
      ? deviceInfo.battery.level * 100
      : 0;

  const batteryFillStyle = {
    top: '9.5px',
    left: '3px',
    height: '8px',
    width: `${(batteryLevel / 100) * 18.5}px`,
    backgroundColor: batteryLevel < 20 ? '#FF3B30' : undefined,
  };

  return (
    <div className="battery-bar-container">
      <span className="battery-bar-percentage">
        <span className="battery-bar-number">{Math.round(batteryLevel)}</span>
        <span className="battery-bar-symbol">%</span>
      </span>

      <div className="battery-bar-icon-wrapper">
        <img
          src={batteryPng}
          alt="Battery"
          className="battery-icon-image"
          style={{ width: '27px', height: '27px', opacity: 0.5 }}
        />

        {/* Battery fill bar inside the battery icon */}
        <div className="battery-bar-level-indicator" style={batteryFillStyle} />
      </div>
    </div>
  );
}

export default BatteryBarApp;
