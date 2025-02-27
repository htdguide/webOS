import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';
import batteryPng from '../../media/assets/battery.png';

function BatteryBarApp() {
  const [batteryLevel, setBatteryLevel] = useState(85);

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) =>
        Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5)))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="battery-miniapp-container">
      <span className="battery-percentage">
        <span className="battery-number">{Math.round(batteryLevel)}</span>
        <span className="battery-symbol">%</span>
      </span>

      <div className="battery-icon-wrapper">
        <img
          src={batteryPng}
          alt="Battery"
          className="battery-icon-image"
          style={{ width: '27px', height: '27px', opacity: 0.5 }}
        />

        {/* Battery fill bar inside the battery icon */}
        <div
          className="battery-level-indicator"
          style={{
            top: '9.5px',   // Restoring original bar position
            left: '3px',
            height: '8px',  // Restoring original bar height
            width: `${(batteryLevel / 100) * 18.5}px`, // Restoring original width scale
          }}
        />
      </div>
    </div>
  );
}

export default BatteryBarApp;
