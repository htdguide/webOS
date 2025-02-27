import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';
import batteryPng from '../../media/assets/battery.png';

function BatteryMiniApp({
  compact = false, // Default to false (miniwindow mode)
  barTop = 9.5,
  barLeft = 3,
  barHeight = 8,
  barMaxWidth = 18.5,
  iconWidth = 27,
  iconHeight = 27,
  iconOpacity = 0.5,
}) {
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
      {/* Show percentage on the left (like macOS) */}
      <span className="battery-percentage">
        <span className="battery-number">{Math.round(batteryLevel)}</span>
        <span className="battery-symbol">%</span>
      </span>

      {/* Battery icon */}
      <div className="battery-icon-wrapper">
        <img
          src={batteryPng}
          alt="Battery Icon"
          className="battery-icon-image"
          style={{
            width: `${iconWidth}px`,
            height: iconHeight ? `${iconHeight}px` : 'auto',
            opacity: iconOpacity,
          }}
        />

        {/* The black “fill” bar overlayed inside the PNG */}
        <div
          className="battery-level-indicator"
          style={{
            top: `${barTop}px`,
            left: `${barLeft}px`,
            height: `${barHeight}px`,
            width: `${(batteryLevel / 100) * barMaxWidth}px`,
          }}
        />
      </div>
    </div>
  );
}

export default BatteryMiniApp;
