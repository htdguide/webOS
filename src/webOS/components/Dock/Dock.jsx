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
import disabledOverlay from '../../media/icons/disable.png'; // your 30%-opacity overlay image

export default function Dock() {
  // 1) Synchronously detect portrait-mobile on first render:
  const [isMobilePortrait, setIsMobilePortrait] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return false;
    }
    return window.matchMedia(
      '(max-width: 768px) and (orientation: portrait)'
    ).matches;
  });

  // 2) Keep it up-to-date on resize/orientation changes:
  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia('(max-width: 768px) and (orientation: portrait)');
    const handler = (e) => setIsMobilePortrait(e.matches);

    if (mql.addEventListener) {
      mql.addEventListener('change', handler);
    } else {
      mql.addListener(handler);
    }
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler);
      } else {
        mql.removeListener(handler);
      }
    };
  }, []);

  // 3) Choose the effective config each render:
  const effectiveConfig = isMobilePortrait
    ? { ...DOCK_CONFIG, ...DOCK_CONFIG.vertical }
    : DOCK_CONFIG;

  // 4) Always call the hook in the same place:
  const {
    outerRef,
    iconsContainerRef,
    isDockVisible,
    paginationEnabled,
    isVerticalDock,
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
    setCurrentPage, // now our animated changer
  } = useDock({
    AppsContext,
    DOCK_CONFIG: effectiveConfig,
    useDeviceInfo,
    useStateManager,
    useLogger,
  });

  // rest of your state+effects unchanged:

  const [fadeVisible, setFadeVisible] = useState(isDockVisible);
  const [toolbarOffset, setToolbarOffset] = useState(0);

  // adjust for on-screen keyboard
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

  // fade in/out
  useEffect(() => {
    let timer;
    if (isDockVisible) {
      setFadeVisible(true);
    } else {
      timer = setTimeout(() => setFadeVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isDockVisible]);

  // compute outer style
  const outerStyle = {
    ...getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN, isDockVisible),
    opacity: fadeVisible ? 1 : 0,
    top: 'auto',
  };
  if (DOCK_POSITION === 'bottom') {
    outerStyle.bottom = `calc(${toolbarOffset + DOCK_MARGIN}px + env(safe-area-inset-bottom))`;
  }

  const DOT_SIZE = 8;

  return (
    <div
      ref={outerRef}
      style={outerStyle}
      onTouchStart={paginationEnabled ? handleTouchStart : null}
      onTouchEnd={paginationEnabled ? handleTouchEnd : null}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
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
              style={{
                ...getIconContainerStyle({
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
                }),
                position: 'relative',
              }}
              onClick={() => openApp(app)}
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
                  style={{
                    ...iconImageStyle,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    opacity: 0.9,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {activeApp === app.id && (
                <div style={getOpenIndicatorStyle(DOCK_POSITION)} />
              )}
            </div>
          ))}
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
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentPage(idx)}
                style={{
                  width: `${DOT_SIZE}px`,
                  height: `${DOT_SIZE}px`,
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
}
