import React, { useContext, useState, useRef } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';

/**
 * A Mac-like Dock with discrete magnification effects.
 * 
 * In this version, the effect is triggered by the mouse's x-coordinate within the dock container.
 * The nearest icon (determined by the computed index) is magnified and its immediate neighbors are slightly magnified.
 *
 * Usage:
 *   1. Ensure you have AppsContext providing an array of apps.
 *   2. Each app should include an `icon`, an `indock` flag, and an `id`/`name`.
 *   3. Place <Dock /> at the bottom of your layout.
 */

const Dock = () => {
  const { apps } = useContext(AppsContext);
  // Filter apps to appear in the dock
  const dockApps = apps.filter((app) => app.indock);

  // We'll track a floating active index based on the mouse x-position over the dock
  const [activeIndex, setActiveIndex] = useState(null);
  const dockRef = useRef(null);

  // Constants that match the inline styles:
  const CONTAINER_HORIZONTAL_PADDING = 15; // from padding '10px 15px'
  const ICON_MARGIN = 8; // margin: '0 8px'
  const ICON_SIZE = 48; // icon width/height
  const ICON_SPACING = ICON_SIZE + ICON_MARGIN * 2; // 48 + 16 = 64
  // The center of the first icon is offset from the left edge by:
  const FIRST_ICON_CENTER_OFFSET = CONTAINER_HORIZONTAL_PADDING + ICON_MARGIN + ICON_SIZE / 2; // 15 + 8 + 24 = 47

  // Update activeIndex based on mouse x-position within the dock container
  const handleMouseMove = (e) => {
    if (!dockRef.current) return;
    const dockRect = dockRef.current.getBoundingClientRect();
    const relativeX = e.clientX - dockRect.left;
    // Compute a floating index: when the cursor is at the center of the first icon, index = 0;
    // the spacing between icon centers is ICON_SPACING.
    const computedIndex = (relativeX - FIRST_ICON_CENTER_OFFSET) / ICON_SPACING;
    setActiveIndex(computedIndex);
  };

  // When the mouse leaves the dock, reset to default state.
  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Compute transformation for each icon based on its index relative to the computed active index.
  const getTransform = (index) => {
    if (activeIndex === null) return 'scale(1) translateY(0px)';
    // Determine the focused icon as the one nearest to the mouse
    const focusedIndex = Math.round(activeIndex);
    const diff = Math.abs(index - focusedIndex);
    let scale = 1;
    let translateY = 0;
    if (diff === 0) {
      scale = 1.5;
      translateY = -10;
    } else if (diff === 1) {
      scale = 1.2;
      translateY = -6;
    } else if (diff === 2) {
      scale = 1.1;
      translateY = 0;
    }
    return `scale(${scale}) translateY(${translateY}px)`;
  };

  // Open the app (either via a link or by another method)
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
    width: `${ICON_SIZE}px`,
    height: `${ICON_SIZE}px`,
    margin: `0 ${ICON_MARGIN}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.15s ease',
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
      ref={dockRef}
      style={dockContainerStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {dockApps.map((app, index) => (
        <div
          key={app.id}
          style={iconContainerStyle(getTransform(index))}
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
