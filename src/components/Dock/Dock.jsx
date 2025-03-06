import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';

/**
 * A Mac-like Dock with a magnification (genie-like) effect when hovering icons.
 * 
 * Usage:
 *   1. Ensure you have AppsContext and that it provides `apps` (array of apps).
 *   2. Each app in `apps` has an `icon` and `indock`.
 *   3. Place <Dock /> at the bottom of your layout (often near the root of the app).
 */

const Dock = () => {
  const { apps } = useContext(AppsContext);
  // Filter out the apps that should appear in the Dock
  const dockApps = apps.filter((app) => app.indock);

  // We’ll track each icon’s scale factor based on mouse distance
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const dockRef = useRef(null);

  // Adjust these values to customize the look:
  const BASE_ICON_SIZE = 48;    // Base size of each icon in px
  const MAX_SCALE = 2.0;        // Maximum scale near the mouse
  const DOCK_SPREAD = 150;      // How many pixels to the left/right the hover effect spreads

  // On mouse move, compute distance from each icon’s center and set scale
  const handleMouseMove = (e) => {
    if (!dockRef.current) return;

    const dockRect = dockRef.current.getBoundingClientRect();
    // x-coordinate of the mouse, relative to dock’s left
    const relativeX = e.clientX - dockRect.left;

    const newScales = dockApps.map((_, index) => {
      // center of this icon in X
      const iconCenterX = (BASE_ICON_SIZE / 2) + (index * (BASE_ICON_SIZE + 16));
      const distance = Math.abs(relativeX - iconCenterX);

      if (distance > DOCK_SPREAD) {
        // Too far: no magnification
        return 1;
      } else {
        // Closer = bigger scale
        // Example formula: scale goes from 1 (at distance=DOCK_SPREAD) up to MAX_SCALE (at distance=0)
        const scale = 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
        return scale;
      }
    });

    setScales(newScales);
  };

  // Reset all icon scales on mouse leave
  const handleMouseLeave = () => {
    setScales(dockApps.map(() => 1));
  };

  // If the list of dock apps changes (for instance if context changes), reset scales
  useEffect(() => {
    setScales(dockApps.map(() => 1));
  }, [dockApps]);

  const openApp = (app) => {
    // If app has a link, open it. If it has a component, do whatever you need (launch the app, etc.)
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
    } else {
      // If you have a global system for launching apps, call that here
      // e.g. openWindow(app.id) or something similar
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
  const iconContainerStyle = (scale) => ({
    width: `${BASE_ICON_SIZE}px`,
    height: `${BASE_ICON_SIZE}px`,
    margin: '0 8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.1s ease-out',
    transform: `scale(${scale})`,
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
      ref={dockRef}
      style={dockContainerStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {dockApps.map((app, index) => (
        <div
          key={app.id}
          style={iconContainerStyle(scales[index])}
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
