import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';

function BatteryMiniApp({ compact = false }) {
  const [batteryLevel, setBatteryLevel] = useState(85); // Fake battery level

  // Optionally simulate battery level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) =>
        Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5)))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // If in "compact" mode, just render a small inline battery display.
  if (compact) {
    return (
      <div className="battery-miniapp-compact">
        <div className="battery-icon">
          <div
            className="battery-level"
            style={{ width: `${batteryLevel}%` }}
          ></div>
        </div>
        <span style={{ marginLeft: '5px' }}>{Math.round(batteryLevel)}%</span>
      </div>
    );
  }

  // Full mode (inside the miniwindow)
  return (
    <div className="battery-mini-app">
      <div className="battery-info">
        <div className="battery-icon">
          <div
            className="battery-level"
            style={{ width: `${batteryLevel}%` }}
          ></div>
        </div>
        <span className="battery-percentage">{Math.round(batteryLevel)}%</span>
      </div>
      <div className="battery-text">Battery Charge Level</div>
    </div>
  );
}

export default BatteryMiniApp;
