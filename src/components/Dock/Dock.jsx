import React, { useContext, useState, useRef } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';
import DOCK_CONFIG from '../../configs/DockConfig/DockConfig';

const {
  ICON_SIZE,
  ICON_MARGIN,
  ADDITIONAL_MARGIN,
  DOCK_SPREAD,
  MAX_SCALE,
  INITIAL_TRANSITION,
  NO_TRANSITION,
} = DOCK_CONFIG;

/**
 * A Mac-like Dock with smooth continuous magnification based on the mouse x-axis,
 * with icons locked on the y-axis. Their bottom edges remain fixed regardless of scaling.
 *
 * As the mouse moves over the dock container, each icon smoothly scales up based on its
 * distance from the mouse pointer. The transform origin is set to bottom center, ensuring
 * that the bottom edge of each icon stays at the same y coordinate.
 *
 * Animation parameters are configured via a separate config file.
 *
 * Usage:
 *   1. Ensure you have AppsContext providing an array of apps.
 *   2. Each app should include an `icon`, an `indock` flag, and an `id`/`name`.
 *   3. Place <Dock /> at the bottom of your layout.
 */
const Dock = () => {
  const { apps } = useContext(AppsContext);
  const dockApps = apps.filter((app) => app.indock);

  // Refs for outer container and icons container.
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);

  // State for scales for each icon.
  const [scales, setScales] = useState(dockApps.map(() => 1));
  // Controls whether to animate changes (true only for the initial transition after mouse enters)
  const [shouldTransition, setShouldTransition] = useState(true);

  // Update scales based on the mouse x-position.
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    // Disable smooth transition immediately after the first mouse move.
    if (shouldTransition) {
      setShouldTransition(false);
    }
    const containerRect = iconsContainerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;

    const newScales = [];
    dockApps.forEach((_, index) => {
      // Compute the static "base center" using the base margin and icon width.
      const baseCenter =
        ICON_MARGIN + ICON_SIZE / 2 + index * (ICON_SIZE + 2 * ICON_MARGIN);
      const distance = Math.abs(mouseX - baseCenter);
      const scale =
        distance > DOCK_SPREAD
          ? 1
          : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
      newScales.push(scale);
    });
    setScales(newScales);
  };

  // Reset scales when the mouse leaves the icons container.
  const handleMouseLeave = () => {
    setScales(dockApps.map(() => 1));
    // Re-enable smooth transition for the next entry.
    setShouldTransition(true);
  };

  // On mouse enter, ensure the smooth transition is enabled.
  const handleMouseEnter = () => {
    setShouldTransition(true);
  };

  // Compute positions of icons based on dynamic margins and scales.
  // Each icon's dynamic margin is: ICON_MARGIN + (scale - 1) * ADDITIONAL_MARGIN.
  // Returns an array of icon center positions and the total container width.
  const computeIconPositions = () => {
    const centers = [];
    let leftEdge = 0;
    for (let i = 0; i < dockApps.length; i++) {
      const dynamicMargin = ICON_MARGIN + (scales[i] - 1) * ADDITIONAL_MARGIN;
      if (i === 0) {
        leftEdge = dynamicMargin;
      } else {
        const prevDynamicMargin =
          ICON_MARGIN + (scales[i - 1] - 1) * ADDITIONAL_MARGIN;
        leftEdge = leftEdge + ICON_SIZE + prevDynamicMargin + dynamicMargin;
      }
      const center = leftEdge + ICON_SIZE / 2;
      centers.push(center);
    }
    const lastDynamicMargin =
      dockApps.length > 0
        ? ICON_MARGIN + (scales[dockApps.length - 1] - 1) * ADDITIONAL_MARGIN
        : 0;
    const containerWidth =
      dockApps.length > 0
        ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDynamicMargin
        : 0;
    return { centers, containerWidth };
  };

  // Compute dynamic background bounds based on icons’ effective horizontal positions.
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

  // Outer fixed container style (centers the dock).
  const outerContainerStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9999,
  };

  // Icons container style with computed width.
  // Aligning items to "flex-end" locks the icons at the bottom.
  const iconsContainerStyle = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
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
    pointerEvents: 'none',
  };

  // Style for each icon container.
  // The dynamic margin increases with magnification.
  // The transform origin is set to 'bottom center' to keep the bottom edge fixed.
  const iconContainerStyle = (index) => {
    const dynamicMargin = ICON_MARGIN + (scales[index] - 1) * ADDITIONAL_MARGIN;
    return {
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      margin: `0 ${dynamicMargin}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      transition: shouldTransition ? INITIAL_TRANSITION : NO_TRANSITION,
      transform: `scale(${scales[index]})`,
      transformOrigin: 'bottom center',
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
        onMouseEnter={handleMouseEnter}
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
            <img src={app.icon} alt={app.name} style={iconImageStyle} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dock;
