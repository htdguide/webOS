import React, { useState, useEffect } from 'react';
import './BatteryMiniApp.css';
// Replace this import path with the actual location of your battery image:
import batteryPng from '../../media/assets/battery.png';
/**
 * BatteryMiniApp:
 * - Renders an inline "battery tray" icon plus a percentage, 
 *   similar to macOS.
 * - No miniwindow or expanded mode is provided.
 *
 * PROPS for adjusting the black fill overlay:
 *   barTop      (number)  -- how far from the top in the battery PNG to begin the fill
 *   barLeft     (number)  -- how far from the left in the battery PNG to begin the fill
 *   barHeight   (number)  -- the height in pixels of the black fill bar
 *   barMaxWidth (number)  -- the maximum width in pixels for a 100% battery
 */
function BatteryMiniApp({
  barTop = 8,
  barLeft = 3,
  barHeight = 7,
  barMaxWidth = 16,
}) {
  // For demonstration, we'll "fake" a battery level
  const [batteryLevel, setBatteryLevel] = useState(85);

  // Optionally simulate battery changes over time
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev =>
        Math.max(0, Math.min(100, prev + (Math.random() * 10 - 5)))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="battery-miniapp-container">
      {/* Show percentage on the left (like macOS) */}
      <span className="battery-percentage">
        {Math.round(batteryLevel)} %
      </span>

      {/* Battery icon on the right */}
      <div className="battery-icon-wrapper">
        <img src={batteryPng} alt="Battery Icon" className="battery-icon-image" />

        {/* The black “fill” bar overlayed inside the PNG */}
        <div
          className="battery-level-indicator"
          style={{
            top: `${barTop}px`,
            left: `${barLeft}px`,
            height: `${barHeight}px`,
            width: `${(100 / 100) * barMaxWidth}px`,
          }}
        />
      </div>
    </div>
  );
}

export default BatteryMiniApp;
