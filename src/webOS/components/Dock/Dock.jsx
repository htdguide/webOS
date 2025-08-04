// src/components/Dock/Dock.jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useDock } from '../../interactions/useDock/useDock.jsx';
import { AppsContext } from '../../contexts/AppsContext/AppsContext.jsx';
import DOCK_CONFIG from '../../configs/DockConfig/DockConfig';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useLogger } from '../../components/Logger/Logger.jsx';
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
import disabledOverlay from '../../media/icons/disable.png';

export default function Dock() {
  // 1) Portrait-mobile detection
  const [isMobilePortrait, setIsMobilePortrait] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window
      .matchMedia('(max-width: 768px) and (orientation: portrait)')
      .matches;
  });
  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(
      '(max-width: 768px) and (orientation: portrait)'
    );
    const handler = (e) => setIsMobilePortrait(e.matches);
    mql.addEventListener
      ? mql.addEventListener('change', handler)
      : mql.addListener(handler);
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener('change', handler)
        : mql.removeListener(handler);
    };
  }, []);

  // 2) Pick config
  const effectiveConfig = isMobilePortrait
    ? { ...DOCK_CONFIG, ...DOCK_CONFIG.vertical }
    : DOCK_CONFIG;

  // 3) Call our updated hook (no desktopId needed; dock is global)
  const {
    outerRef,
    iconsContainerRef,
    isDockVisible,
    paginationEnabled,
    isVerticalDock,
    dockApps,
    appsToRender,
    scales,
    shouldTransition,
    hoveredApp,
    activeApp,
    openedApps,
    currentPage,
    totalPages,
    iconsPerPage,
    containerDimension,
    bgStart,
    bgSize,
    DOCK_POSITION,
    DOCK_MARGIN,
    DOTS_MARGIN_BOTTOM,
    APP_NAME_TOOLTIP_OFFSET,
    APP_NAME_BACKGROUND_PADDING,
    APP_NAME_FONT_SIZE,
    ICON_SIZE,
    ICON_MARGIN,
    ADDITIONAL_MARGIN,
    INITIAL_TRANSITION,
    NO_TRANSITION,
    handleTouchStart,
    handleTouchEnd,
    handleMouseEnter,
    handleMouseMove,
    handleMouseLeave,
    openApp,
    handleIconMouseEnter,
    handleIconMouseLeave,
    setCurrentPage,
  } = useDock({
    AppsContext,
    DOCK_CONFIG: effectiveConfig,
    useDeviceInfo,
    useStateManager,
    useLogger,
  });

  // 4) Keyboard offset
  const [toolbarOffset, setToolbarOffset] = useState(0);
  useLayoutEffect(() => {
    const updateOffset = () => {
      if (window.visualViewport) {
        const diff = window.innerHeight - window.visualViewport.height;
        setToolbarOffset(diff > 0 ? diff : 0);
      }
    };
    updateOffset();
    window.visualViewport?.addEventListener('resize', updateOffset);
    window.addEventListener('resize', updateOffset);
    return () => {
      window.visualViewport?.removeEventListener('resize', updateOffset);
      window.removeEventListener('resize', updateOffset);
    };
  }, []);

  // 5) Fade in/out
  const [fadeVisible, setFadeVisible] = useState(isDockVisible);
  useEffect(() => {
    let id;
    if (isDockVisible) setFadeVisible(true);
    else id = setTimeout(() => setFadeVisible(false), 300);
    return () => clearTimeout(id);
  }, [isDockVisible]);

  // 6) Compute outer style (now animated)
  const outerStyle = {
    ...getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN, isDockVisible),
    opacity: fadeVisible ? 1 : 0,
    // Only override top/bottom for bottom‑positioned dock:
    ...(DOCK_POSITION === 'bottom'
      ? {
          top: 'auto',
          bottom: `calc(${toolbarOffset + DOCK_MARGIN}px + env(safe-area-inset-bottom))`,
        }
      : {
          bottom: 'auto',
        }),
  };

  const DOT_SIZE = 8;

  // —————————————————————————————————————
  // NEW: one‑shot component launcher (for apps that are just functions/components)
  // —————————————————————————————————————
  const [launchedComponents, setLaunchedComponents] = useState([]);

  const handleIconClick = (app) => {
    // keep original dock behavior
    openApp(app.id);

    // if this app object has a React component attached, mount it
    if (app.component && typeof app.component === 'function') {
      setLaunchedComponents((prev) => [...prev, app.component]);
    }
  };

  return (
    <>
      <div
        ref={outerRef}
        style={outerStyle}
        onTouchStart={paginationEnabled ? handleTouchStart : undefined}
        onTouchEnd={paginationEnabled ? handleTouchEnd : undefined}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          <div
            ref={iconsContainerRef}
            style={getIconsContainerStyle(isVerticalDock, DOCK_POSITION, ICON_SIZE, containerDimension)}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div style={getBackgroundStyle(isVerticalDock, bgStart, bgSize, DOCK_POSITION)} />

            {appsToRender.map((app, idx) => {
              const isOpen = openedApps.includes(app.id);
              return (
                <div
                  key={app.id}
                  style={{
                    ...getIconContainerStyle({
                      index: idx,
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
                    }),
                    position: 'relative',
                  }}
                  onClick={() => handleIconClick(app)}
                  onMouseEnter={() => handleIconMouseEnter(app.id)}
                  onMouseLeave={handleIconMouseLeave}
                >
                  {!paginationEnabled && (
                    <div style={getTooltipWrapperStyle(DOCK_POSITION, APP_NAME_TOOLTIP_OFFSET)}>
                      <div
                        style={{
                          ...getTooltipBubbleStyle(APP_NAME_BACKGROUND_PADDING, APP_NAME_FONT_SIZE),
                          opacity: hoveredApp === app.id ? 1 : 0,
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

                  {!app.available && (
                    <img
                      src={disabledOverlay}
                      alt={`${app.name} disabled`}
                      style={{ ...iconImageStyle, position: 'absolute', top: 0, left: 0, opacity: 0.9, pointerEvents: 'none' }}
                    />
                  )}

                  {isOpen && <div style={getOpenIndicatorStyle(DOCK_POSITION)} />}
                </div>
              );
            })}
          </div>

          {paginationEnabled && totalPages > 1 && (
            <div
              style={{
                position: 'absolute',
                bottom: `-${DOTS_MARGIN_BOTTOM + DOT_SIZE}px`,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  style={{
                    width: `${DOT_SIZE}px`,
                    height: `${DOT_SIZE}px`,
                    borderRadius: '50%',
                    margin: '0 4px',
                    background: i === currentPage ? 'white' : 'black',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Render any one‑shot components you've launched */}
      {launchedComponents.map((Comp, idx) => (
        <Comp
          key={idx}
          onClose={() =>
            setLaunchedComponents((prev) => prev.filter((_, i) => i !== idx))
          }
        />
      ))}
    </>
  );
}
