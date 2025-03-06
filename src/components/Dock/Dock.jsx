import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';

/**
 * A Mac-like Dock with smooth continuous magnification based on the mouse x-axis.
 *
 * As the mouse moves over the dock container, each icon smoothly scales up based on its
 * distance from the mouse pointer. In addition, the side margins increase with the scale,
 * and the dynamic background adjusts accordingly.
 *
 * Usage:
 *   1. Ensure you have AppsContext providing an array of apps.
 *   2. Each app should include an `icon`, an `indock` flag, and an `id`/`name`.
 *   3. Place <Dock /> at the bottom of your layout.
 */

const Dock = () => {
  const { apps } = useContext(AppsContext);
  const dockApps = apps.filter((app) => app.indock);

  // Refs for outer container and inner icons container.
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);

  // Constants for icon dimensions, margins, and effect parameters.
  const ICON_SIZE = 48;           // px
  const ICON_MARGIN = 8;          // base margin (px)
  const ADDITIONAL_MARGIN = 4;    // extra margin factor (px) per unit scale above 1
  const DOCK_SPREAD = 150;        // Range in px for the magnification effect.
  const MAX_SCALE = 1.5;          // Maximum scale when the cursor is directly over an icon.
  const MAX_TRANSLATE_Y = -10;    // Maximum vertical translation in px at full magnification.

  // State for scales and translateY values for each icon.
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const [translateYs, setTranslateYs] = useState(dockApps.map(() => 0));

  // Update scales and translateYs continuously based on the mouse x-position.
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    const containerRect = iconsContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;

    const newScales = [];
    const newTranslateYs = [];
    // Use a static "base center" computed from the base margin and icon width.
    dockApps.forEach((_, index) => {
      const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + index * (ICON_SIZE + 2 * ICON_MARGIN);
      const distance = Math.abs(mouseX - baseCenter);
      const scale = distance > DOCK_SPREAD ? 1 : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
      newScales.push(scale);
      const translateY = ((scale - 1) / (MAX_SCALE - 1)) * MAX_TRANSLATE_Y;
      newTranslateYs.push(translateY);
    });
    setScales(newScales);
    setTranslateYs(newTranslateYs);
  };

  // Reset scales and translateYs when the mouse leaves the icons container.
  const handleMouseLeave = () => {
    setScales(dockApps.map(() => 1));
    setTranslateYs(dockApps.map(() => 0));
  };

  // Compute the positions of icons based on dynamic margins and scales.
  // Each icon's dynamic margin is calculated as: ICON_MARGIN + (scale - 1) * ADDITIONAL_MARGIN.
  // This returns an array of icon center positions and the total container width.
  const computeIconPositions = () => {
    const centers = [];
    let leftEdge = 0;
    for (let i = 0; i < dockApps.length; i++) {
      const dynamicMargin = ICON_MARGIN + (scales[i] - 1) * ADDITIONAL_MARGIN;
      if (i === 0) {
        leftEdge = dynamicMargin;
      } else {
        const prevDynamicMargin = ICON_MARGIN + (scales[i - 1] - 1) * ADDITIONAL_MARGIN;
        leftEdge = leftEdge + ICON_SIZE + prevDynamicMargin + dynamicMargin;
      }
      const center = leftEdge + ICON_SIZE / 2;
      centers.push(center);
    }
    const lastDynamicMargin = dockApps.length > 0 ? ICON_MARGIN + (scales[dockApps.length - 1] - 1) * ADDITIONAL_MARGIN : 0;
    const containerWidth = dockApps.length > 0
      ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDynamicMargin
      : 0;
    return { centers, containerWidth };
  };

  // Compute dynamic background bounds based on icons’ effective positions.
  const computeBackgroundBounds = () => {
    if (dockApps.length === 0) return { left: 0, width: 0 };
    const { centers } = computeIconPositions();
    let minLeft = Infinity;
    let maxRight = -Infinity;
    dockApps.forEach((_, index) => {
      const effectiveLeft = centers[index] - (ICON_SIZE / 2) * scales[index];
      const effectiveRight = centers[index] + (ICON_SIZE / 2) * scales[index];
      if (effectiveLeft < minLeft) minLeft = effectiveLeft;
      if (effectiveRight > maxRight) maxRight = effectiveRight;
    });
    return { left: minLeft, width: maxRight - minLeft };
  };

  const { left: bgLeft, width: bgWidth } = computeBackgroundBounds();
  const { containerWidth } = computeIconPositions();

  // Open the app (using link or another method).
  const openApp = (app) => {
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Launching or focusing app: ${app.id}`);
    }
  };

  // Outer fixed container style (for centering, with high z-index).
  const outerContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
  };

  // Icons container style with dynamically computed width.
  const iconsContainerStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: `${containerWidth}px`,
    height: `${ICON_SIZE}px`,
  };

  // Dynamic background style based on computed bounds.
  const backgroundStyle = {
    position: 'absolute',
    top: 0,
    left: `${bgLeft}px`,
    width: `${bgWidth}px`,
    height: '100%',
    borderRadius: '16px',
    background: 'rgba(83, 83, 83, 0.25)',
    backdropFilter: 'blur(13px)',
    WebkitBackdropFilter: 'blur(13px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    transition: 'all 0.15s ease',
    pointerEvents: 'none',
  };

  // Style for each icon container.
  // The margin is computed dynamically so that it increases with magnification.
  const iconContainerStyle = (index) => {
    const dynamicMargin = ICON_MARGIN + (scales[index] - 1) * ADDITIONAL_MARGIN;
    return {
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      margin: `0 ${dynamicMargin}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.15s ease',
      transform: `scale(${scales[index]}) translateY(${translateYs[index]}px)`,
      cursor: 'pointer',
      position: 'relative',
      zIndex: 1,
    };
  };

  // Icon image style.
  const iconImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '10%',
  };

  return (
    <div ref={outerRef} style={outerContainerStyle}>
      <div
        ref={iconsContainerRef}
        style={iconsContainerStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={backgroundStyle} />
        {dockApps.map((app, index) => (
          <div
            key={app.id}
            style={iconContainerStyle(index)}
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
    </div>
  );
};

export default Dock;
