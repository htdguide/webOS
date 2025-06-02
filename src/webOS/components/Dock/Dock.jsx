// src/components/Dock/Dock.jsx

import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppsContext } from '../../contexts/AppsContext/AppsContext';
import DOCK_CONFIG from '../../configs/DockConfig/DockConfig';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
// Use the new StateManager hook instead of the old UIStateStorage.
import { useStateManager } from '../../stores/StateManager/StateManager';
import {
  getOuterContainerStyle,
  getIconsContainerStyle,
  getBackgroundStyle,
  getIconContainerStyle,
  iconImageStyle,
  getTooltipWrapperStyle,
  getTooltipBubbleStyle,
  getTooltipArrowStyle,
  getOpenIndicatorStyle,
} from './DockStyle';
import { useLogger } from '../Logger/Logger.jsx';

const Dock = () => {
  // Initialize logger for this component
  const { log, enabled } = useLogger('Dock');

  // Get device info (including orientation) from DeviceInfoProvider.
  const deviceInfo = useDeviceInfo();
  const isPortrait = deviceInfo.orientation === 'portrait';

  if (enabled) {
    log('render', `Device orientation: ${deviceInfo.orientation}`);
  }

  // Get dock visibility from the state manager.
  const { state } = useStateManager();
  // Read dockVisible from the "dock" group (stored as a string).
  const isDockVisible =
    state.groups.dock &&
    state.groups.dock.dockVisible &&
    state.groups.dock.dockVisible === 'true';

  if (enabled) {
    log('config', `Dock visibility: ${isDockVisible}`);
  }

  // Determine configuration overrides based on device orientation and dock position.
  let config = { ...DOCK_CONFIG };
  if (isPortrait && config.vertical) {
    if (enabled) log('config', 'Applying portrait vertical overrides');
    config = { ...config, ...config.vertical };
  } else if (config.DOCK_POSITION === 'left' && config.left) {
    if (enabled) log('config', 'Applying left-position overrides');
    config = { ...config, ...config.left };
  } else if (config.DOCK_POSITION === 'right' && config.right) {
    if (enabled) log('config', 'Applying right-position overrides');
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
    ICONS_PER_PAGE,
  } = config;

  if (enabled) {
    log(
      'config',
      `Dock config: POSITION=${DOCK_POSITION}, ICON_SIZE=${ICON_SIZE}, ICON_MARGIN=${ICON_MARGIN}`
    );
  }

  // Determine dock layout orientation: horizontal if bottom, vertical if left/right.
  const isVerticalDock = DOCK_POSITION === 'left' || DOCK_POSITION === 'right';

  const { apps, openedApps, setOpenedApps } = useContext(AppsContext);
  // Include apps that are normally in the dock and those open but not in the dock.
  const baseDockApps = apps.filter((app) => app.indock);
  const extraOpenApps = apps.filter(
    (app) => !app.indock && openedApps.includes(app.id)
  );
  const dockApps = [...baseDockApps.sort((a, b) => a.priority - b.priority), ...extraOpenApps];

  if (enabled) {
    log('render', `Total dock apps (base + extra): ${dockApps.length}`);
  }

  // Pagination settings.
  const iconsPerPage = isPortrait ? ICONS_PER_PAGE || 4 : dockApps.length;
  const paginationEnabled = isPortrait && dockApps.length > iconsPerPage;
  const totalPages = paginationEnabled ? Math.ceil(dockApps.length / iconsPerPage) : 1;
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (enabled && paginationEnabled) {
      log('layout', `Pagination enabled: pages=${totalPages}, currentPage=${currentPage}`);
    }
  }, [currentPage, paginationEnabled, totalPages, enabled]);

  // Determine which apps to render based on current page.
  const appsToRender = paginationEnabled
    ? dockApps.slice(currentPage * iconsPerPage, (currentPage + 1) * iconsPerPage)
    : dockApps;

  // Refs for outer container, icons container, and initial transition timer.
  const outerRef = useRef(null);
  const iconsContainerRef = useRef(null);
  const initialTransitionTimeoutRef = useRef(null);

  // State for scales for each icon and control of transitions.
  const [scales, setScales] = useState(dockApps.map(() => 1));
  const [shouldTransition, setShouldTransition] = useState(true);
  const [hoveredApp, setHoveredApp] = useState(null);
  const [activeApp, setActiveApp] = useState(null);

  // Touch events for pagination.
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (e) => {
    const startX = e.touches[0].clientX;
    if (enabled) {
      log('userInteraction', `Touch start at x=${startX}`);
    }
    setTouchStartX(startX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    const swipeThreshold = 50; // threshold in pixels

    if (deltaX < -swipeThreshold && currentPage < totalPages - 1) {
      if (enabled) {
        log('userInteraction', `Swipe left detected: changing to page ${currentPage + 1}`);
      }
      setCurrentPage(currentPage + 1);
    } else if (deltaX > swipeThreshold && currentPage > 0) {
      if (enabled) {
        log('userInteraction', `Swipe right detected: changing to page ${currentPage - 1}`);
      }
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
      if (enabled) {
        log('layout', `Reset scales after pagination to 1 for indices ${startIndex}–${startIndex + appsToRender.length - 1}`);
      }
    }
  };

  // Mouse events for enabling/disabling transition and updating magnification scales.
  const handleMouseEnter = () => {
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    setShouldTransition(true);
    initialTransitionTimeoutRef.current = setTimeout(() => {
      setShouldTransition(false);
      if (enabled) {
        log('layout', 'Initial transition complete, disabling transition');
      }
    }, 300);
    if (enabled) {
      log('userInteraction', 'Mouse entered dock area');
    }
  };

  const handleMouseMove = (e) => {
    if (!iconsContainerRef.current) return;
    const containerRect = iconsContainerRef.current.getBoundingClientRect();
    const mousePos = isVerticalDock
      ? e.clientY - containerRect.top
      : e.clientX - containerRect.left;

    if (enabled) {
      log('userInteraction', `Mouse move at ${isVerticalDock ? 'y' : 'x'}=${mousePos}`);
    }

    if (!ENABLE_MAGNIFICATION) {
      if (paginationEnabled) {
        const newScales = [...scales];
        const startIndex = currentPage * iconsPerPage;
        for (let i = 0; i < appsToRender.length; i++) {
          newScales[startIndex + i] = 1;
        }
        setScales(newScales);
        if (enabled) {
          log('layout', 'Magnification disabled: resetting scales to 1 for current page');
        }
      } else {
        setScales(dockApps.map(() => 1));
        if (enabled) {
          log('layout', 'Magnification disabled: resetting all scales to 1');
        }
      }
      return;
    }

    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + i * (ICON_SIZE + 2 * ICON_MARGIN);
        const distance = Math.abs(mousePos - baseCenter);
        const scale =
          distance > DOCK_SPREAD
            ? 1
            : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
        newScales[startIndex + i] = scale;
      }
      setScales(newScales);
      if (enabled) {
        log('layout', `Updated scales for paginationEnabled at page ${currentPage}: [${newScales.slice(startIndex, startIndex + appsToRender.length).join(', ')}]`);
      }
    } else {
      const newScales = [];
      dockApps.forEach((_, index) => {
        const baseCenter = ICON_MARGIN + ICON_SIZE / 2 + index * (ICON_SIZE + 2 * ICON_MARGIN);
        const distance = Math.abs(mousePos - baseCenter);
        const scale =
          distance > DOCK_SPREAD
            ? 1
            : 1 + (MAX_SCALE - 1) * (1 - distance / DOCK_SPREAD);
        newScales.push(scale);
      });
      setScales(newScales);
      if (enabled) {
        log('layout', `Updated scales for all dock apps: [${newScales.join(', ')}]`);
      }
    }
  };

  const handleMouseLeave = () => {
    if (paginationEnabled) {
      const newScales = [...scales];
      const startIndex = currentPage * iconsPerPage;
      for (let i = 0; i < appsToRender.length; i++) {
        newScales[startIndex + i] = 1;
      }
      setScales(newScales);
      if (enabled) {
        log('layout', `Mouse left dock (pagination): reset scales for current page ${currentPage}`);
      }
    } else {
      setScales(dockApps.map(() => 1));
      if (enabled) {
        log('layout', 'Mouse left dock: reset all scales to 1');
      }
    }
    setShouldTransition(true);
    if (initialTransitionTimeoutRef.current) {
      clearTimeout(initialTransitionTimeoutRef.current);
    }
    if (enabled) {
      log('userInteraction', 'Mouse left dock area');
    }
  };

  // Compute positions for the container and background.
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

    if (enabled) {
      log('layout', `Computed icon positions: centers=[${centers.join(', ')}], containerDimension=${containerDimension}`);
    }

    return { centers, containerDimension };
  };

  const computeBackgroundBounds = () => {
    if (appsToRender.length === 0) {
      if (enabled) {
        log('layout', 'No apps to render: background bounds start=0, size=0');
      }
      return { start: 0, size: 0 };
    }

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

    const start = minPos;
    const size = maxPos - minPos;

    if (enabled) {
      log('layout', `Computed background bounds: start=${start}, size=${size}`);
    }

    return { start, size };
  };

  const { start: bgStart, size: bgSize } = computeBackgroundBounds();
  const { containerDimension } = computeIconPositions();

  // Open or focus an app.
  const openApp = (app) => {
    setActiveApp(app.id);
    if (enabled) {
      log('userInteraction', `Opening/focusing app: ${app.id}`);
    }
    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
      if (enabled) {
        log('behavior', `Opened external link for app: ${app.id}`);
      }
    } else {
      setOpenedApps((prevOpenedApps) => {
        if (!prevOpenedApps.includes(app.id)) {
          if (enabled) {
            log('behavior', `Adding app to openedApps: ${app.id}`);
          }
          return [...prevOpenedApps, app.id];
        }
        if (enabled) {
          log('behavior', `App already open, focusing: ${app.id}`);
        }
        return prevOpenedApps;
      });
    }
  };

  return (
    <div
      ref={outerRef}
      style={getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN, isDockVisible)}
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
              onMouseEnter={() => {
                setHoveredApp(app.id);
                if (enabled) {
                  log('userInteraction', `Mouse entered icon container for app: ${app.id}`);
                }
              }}
              onMouseLeave={() => {
                setHoveredApp(null);
                if (enabled) {
                  log('userInteraction', `Mouse left icon container for app: ${app.id}`);
                }
              }}
            >
              {!isPortrait && (
                <div style={getTooltipWrapperStyle(DOCK_POSITION, APP_NAME_TOOLTIP_OFFSET)}>
                  <div
                    style={{
                      ...getTooltipBubbleStyle(APP_NAME_BACKGROUND_PADDING, APP_NAME_FONT_SIZE),
                      opacity: hoveredApp === app.id && activeApp !== app.id ? 1 : 0,
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
              {openedApps.includes(app.id) && <div style={getOpenIndicatorStyle(DOCK_POSITION)} />}
            </div>
          ))}
        </div>
        {paginationEnabled && totalPages > 1 && (
          <div style={{ marginTop: `${DOTS_MARGIN_BOTTOM}px`, display: 'flex', justifyContent: 'center' }}>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCurrentPage(idx);
                  if (enabled) {
                    log('userInteraction', `Pagination dot clicked: switching to page ${idx}`);
                  }
                }}
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
