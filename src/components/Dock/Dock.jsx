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
  ENABLE_MAGNIFICATION,
  DOCK_POSITION,
  DOCK_MARGIN,
} = DOCK_CONFIG;

/**
 * A Mac-like Dock with smooth continuous magnification based on the mouse position.
 * The dock can be placed on the bottom (horizontal mode) or the left/right (vertical mode).
 *
 * New features:
 *  - Toggle magnification via ENABLE_MAGNIFICATION.
 *  - Control the dock margin from the edge via DOCK_MARGIN.
 *  - Place the dock on the 'bottom', 'left', or 'right' side using DOCK_POSITION.
 *    When set to 'left' or 'right', the dock icons are arranged vertically.
 *
 * Usage:
 *   1. Ensure you have AppsContext providing an array of apps.
 *   2. Each app should include an `icon`, an `indock` flag, and an `id`/`name`.
 *   3. Place <Dock /> within your layout.
 */
const Dock = () => {
  const { apps } = useContext(AppsContext);
  const dockApps = apps.filter((app) => app.indock);

  // Determine orientation: horizontal for bottom, vertical for left/right.
  const isVertical = DOCK_POSITION === 'left' || DOCK_POSITION === 'right';

  // Refs for outer container, icons container, and initial transition timer.
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);
  const initialTransitionTimeoutRef = useRef(null);

  // State for scales for each icon.
  const [scales, setScales] = useState(dockApps.map(() => 1));
  // Controls whether to animate changes (true for initial transition, then false).
  const [shouldTransition, setShouldTransition] = useState(true);

  // Handle mouse enter: enable smooth transition and schedule its disable.
  const handleMouseEnter = () => {
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    setShouldTransition(true);
    // Keep the initial transition active for 0.3 seconds.
    initialTransitionTimeoutRef.current = setTimeout(() => {
      setShouldTransition(false);
    }, 300);
  };

  // Update scales based on the mouse position (x for horizontal, y for vertical).
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    // If magnification is disabled, always set scales to 1.
    if (!ENABLE_MAGNIFICATION) {
      setScales(dockApps.map(() => 1));
      return;
    }
    const containerRect = iconsContainerRef.current.getBoundingClientRect();
    const mousePos = isVertical
      ? e.clientY - containerRect.top
      : e.clientX - containerRect.left;

    const newScales = [];
    dockApps.forEach((_, index) => {
      // Compute the static "base center" using the base margin and icon size.
      const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + index * (ICON_SIZE + 2 * ICON_MARGIN);
      const distance = Math.abs(mousePos - baseCenter);
      const scale = distance > DOCK_SPREAD
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
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
  };

  // Compute positions of icons based on dynamic margins and scales.
  // For horizontal: computes x centers and container width.
  // For vertical: computes y centers and container height.
  const computeIconPositions = () => {
    const centers = [];
    let startPos = 0;
    for (let i = 0; i < dockApps.length; i++) {
      const dynamicMargin = ICON_MARGIN + (scales[i] - 1) * ADDITIONAL_MARGIN;
      if (i === 0) {
        startPos = dynamicMargin;
      } else {
        const prevDynamicMargin = ICON_MARGIN + (scales[i - 1] - 1) * ADDITIONAL_MARGIN;
        startPos = startPos + ICON_SIZE + prevDynamicMargin + dynamicMargin;
      }
      const center = startPos + ICON_SIZE / 2;
      centers.push(center);
    }
    const lastDynamicMargin = dockApps.length > 0
      ? ICON_MARGIN + (scales[dockApps.length - 1] - 1) * ADDITIONAL_MARGIN
      : 0;
    const containerDimension = dockApps.length > 0
      ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDynamicMargin
      : 0;
    return { centers, containerDimension };
  };

  // Compute dynamic background bounds based on icons’ effective positions.
  // For horizontal: returns left and width.
  // For vertical: returns top and height.
  const computeBackgroundBounds = () => {
    if (dockApps.length === 0) return { start: 0, size: 0 };
    const { centers } = computeIconPositions();
    let minPos = Infinity;
    let maxPos = -Infinity;
    dockApps.forEach((_, index) => {
      const effectiveStart = centers[index] - (ICON_SIZE / 2) * scales[index];
      const effectiveEnd = centers[index] + (ICON_SIZE / 2) * scales[index];
      if (effectiveStart < minPos) minPos = effectiveStart;
      if (effectiveEnd > maxPos) maxPos = effectiveEnd;
    });
    return { start: minPos, size: maxPos - minPos };
  };

  const { start: bgStart, size: bgSize } = computeBackgroundBounds();
  const { containerDimension } = computeIconPositions();

  // Open the app (using link or another method).
  const openApp = (app) => {
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Launching or focusing app: ${app.id}`);
    }
  };

  // Outer fixed container style based on DOCK_POSITION and DOCK_MARGIN.
  let outerContainerStyle = {};
  if (DOCK_POSITION === 'bottom') {
    outerContainerStyle = {
      position: 'fixed',
      bottom: `${DOCK_MARGIN}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
    };
  } else if (DOCK_POSITION === 'left') {
    outerContainerStyle = {
      position: 'fixed',
      left: `${DOCK_MARGIN}px`,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
    };
  } else if (DOCK_POSITION === 'right') {
    outerContainerStyle = {
      position: 'fixed',
      right: `${DOCK_MARGIN}px`,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 10,
    };
  } else {
    // Fallback to bottom if an unknown position is provided.
    outerContainerStyle = {
      position: 'fixed',
      bottom: `${DOCK_MARGIN}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
    };
  }

  // Icons container style.
  const iconsContainerStyle = isVertical
    ? {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: `${ICON_SIZE}px`,
        height: `${containerDimension}px`,
      }
    : {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: `${containerDimension}px`,
        height: `${ICON_SIZE}px`,
      };

  // Dynamic background style.
  const backgroundStyle = isVertical
    ? {
        position: 'absolute',
        left: -5,
        top: `${bgStart - 5}px`,
        height: `${bgSize + 10}px`,
        width: '120%',
        borderRadius: '16px',
        background: 'rgba(83, 83, 83, 0.25)',
        backdropFilter: 'blur(13px)',
        WebkitBackdropFilter: 'blur(13px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        pointerEvents: 'none',
      }
    : {
        position: 'absolute',
        top: -5,
        left: `${bgStart - 5}px`,
        width: `${bgSize + 10}px`,
        height: '120%',
        borderRadius: '16px',
        background: 'rgba(83, 83, 83, 0.25)',
        backdropFilter: 'blur(13px)',
        WebkitBackdropFilter: 'blur(13px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        pointerEvents: 'none',
      };

  // Style for each icon container.
  const iconContainerStyle = (index) => {
    const dynamicMargin = ICON_MARGIN + (scales[index] - 1) * ADDITIONAL_MARGIN;
    const baseStyle = {
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      transition: shouldTransition ? INITIAL_TRANSITION : NO_TRANSITION,
      transform: `scale(${scales[index]})`,
      cursor: 'pointer',
      position: 'relative',
      zIndex: 1,
    };

    if (isVertical) {
      return {
        ...baseStyle,
        margin: `${dynamicMargin}px 0`,
        transformOrigin: DOCK_POSITION === 'left' ? 'left center' : 'right center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      };
    } else {
      return {
        ...baseStyle,
        margin: `0 ${dynamicMargin}px`,
        transformOrigin: 'bottom center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
      };
    }
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
