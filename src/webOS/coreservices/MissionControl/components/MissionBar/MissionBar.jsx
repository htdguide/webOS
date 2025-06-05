// src/components/MissionControl/MissionBar.jsx
import React from 'react';
import './MissionBar.css';

const MissionBar = ({
  desktops,
  activeIndex,
  instantSwitchDesktop,
  exitOverview,
  setBarExpanded
}) => {
  return (
    <>
      <div
        className="mc-bar"
        onMouseEnter={() => setBarExpanded(true)}
      >
        <div className="mc-bar-names">
          {desktops.map((_, i) => (
            <span
              key={desktops[i].id}
              className={i === activeIndex ? 'mc-bar-name active' : 'mc-bar-name'}
              onClick={() => {
                instantSwitchDesktop(i);
                exitOverview(false);
              }}
            >
              Desktop {i + 1}
            </span>
          ))}
        </div>
      </div>
      <div
        className="mc-exit-overlay"
        onClick={() => exitOverview(true)}
      />
    </>
  );
};

export default MissionBar;
