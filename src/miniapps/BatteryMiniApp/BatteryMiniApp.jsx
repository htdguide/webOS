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
 * PROPS:
 *   barTop      (number)  -- how far from the top in the battery PNG to begin the fill
 *   barLeft     (number)  -- how far from the left in the battery PNG to begin the fill
 *   barHeight   (number)  -- the height in pixels of the black fill bar
 *   barMaxWidth (number)  -- the maximum width in pixels for a 100% battery
 *
 *   iconWidth   (number)  -- width in pixels of the battery icon (default 24)
 *   iconHeight  (number)  -- height in pixels of the battery icon (default auto)
 *   iconOpacity (number)  -- opacity for the battery icon (0 to 1, default 1)
 */
function BatteryMiniApp({
  barTop = 8,
  barLeft = 4,
  barHeight = 7,
  barMaxWidth = 18,
  iconWidth = 28,
  iconHeight = 24,        // if not provided, defaults to 'auto'
  iconOpacity = 0.4,
}) {
  // For demonstration, we'll "fake" a battery level
  const [batteryLevel, setBatteryLevel] = useState(85);

  // Optionally simulate battery changes over time
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
        {Math.round(batteryLevel)}%
      </span>

      {/* Battery icon on the right */}
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
            width: `${(100 / 100) * barMaxWidth}px`,
          }}
        />
      </div>
    </div>
  );
}

export default BatteryMiniApp;
