import React, { useRef, useEffect, useState } from 'react';
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
  viewport
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const panelRefs = useRef([]);

  // Scroll active into view when opening
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // Kick off the closing animation, then actually close
  const handleExitOverlayClick = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      exitOverview(true);
      setIsClosing(false);
    }, SLIDE_DURATION);
  };

  const handleDesktopClick = (i) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      instantSwitchDesktop(i);
      exitOverview(false);
      setIsClosing(false);
    }, SLIDE_DURATION);
  };

  // thumbnail sizing math
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const centerIndex = (desktops.length - 1) / 2;

  // dynamic classes
  const barClassName = `mc-bar${isClosing ? ' closing' : ''}`;
  const wrapperClassName = `desktops-wrapper${isClosing ? ' closing' : ''}`;

  return (
    <>
      {overviewOpen && (
        <>
          <div
            className={barClassName}
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
                  onClick={() => handleDesktopClick(i)}
                >
                  {desk.name || `Desktop ${i + 1}`}
                </span>
              ))}
            </div>
          </div>
          <div
            className="mc-exit-overlay"
            onClick={handleExitOverlayClick}
          />
        </>
      )}

      <div className={wrapperClassName} style={wrapperStyle}>
        {desktops.map((desk, i) => (
          <div
            ref={el => (panelRefs.current[i] = el)}
            key={desk.id}
            className="desktop-panel"
            draggable={overviewOpen}
            onDragStart={overviewOpen ? e => onDragStart(e, i) : undefined}
            onDragOver={overviewOpen ? onDragOver : undefined}
            onDrop={overviewOpen ? e => onDrop(e, i) : undefined}
            onClick={overviewOpen ? () => handleDesktopClick(i) : undefined}
            style={
              overviewOpen
                ? {
                    width: `${THUMB_W}px`,
                    height: `${THUMB_H}px`,
                    '--tx': `${-(i - centerIndex) * (THUMB_W + 30)}px`,
                    '--ty': `-120px`
                  }
                : undefined
            }
          >
            <div
              className="desktop-scale-wrapper"
              style={
                overviewOpen
                  ? {
                      width: viewport.width,
                      height: viewport.height,
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      pointerEvents: 'none'
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
