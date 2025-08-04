// BatteryBarApp.jsx

// ===============================
// Area 1: Imports
// ===============================

// 1.1: React, CSS & asset imports
import React from 'react';
import './BatteryBarApp.css';
import batteryPng from '../../media/assets/battery.png';

// 1.2: Hook import for device info
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';

// ===============================
// Area 2: Component logic
// ===============================

function BatteryBarApp() {
  // 2.1: Retrieve device info
  const { battery, orientation } = useDeviceInfo();

  // 2.1: Early return if no battery data or battery is at 0%
  if (!battery || battery.level == null || battery.level === 0) {
    return null;
  }

  // 2.2: Compute battery level percentage
  const batteryLevel = battery.level * 100;

  // 2.3: Style for battery‐fill bar inside the icon
  const batteryFillStyle = {
    top: '9.3px',
    left: '3px',
    height: '8px',
    width: `${(batteryLevel / 100) * 18.5}px`,
    // Turn red when below 11%
    backgroundColor: batteryLevel < 11 ? '#FF3B30' : undefined,
  };

  // ===============================
  // Area 3: JSX markup
  // ===============================
  return (
    <div className="battery-bar-container">
      {/* 3.1: Percentage display when in landscape */}
      {orientation !== 'portrait' && (
        <span className="battery-bar-percentage">
          <span className="battery-bar-number">{Math.round(batteryLevel)}</span>
          <span className="battery-bar-symbol">%</span>
        </span>
      )}

      {/* 3.2: Battery icon wrapper */}
      <div className="battery-bar-icon-wrapper">
        <img
          src={batteryPng}
          alt="Battery"
          className="battery-icon-image"
          style={{ width: '27px', height: '27px', opacity: 0.5 }}
        />

        {/* 3.3: Battery fill indicator */}
        <div className="battery-bar-level-indicator" style={batteryFillStyle} />
      </div>
    </div>
  );
}

// ===============================
// Area 4: Export
// ===============================

// 4.1: Default export of component
export default BatteryBarApp;
