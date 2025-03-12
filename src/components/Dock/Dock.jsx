import React, { useContext, useState, useRef } from 'react';
import { AppsContext } from '../../services/AppsContext/AppsContext';
import DOCK_CONFIG from '../../configs/DockConfig/DockConfig';
import { useDeviceInfo } from '../../services/DeviceInfoProvider/DeviceInfoProvider';
import {
  getOuterContainerStyle,
  getIconsContainerStyle,
  getBackgroundStyle,
  getIconContainerStyle,
  iconImageStyle,
  getTooltipWrapperStyle,
  getTooltipBubbleStyle,
  getTooltipArrowStyle,
} from './DockStyle';

const Dock = () => {
  // Get device info (including orientation) from DeviceInfoProvider
  const deviceInfo = useDeviceInfo();
  const isPortrait = deviceInfo.orientation === 'portrait';

  // Determine configuration overrides based on device orientation and dock position
  let config = { ...DOCK_CONFIG };
  if (isPortrait && config.vertical) {
    config = { ...config, ...config.vertical };
  } else if (config.DOCK_POSITION === 'left' && config.left) {
    config = { ...config, ...config.left };
  } else if (config.DOCK_POSITION === 'right' && config.right) {
    config = { ...config, ...config.right };
  }

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
    DOTS_MARGIN_BOTTOM,
    APP_NAME_TOOLTIP_OFFSET,
    APP_NAME_BACKGROUND_PADDING,
    APP_NAME_FONT_SIZE,
  } = config;

  // Determine dock layout orientation: horizontal if bottom, vertical if left/right
  const isVerticalDock = DOCK_POSITION === 'left' || DOCK_POSITION === 'right';

  const { apps } = useContext(AppsContext);
  const dockApps = apps.filter((app) => app.indock);

  // Pagination settings
  const iconsPerPage = isPortrait ? (config.ICONS_PER_PAGE || 4) : dockApps.length;
  const paginationEnabled = isPortrait && dockApps.length > iconsPerPage;
  const totalPages = paginationEnabled ? Math.ceil(dockApps.length / iconsPerPage) : 1;
  const [currentPage, setCurrentPage] = useState(0);

  // Determine which apps to render based on current page
  const appsToRender = paginationEnabled
    ? dockApps.slice(currentPage * iconsPerPage, (currentPage + 1) * iconsPerPage)
    : dockApps;

  // Refs for outer container, icons container, and initial transition timer
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);
  const initialTransitionTimeoutRef = useRef(null);

  // State for scales for each icon (for the entire dockApps list)
  const [scales, setScales] = useState(dockApps.map(() => 1));
  // Controls whether to animate changes (true for initial transition, then false)
  const [shouldTransition, setShouldTransition] = useState(true);

  // Hovered app id to display the tooltip
  const [hoveredApp, setHoveredApp] = useState(null);
  // Active app id (clicked icon) - its tooltip will be hidden
  const [activeApp, setActiveApp] = useState(null);

  // Touch events for pagination
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
    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        newScales[startIndex + i] = 1;
      }
      setScales(newScales);
    }
  };

  // Mouse enter: enable smooth transition, then disable after a short timeout
  const handleMouseEnter = () => {
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    setShouldTransition(true);
    initialTransitionTimeoutRef.current = setTimeout(() => {
      setShouldTransition(false);
    }, 300);
  };

  // Mouse move: update magnification scales (if enabled)
  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
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

  // Mouse leave: reset scales
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

  // Compute positions to size the container & background
  const computeIconPositions = () => {
    const centers = [];
    let startPos = 0;
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

    const lastDynamicMargin =
      appsToRender.length > 0
        ? ICON_MARGIN + (visibleScales[appsToRender.length - 1] - 1) * ADDITIONAL_MARGIN
        : 0;

    const containerDimension =
      appsToRender.length > 0
        ? centers[centers.length - 1] + ICON_SIZE / 2 + lastDynamicMargin
        : 0;

    return { centers, containerDimension };
  };

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

  // Function to open/focus app and mark it as active so its tooltip is hidden
  const openApp = (app) => {
    setActiveApp(app.id);
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
    } else {
      console.log(`Launching or focusing app: ${app.id}`);
    }
  };

  return (
    <div
      ref={outerRef}
      style={getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN)}
      onTouchStart={paginationEnabled ? handleTouchStart : null}
      onTouchEnd={paginationEnabled ? handleTouchEnd : null}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          ref={iconsContainerRef}
          style={getIconsContainerStyle(isVerticalDock, DOCK_POSITION, ICON_SIZE, containerDimension)}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div style={getBackgroundStyle(isVerticalDock, bgStart, bgSize, DOCK_POSITION)} />
          {appsToRender.map((app, index) => (
            <div
              key={app.id}
              style={getIconContainerStyle({
                index,
                paginationEnabled,
                scales,
                currentPage,
                iconsPerPage,
                ICON_SIZE,
                ICON_MARGIN,
                ADDITIONAL_MARGIN,
                shouldTransition,
                INITIAL_TRANSITION,
                NO_TRANSITION,
                DOCK_POSITION,
              })}
              onClick={() => openApp(app)}
              onMouseEnter={() => setHoveredApp(app.id)}
              onMouseLeave={() => setHoveredApp(null)}
            >
              {/* Tooltip (app name) with fade-out only on mouse leave */}
              {!isPortrait && (
                <div style={getTooltipWrapperStyle(DOCK_POSITION, APP_NAME_TOOLTIP_OFFSET)}>
                  <div
                    style={{
                      ...getTooltipBubbleStyle(APP_NAME_BACKGROUND_PADDING, APP_NAME_FONT_SIZE),
                      opacity: hoveredApp === app.id && activeApp !== app.id ? 1 : 0,
                      // If an icon is hovered, remove any transition so the new tooltip appears immediately;
                      // otherwise (when hoveredApp is null) use fade-out.
                      transition: hoveredApp === null ? 'opacity 0.3s ease' : 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {app.name}
                    <div style={getTooltipArrowStyle(DOCK_POSITION)} />
                  </div>
                </div>
              )}
              <img src={app.icon} alt={app.name} style={iconImageStyle} />
            </div>
          ))}
        </div>
        {paginationEnabled && totalPages > 1 && (
          <div style={{ marginTop: `${DOTS_MARGIN_BOTTOM}px`, display: 'flex', justifyContent: 'center' }}>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPage(idx)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  margin: '0 4px',
                  background: idx === currentPage ? 'white' : 'black',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dock;
