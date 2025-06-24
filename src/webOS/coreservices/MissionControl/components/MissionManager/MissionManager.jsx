// src/components/MissionControl/MissionManager.jsx

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import './MissionManager.css';

const FADE_DURATION = 300;   // match CSS fade timing (ms)
const SLIDE_DURATION = 300;  // match wrapper transition (ms)
// panel slideFromRight duration is pulled from CSS var --desktop-panel-duration (default 2s)
const NEW_DESKTOP_ANIMATION_DURATION = 2000;

const MissionManager = ({
  desktops,
  activeIndex,
  instantSwitchDesktop,
  exitOverview,
  setBarExpanded,
  wrapperStyle = {},
  overviewOpen,
  onDragStart,
  onDragOver,
  onDrop,
  viewport,
  panelAnimations,   // optional override array
  /** createDesktop(shouldSwitch: boolean = true) **/
  createDesktop
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [baselineDesktopIds, setBaselineDesktopIds] = useState([]);
  // NEW: manage wrapper shift animation state
  const [isShifted, setIsShifted] = useState(false);
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  const panelRefs = useRef([]);

  // Capture baseline desktop IDs as soon as overview opens
  useLayoutEffect(() => {
    if (overviewOpen) {
      setBaselineDesktopIds(desktops.map(d => d.id));
    }
  }, [overviewOpen]);

  // Keep --screenratio in sync
  useEffect(() => {
    const update = () => {
      document.documentElement.style.setProperty(
        '--screenratio',
        window.innerWidth / window.innerHeight
      );
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Scroll active panel into view
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth', block: 'nearest', inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // When isShifted flips on, schedule the “animate back” on next tick,
  // then clear both flags after the panel animation duration.
  useEffect(() => {
    if (!isShifted) return;
    // next tick
    const frame = setTimeout(() => {
      setIsAnimatingBack(true);
      const timeout = setTimeout(() => {
        setIsAnimatingBack(false);
        setIsShifted(false);
      }, NEW_DESKTOP_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, 0);
    return () => clearTimeout(frame);
  }, [isShifted]);

  const handleExit = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      exitOverview(true);
      setIsClosing(false);
    }, SLIDE_DURATION);
  };

  const handleClick = i => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      instantSwitchDesktop(i);
      exitOverview(false);
      setIsClosing(false);
    }, SLIDE_DURATION);
  };

  // NEW: trigger a shift and then create the desktop
  const handleNewClick = () => {
    if (isClosing) return;
    setIsShifted(true);
    createDesktop(false);
  };

  // Thumbnail sizing math
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const shiftX = THUMB_W + 30;              // amount to shift wrapper
  const centerIndex = (desktops.length - 1) / 2;

  // Decide per-panel animation
  const animations = Array.isArray(panelAnimations) && panelAnimations.length === desktops.length
    ? panelAnimations
    : desktops.map(desk =>
        baselineDesktopIds.includes(desk.id)
          ? 'slideFromCenter'
          : 'slideFromRight'
      );

  const barClass = `mc-bar${isClosing ? ' closing' : ''}`;
  const wrapClass = `desktops-wrapper${isClosing ? ' closing' : ''}`;

  // figure out original marginLeft (fallback to zero)
  const originalMarginLeft = wrapperStyle.marginLeft ?? '0px';

  // Merge wrapperStyle prop with our margin-left shift/return logic
  const mergedWrapperStyle = { ...wrapperStyle };

  if (isShifted && !isAnimatingBack) {
    // Instant shift to the right
    mergedWrapperStyle.marginLeft = `${shiftX}px`;
    mergedWrapperStyle.transition = 'none';
  } else if (isAnimatingBack) {
    // Smooth return over panel duration & easing
    mergedWrapperStyle.marginLeft = originalMarginLeft;
    mergedWrapperStyle.transition = 'margin-left var(--desktop-panel-duration) var(--easing-flattened)';
  }

  return (
    <>
      {overviewOpen && (
        <>
          <div
            className={barClass}
            onMouseEnter={() => setBarExpanded(true)}
          >
            <div
              className="mc-bar-names"
              style={{ '--thumb-w': `${THUMB_W}px` }}
            >
              {desktops.map((desk, i) => (
                <span
                  key={desk.id}
                  className={i === activeIndex ? 'mc-bar-name active' : 'mc-bar-name'}
                  onClick={() => handleClick(i)}
                >
                  {desk.name || `Desktop ${i + 1}`}
                </span>
              ))}
            </div>

            {/* + New button */}
            <button
              className="mc-bar-new"
              onClick={handleNewClick}
            >
              + New
            </button>
          </div>
          <div className="mc-exit-overlay" onClick={handleExit} />
        </>
      )}

      <div className={wrapClass} style={mergedWrapperStyle}>
        {desktops.map((desk, i) => (
          <div
            ref={el => (panelRefs.current[i] = el)}
            key={desk.id}
            className="desktop-panel"
            draggable={overviewOpen}
            onDragStart={overviewOpen ? e => onDragStart(e, i) : undefined}
            onDragOver={overviewOpen ? onDragOver : undefined}
            onDrop={overviewOpen ? e => onDrop(e, i) : undefined}
            onClick={overviewOpen ? () => handleClick(i) : undefined}
            style={
              overviewOpen
                ? {
                    width: `${THUMB_W}px`,
                    height: `${THUMB_H}px`,
                    '--tx': `${-(i - centerIndex) * (THUMB_W + 30)}px`,
                    '--ty': `-120px`,
                    '--panel-animation': animations[i],
                    '--panel-duration':
                      animations[i] === 'slideFromCenter'
                        ? 'var(--bar-slide-duration)'
                        : '2s',
                    '--panel-easing': 'var(--easing-flattened)'
                  }
                : undefined
            }
          >
            {overviewOpen && <div className="desktop-panel-overlay" />}
            <div
              className="desktop-scale-wrapper"
              style={
                overviewOpen
                  ? {
                      width: viewport.width,
                      height: viewport.height,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left'
                    }
                  : {}
              }
            >
              {desk.ui}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MissionManager;
