// src/components/Dock/Dock.jsx

/**
 * Renders the global Dock with:
 * - responsive portrait vs. desktop layout
 * - persistent fade in/out and slide-in on initial load
 * - pagination, magnification, tooltips, and one-shot component launches
 *
 * Areas:
 * 1: Imports & Hooks Setup
 *   1.1: React & style imports
 *   1.2: Custom hooks & config imports
 *   1.3: Core state (fade, load animation, portrait)
 *   1.4: One-shot component launcher state
 *   1.5: useDock hook unpacking
 * 2: Effects (orientation, resize, fade, load)
 *   2.1: Mobile portrait listener
 *   2.2: Keyboard/viewport offset
 *   2.3: Fade visibility
 *   2.4: Animate-on-load trigger
 * 3: Style Computation
 *   3.1: Slide-in appearance flag
 *   3.2: Outer container style
 * 4: Render Dock & Icons
 *   4.1: Icon grid with tooltips, disabled overlay, open indicator
 *   4.2: Pagination dots
 * 5: Render launched one-shot components
 */

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

// —————————————————————————————————————
// Area 1: Imports & Hooks Setup
// —————————————————————————————————————
export default function Dock() {
  // 1.3: Core state for fade, load animation, and portrait detection
  const [isMobilePortrait, setIsMobilePortrait] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window
      .matchMedia('(max-width: 768px) and (orientation: portrait)')
      .matches;
  });
  const [fadeVisible, setFadeVisible] = useState(false);
  const [animateOnLoad, setAnimateOnLoad] = useState(false);

  // 1.4: One-shot component launcher state
  const [launchedComponents, setLaunchedComponents] = useState([]);

  // 1.5: useDock hook unpacking
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
    DOCK_CONFIG: isMobilePortrait
      ? { ...DOCK_CONFIG, ...DOCK_CONFIG.vertical }
      : DOCK_CONFIG,
    useDeviceInfo,
    useStateManager,
    useLogger,
  });

  // —————————————————————————————————————
  // Area 2: Effects
  // —————————————————————————————————————

  // 2.1: Mobile portrait listener
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

  // 2.2: Keyboard/viewport offset
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

  // 2.3: Fade visibility when docking toggles
  useEffect(() => {
    let id;
    if (isDockVisible) setFadeVisible(true);
    else id = setTimeout(() => setFadeVisible(false), 300);
    return () => clearTimeout(id);
  }, [isDockVisible]);

  // 2.4: Animate-on-load trigger
  useEffect(() => {
    setAnimateOnLoad(true);
  }, []);

  // —————————————————————————————————————
  // Area 3: Style Computation
  // —————————————————————————————————————

  // 3.1: Slide-in appearance flag
  const shouldAppear = animateOnLoad && isDockVisible;

  // 3.2: Outer container style (transform + opacity)
  const outerStyle = {
    ...getOuterContainerStyle(DOCK_POSITION, DOCK_MARGIN, shouldAppear),
    opacity: fadeVisible ? 1 : 0,
    ...(DOCK_POSITION === 'bottom'
      ? {
          top: 'auto',
          bottom: `calc(${toolbarOffset + DOCK_MARGIN}px + env(safe-area-inset-bottom))`,
        }
      : { bottom: 'auto' }),
  };

  const DOT_SIZE = 8;

  // —————————————————————————————————————
  // Area 4: Render Dock & Icons
  // —————————————————————————————————————
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
                  onClick={() => {
                    openApp(app.id);
                    if (app.component && typeof app.component === 'function') {
                      setLaunchedComponents(prev => [...prev, app.component]);
                    }
                  }}
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

          {/* 4.2: Pagination dots */}
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

      {/* 5: Render launched one-shot components */}
      {launchedComponents.map((Comp, idx) => (
        <Comp
          key={idx}
          onClose={() =>
            setLaunchedComponents(prev => prev.filter((_, i) => i !== idx))
          }
        />
      ))}
    </>
  );
}
