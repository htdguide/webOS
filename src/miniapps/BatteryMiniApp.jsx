import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';

function BatteryMiniApp() {
  const [batteryLevel, setBatteryLevel] = useState(85); // Fake battery level

  // Optionally simulate battery level changes
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5))));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="battery-mini-app">
      <div className="battery-info">
        <div className="battery-icon">
          <div className="battery-level" style={{ width: `${batteryLevel}%` }}></div>
        </div>
        <span className="battery-percentage">{Math.round(batteryLevel)}%</span>
      </div>
      <div className="battery-text">Battery Charge Level</div>
    </div>
  );
}

export default BatteryMiniApp;
