// src/components/MissionControl/MissionBar/MissionBar.jsx

import React, { useRef, useEffect } from 'react';
import './MissionManager.css';

const FADE_DURATION = 300;   // match CSS fade timing (ms)
const SLIDE_DURATION = 300;  // match wrapper transition (ms)

const MissionBar = ({
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
  // Refs to track each “panel” so we can scroll the active one into view
  const panelRefs = useRef([]);

  // When Mission Control is open, scroll the active thumbnail into view
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // Compute sizing for thumbnails (same math as before)
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const centerIndex = (desktops.length - 1) / 2;

  return (
    <>
      {/* ---------- Only show the top bar and exit overlay when overviewOpen is true ---------- */}
      {overviewOpen && (
        <>
          <div
            className="mc-bar"
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
                  onClick={() => {
                    instantSwitchDesktop(i);
                    exitOverview(false);
                  }}
                >
                  {desk.name || `Desktop ${i + 1}`}
                </span>
              ))}
            </div>
          </div>
          <div
            className="mc-exit-overlay"
            onClick={() => exitOverview(true)}
          />
        </>
      )}

      {/* ---------- Desktops Wrapper (always rendered) ---------- */}
      <div className="desktops-wrapper" style={wrapperStyle}>
        {desktops.map((desk, i) => (
          <div
            ref={el => (panelRefs.current[i] = el)}
            key={desk.id}
            className="desktop-panel"
            draggable={overviewOpen}
            onDragStart={overviewOpen ? e => onDragStart(e, i) : undefined}
            onDragOver={overviewOpen ? onDragOver : undefined}
            onDrop={overviewOpen ? e => onDrop(e, i) : undefined}
            onClick={
              overviewOpen
                ? () => {
                    instantSwitchDesktop(i);
                    exitOverview(false);
                  }
                : undefined
            }
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

export default MissionBar;
