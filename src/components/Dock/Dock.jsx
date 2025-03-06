import React, { useContext, useState } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';

/**
 * A Mac-like Dock with discrete magnification effects.
 *
 * Usage:
 *   1. Ensure you have AppsContext providing an array of apps.
 *   2. Each app should include an `icon`, an `indock` flag, and an `id`/`name`.
 *   3. Place <Dock /> at the bottom of your layout.
 */

const Dock = () => {
  const { apps } = useContext(AppsContext);
  // Filter out apps to appear in the dock
  const dockApps = apps.filter((app) => app.indock);

  // Track the index of the icon currently hovered over
  const [activeIndex, setActiveIndex] = useState(null);

  // Compute transform based on the hovered icon's index
  const getTransform = (index) => {
    // If no icon is active, return default transform
    if (activeIndex === null) return 'scale(1) translateY(0px)';
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);
    let scale = 1;
    let translateY = 0;

    if (absOffset === 0) {
      // Focused icon
      scale = 1.5;
      translateY = -10;
    } else if (absOffset === 1) {
      // Immediate neighbor icons
      scale = 1.2;
      translateY = -6;
    } else if (absOffset === 2) {
      // Next neighbors further out
      scale = 1.1;
      translateY = 0;
    }
    return `scale(${scale}) translateY(${translateY}px)`;
  };

  // Open the app (using link or a system command)
  const openApp = (app) => {
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Launching or focusing app: ${app.id}`);
    }
  };

  // Inline styles for the dock container
  const dockContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'flex-end',
    background: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
    padding: '10px 15px',
    borderRadius: '20px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    userSelect: 'none',
    zIndex: 9999,
  };

  // Inline styles for each icon container
  const iconContainerStyle = (transform) => ({
    width: '48px',
    height: '48px',
    margin: '0 8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.3s ease',
    transform: transform,
    cursor: 'pointer',
  });

  // Inline styles for the icon image
  const iconImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '10%',
  };

  return (
    <div
      style={dockContainerStyle}
      onMouseLeave={() => setActiveIndex(null)}
    >
      {dockApps.map((app, index) => (
        <div
          key={app.id}
          style={iconContainerStyle(getTransform(index))}
          onMouseEnter={() => setActiveIndex(index)}
          onClick={() => openApp(app)}
        >
          <img
            src={app.icon}
            alt={app.name}
            style={iconImageStyle}
          />
        </div>
      ))}
    </div>
  );
};

export default Dock;
