import React, { useContext, useState, useRef } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';
import DOCK_CONFIG from '../../configs/DockConfig/DockConfig';
import { useDeviceInfo } from '../../services/DeviceInfoProvider/DeviceInfoProvider';

const Dock = () => {
  // Get device info (including orientation) from DeviceInfoProvider
  const deviceInfo = useDeviceInfo();
  const isPortrait = deviceInfo.orientation === 'portrait';
  // Merge vertical overrides when in portrait mode
  const config = isPortrait && DOCK_CONFIG.vertical ? { ...DOCK_CONFIG, ...DOCK_CONFIG.vertical } : DOCK_CONFIG;

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
  } = config;

  // Determine dock layout orientation: horizontal if bottom, vertical if left/right.
  const isVerticalDock = DOCK_POSITION === 'left' || DOCK_POSITION === 'right';

  const { apps } = useContext(AppsContext);
  const dockApps = apps.filter((app) => app.indock);

  // Pagination settings: in portrait mode, show a configurable number of icons per page (default 4)
  const iconsPerPage = isPortrait ? (config.ICONS_PER_PAGE || 4) : dockApps.length;
  const paginationEnabled = isPortrait && dockApps.length > iconsPerPage;
  const totalPages = paginationEnabled ? Math.ceil(dockApps.length / iconsPerPage) : 1;
  const [currentPage, setCurrentPage] = useState(0);

  // Determine which apps to render based on current page (if pagination is enabled)
  const appsToRender = paginationEnabled
    ? dockApps.slice(currentPage * iconsPerPage, (currentPage + 1) * iconsPerPage)
    : dockApps;

  // Refs for outer container, icons container, and initial transition timer.
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);
  const initialTransitionTimeoutRef = useRef(null);

  // State for scales for each icon (for the entire dockApps list)
  const [scales, setScales] = useState(dockApps.map(() => 1));
  // Controls whether to animate changes (true for initial transition, then false).
  const [shouldTransition, setShouldTransition] = useState(true);

  // Touch events for swipe between pages (only when pagination is enabled)
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50; // threshold in pixels
    if (deltaX < -swipeThreshold && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (deltaX > swipeThreshold && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    setTouchStartX(null);
    // Reset scales for the visible icons on page change
    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        newScales[startIndex + i] = 1;
      }
      setScales(newScales);
    }
  };

  // Handle mouse enter: enable smooth transition and schedule its disable.
  const handleMouseEnter = () => {
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    setShouldTransition(true);
    initialTransitionTimeoutRef.current = setTimeout(() => {
      setShouldTransition(false);
    }, 300);
  };

  // Update scales based on the mouse position (x for horizontal, y for vertical dock).
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    // If magnification is disabled, keep scales at 1.
    if (!ENABLE_MAGNIFICATION) {
      if (paginationEnabled) {
        const newScales = [...scales];
        const startIndex = currentPage * iconsPerPage;
        for (let i = 0; i < appsToRender.length; i++) {
          newScales[startIndex + i] = 1;
        }
        setScales(newScales);
      } else {
        setScales(dockApps.map(() => 1));
      }
      return;
    }
    const containerRect = iconsContainerRef.current.getBoundingClientRect();
    const mousePos = isVerticalDock
      ? e.clientY - containerRect.top
      : e.clientX - containerRect.left;

    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + i * (ICON_SIZE + 2 * ICON_MARGIN);
        const distance = Math.abs(mousePos - baseCenter);
        const scale = distance > DOCK_SPREAD ? 1 : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
        newScales[startIndex + i] = scale;
      }
      setScales(newScales);
    } else {
      const newScales = [];
      dockApps.forEach((_, index) => {
        const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + index * (ICON_SIZE + 2 * ICON_MARGIN);
        const distance = Math.abs(mousePos - baseCenter);
        const scale = distance > DOCK_SPREAD ? 1 : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
        newScales.push(scale);
      });
      setScales(newScales);
    }
  };

  // Reset scales when the mouse leaves the icons container.
  const handleMouseLeave = () => {
    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        newScales[startIndex + i] = 1;
      }
      setScales(newScales);
    } else {
      setScales(dockApps.map(() => 1));
    }
    setShouldTransition(true);
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
  };

  // Compute icon positions based on dynamic margins and scales for visible icons.
  const computeIconPositions = () => {
    const centers = [];
    let startPos = 0;
    // Use only the scales for the current page
    const visibleScales = paginationEnabled
      ? scales.slice(currentPage * iconsPerPage, currentPage * iconsPerPage + appsToRender.length)
      : scales;
    for (let i = 0; i < appsToRender.length; i++) {
      const dynamicMargin = ICON_MARGIN + (visibleScales[i] - 1) * ADDITIONAL_MARGIN;
      if (i === 0) {
        startPos = dynamicMargin;
      } else {
        const prevDynamicMargin = ICON_MARGIN + (visibleScales[i - 1] - 1) * ADDITIONAL_MARGIN;
        startPos = startPos + ICON_SIZE + prevDynamicMargin + dynamicMargin;
      }
      const center = startPos + ICON_SIZE / 2;
      centers.push(center);
    }
    const lastDynamicMargin = appsToRender.length > 0
      ? ICON_MARGIN + (visibleScales[appsToRender.length - 1] - 1) * ADDITIONAL_MARGIN
      : 0;
    const containerDimension = appsToRender.length > 0
      ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDynamicMargin
      : 0;
    return { centers, containerDimension };
  };

  // Compute dynamic background bounds based on icons’ effective positions for visible icons.
  const computeBackgroundBounds = () => {
    if (appsToRender.length === 0) return { start: 0, size: 0 };
    const { centers } = computeIconPositions();
    let minPos = Infinity;
    let maxPos = -Infinity;
    const visibleScales = paginationEnabled
      ? scales.slice(currentPage * iconsPerPage, currentPage * iconsPerPage + appsToRender.length)
      : scales;
    appsToRender.forEach((_, index) => {
      const effectiveStart = centers[index] - (ICON_SIZE / 2) * visibleScales[index];
      const effectiveEnd = centers[index] + (ICON_SIZE / 2) * visibleScales[index];
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
    outerContainerStyle = {
      position: 'fixed',
      bottom: `${DOCK_MARGIN}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10,
    };
  }

  // Icons container style: vertical (for left/right dock) or horizontal (for bottom dock).
  const iconsContainerStyle = isVerticalDock
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
  const backgroundStyle = isVerticalDock
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
    const dynamicMargin = ICON_MARGIN + (paginationEnabled
      ? (scales[currentPage * iconsPerPage + index] - 1) * ADDITIONAL_MARGIN
      : (scales[index] - 1) * ADDITIONAL_MARGIN);
    const baseStyle = {
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      transition: shouldTransition ? INITIAL_TRANSITION : NO_TRANSITION,
      transform: `scale(${paginationEnabled ? scales[currentPage * iconsPerPage + index] : scales[index]})`,
      cursor: 'pointer',
      position: 'relative',
      zIndex: 1,
    };

    if (isVerticalDock) {
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

  const iconImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '10%',
  };

  return (
    <div
      ref={outerRef}
      style={outerContainerStyle}
      onTouchStart={paginationEnabled ? handleTouchStart : null}
      onTouchEnd={paginationEnabled ? handleTouchEnd : null}
    >
      <div
        ref={iconsContainerRef}
        style={iconsContainerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div style={backgroundStyle} />
        {appsToRender.map((app, index) => (
          <div key={app.id} style={iconContainerStyle(index)} onClick={() => openApp(app)}>
            <img src={app.icon} alt={app.name} style={iconImageStyle} />
          </div>
        ))}
      </div>
      {paginationEnabled && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          {Array.from({ length: totalPages }).map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentPage(idx)}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                margin: '0 4px',
                background: idx === currentPage ? 'black' : 'lightgray',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dock;
