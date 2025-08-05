import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import logo from '../../media/assets/logo.png';

function BatteryMiniApp() {
  const deviceInfo = useDeviceInfo();

  const batteryLevel =
    deviceInfo.battery && deviceInfo.battery.level != null
      ? deviceInfo.battery.level * 100
      : 0;

  return (
    <div className="battery-miniapp-wrapper">
      <div className="battery-miniapp-container">
        {/* Top Row: "Battery" on the left, battery percentage on the right */}
        <div className="battery-header-row">
          <strong className="battery-title">Battery</strong>
          <strong className="battery-percentage">{Math.round(batteryLevel)} %</strong>
        </div>

        {/* Thin gray separator line */}
        <div className="battery-separator" />

        {/* "Using Significant Energy" section */}
        <div className="battery-using-energy-section">
          <strong className="using-energy-title">Using Significant Energy</strong>
          <div className="energy-item">
            <img src={logo} alt="Logo" className="energy-logo" />
            <span>htdguide's webOS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatteryMiniApp;
