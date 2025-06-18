// src/components/MissionControl/MissionManager.jsx

import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import './MissionManager.css';

const FADE_DURATION = 300;   // match CSS fade timing (ms)
const SLIDE_DURATION = 300;  // match wrapper transition (ms)

const MissionManager = ({
  desktops,
  activeIndex,
  instantSwitchDesktop,
  exitOverview,
  setBarExpanded,
  wrapperStyle,
  overviewOpen,
  onDragStart,
  onDragOver,
  onDrop,
  viewport,
  panelAnimations,   // optional override array
  /**
   * NEW: createDesktop now accepts an optional boolean:
   *   createDesktop(shouldSwitch: boolean = true)
   */
  createDesktop
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // **baselineDesktopIds** holds the list of desktop IDs
  // that are “existing” at the moment the overview opens.
  const [baselineDesktopIds, setBaselineDesktopIds] = useState([]);

  const panelRefs = useRef([]);

  // Capture the current desktops as “existing” exactly when
  // overviewOpen flips to true. Using useLayoutEffect prevents a
  // one-frame mismatch on the first render.
  useLayoutEffect(() => {
    if (overviewOpen) {
      setBaselineDesktopIds(desktops.map(d => d.id));
    }
  }, [overviewOpen]);

  // --screenratio var
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

  // scroll into view
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth', block: 'nearest', inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

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

  // **NEW**: don’t switch when clicking “+ New”
  const handleNewClick = () => {
    createDesktop(false);
  };

  // thumbnail sizing
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const centerIndex = (desktops.length - 1) / 2;

  // Determine animations:
  // - If panelAnimations prop is provided and matches, use that
  // - Otherwise, for each desk:
  //     • if its ID is in baselineDesktopIds ⇒ ‘slideFromCenter’
  //     • else (i.e. newly added since open) ⇒ ‘slideFromRight’
  const animations = Array.isArray(panelAnimations) && panelAnimations.length === desktops.length
    ? panelAnimations
    : desktops.map(desk =>
        baselineDesktopIds.includes(desk.id)
          ? 'slideFromCenter'
          : 'slideFromRight'
      );

  const barClass = `mc-bar${isClosing ? ' closing' : ''}`;
  const wrapClass = `desktops-wrapper${isClosing ? ' closing' : ''}`;

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
                  className={
                    i === activeIndex
                      ? 'mc-bar-name active'
                      : 'mc-bar-name'
                  }
                  onClick={() => handleClick(i)}
                >
                  {desk.name || `Desktop ${i + 1}`}
                </span>
              ))}
            </div>

            {/* + New button on the right edge */}
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

      <div className={wrapClass} style={wrapperStyle}>
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
