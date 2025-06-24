// src/components/MissionControl/MissionManager.jsx

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import './MissionManager.css';

const SLIDE_DURATION = 300;   // match wrapper transition (ms)
// should match your CSS --desktop-panel-duration (default 2s)
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
  panelAnimations,
  createDesktop
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [baselineDesktopIds, setBaselineDesktopIds] = useState([]);

  // for wrapper shift
  const [isShifted, setIsShifted] = useState(false);
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  // for new-name fade
  const [newNamePhase, setNewNamePhase] = useState('idle'); // 'idle' | 'init' | 'animating'
  const [newNameIndex, setNewNameIndex] = useState(null);

  const panelRefs = useRef([]);

  // capture baseline IDs when overview opens
  useLayoutEffect(() => {
    if (overviewOpen) {
      setBaselineDesktopIds(desktops.map(d => d.id));
    }
  }, [overviewOpen]);

  // sync screenratio var
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

  // scroll active into view
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth', block: 'nearest', inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // when shifted, schedule animate-back
  useEffect(() => {
    if (!isShifted) return;
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

  // kick off name-fade when new desktop appears
  useEffect(() => {
    if (newNamePhase !== 'init' || newNameIndex === null) return;
    if (desktops.length <= newNameIndex) return;

    let fadeFrame, resetTimer;
    fadeFrame = setTimeout(() => {
      setNewNamePhase('animating');
      resetTimer = setTimeout(() => {
        setNewNamePhase('idle');
        setNewNameIndex(null);
      }, NEW_DESKTOP_ANIMATION_DURATION);
    }, 0);

    return () => {
      clearTimeout(fadeFrame);
      clearTimeout(resetTimer);
    };
  }, [desktops.length, newNamePhase, newNameIndex]);

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

  const handleNewClick = () => {
    if (isClosing) return;
    setIsShifted(true);
    setNewNamePhase('init');
    setNewNameIndex(desktops.length);
    createDesktop(false);
  };

  // sizing
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const shiftX = THUMB_W + 30;
  const centerIndex = (desktops.length - 1) / 2;

  // decide animations
  const animations =
    Array.isArray(panelAnimations) && panelAnimations.length === desktops.length
      ? panelAnimations
      : desktops.map(d =>
          baselineDesktopIds.includes(d.id)
            ? 'slideFromCenter'
            : 'slideFromRight'
        );

  const barClass = `mc-bar${isClosing ? ' closing' : ''}`;
  const wrapClass = `desktops-wrapper${isClosing ? ' closing' : ''}`;

  // —— wrapper style —— 
  const originalWrapperMargin = wrapperStyle.marginLeft ?? '0px';
  const mergedWrapperStyle = { ...wrapperStyle };
  if (isShifted && !isAnimatingBack) {
    mergedWrapperStyle.marginLeft = `${shiftX}px`;
    mergedWrapperStyle.transition = 'none';
  } else if (isAnimatingBack) {
    mergedWrapperStyle.marginLeft = originalWrapperMargin;
    mergedWrapperStyle.transition =
      'margin-left var(--desktop-panel-duration) var(--easing-flattened)';
  }

  // —— names row style —— 
  const mergedNamesStyle = { '--thumb-w': `${THUMB_W}px` };
  if (isShifted && !isAnimatingBack) {
    mergedNamesStyle.marginLeft = `${shiftX}px`;
    mergedNamesStyle.transition = 'none';
  } else if (isAnimatingBack) {
    mergedNamesStyle.marginLeft = '0px';
    mergedNamesStyle.transition =
      'margin-left var(--desktop-panel-duration) var(--easing-flattened)';
  }

  return (
    <>
      {overviewOpen && (
        <>
          <div className={barClass} onMouseEnter={() => setBarExpanded(true)}>
            <div className="mc-bar-names" style={mergedNamesStyle}>
              {desktops.map((desk, i) => {
                let nameStyle;
                if (i === newNameIndex && newNamePhase !== 'idle') {
                  if (newNamePhase === 'init') {
                    nameStyle = { opacity: 0, transition: 'none' };
                  } else if (newNamePhase === 'animating') {
                    nameStyle = {
                      opacity: 1,
                      // fade *only* over the last 100ms
                      transition: 'opacity 0.1s var(--easing-flattened) calc(var(--desktop-panel-duration) - 0.1s)'
                    };
                  }
                }

                return (
                  <span
                    key={desk.id}
                    className={i === activeIndex ? 'mc-bar-name active' : 'mc-bar-name'}
                    onClick={() => handleClick(i)}
                    style={nameStyle}
                  >
                    {desk.name || `Desktop ${i + 1}`}
                  </span>
                );
              })}
            </div>

            <button className="mc-bar-new" onClick={handleNewClick}>
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
