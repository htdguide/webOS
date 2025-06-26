// src/components/Dock/Dock.jsx

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useDock } from '../../interactions/useDock/useDock.jsx';
import { AppsContext } from '../../contexts/AppsContext/AppsContext';
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

export default function Dock() {
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
    setCurrentPage,
  } = useDock({
    AppsContext,
    DOCK_CONFIG,
    useDeviceInfo,
    useStateManager,
    useLogger,
  });

  // keep opacity true until after slide finishes
  const [fadeVisible, setFadeVisible] = useState(isDockVisible);

  // measure Safari’s bottom toolbar on iPhone BEFORE paint
  const [toolbarOffset, setToolbarOffset] = useState(0);
  useLayoutEffect(() => {
    const updateOffset = () => {
      if (window.visualViewport) {
        // never go below zero
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

  useEffect(() => {
    let timer;
    if (isDockVisible) {
      setFadeVisible(true);
    } else {
      timer = setTimeout(() => setFadeVisible(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isDockVisible]);

  // base style (incl. your existing safe-area handling)
  const outerStyle = {
    ...getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN, isDockVisible),
    opacity: fadeVisible ? 1 : 0,
    top: 'auto', // ensure we don't accidentally get pushed to the top
  };

  // if bottom‐docked, include the clamped toolbarOffset
  if (DOCK_POSITION === 'bottom') {
    outerStyle.bottom = `calc(${toolbarOffset + DOCK_MARGIN}px + env(safe-area-inset-bottom))`;
  }

  return (
    <div
      ref={outerRef}
      style={outerStyle}
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

              {/* Open-indicator dot disabled */}
              {/*
                {openedApps.includes(app.id) && (
                  <div style={getOpenIndicatorStyle(DOCK_POSITION)} />
                )}
              */}
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
}
