// MissionControl.jsx
import React, { createContext, useState, useCallback } from 'react';
import SystemUI from '../SystemUI/SystemUI.jsx';
import './MissionControl.css';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_index) => {},
  deleteDesktop: (_index) => {},
  activeIndex: 0,
  desktops: []
});

const MissionControl = () => {
  const [desktops, setDesktops] = useState([{ id: Date.now() }]);
  const [activeIndex, setActiveIndex] = useState(0);

  const createDesktop = useCallback(() => {
    const newDesk = { id: Date.now() };
    setDesktops(prev => [...prev, newDesk]);
    setActiveIndex(prev => prev + 1);
  }, []);

  const switchDesktop = useCallback((index) => {
    if (index >= 0 && index < desktops.length) {
      setActiveIndex(index);
    }
  }, [desktops]);

  const deleteDesktop = useCallback((index) => {
    if (desktops.length === 1) return;
    setDesktops(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(prev => {
      if (index < prev) return prev - 1;
      if (index === prev) return Math.max(0, prev - 1);
      return prev;
    });
  }, [desktops]);

  return (
    <MissionControlContext.Provider
      value={{ createDesktop, switchDesktop, deleteDesktop, activeIndex, desktops }}
    >
      <div className="mission-control-container">
        {/* Overlay buttons */}
        <div className="mc-overlay">
          <button onClick={createDesktop}>+ New</button>
          <button
            onClick={() => switchDesktop(activeIndex - 1)}
            disabled={activeIndex === 0}
          >
            ‹ Prev
          </button>
          <button
            onClick={() => switchDesktop(activeIndex + 1)}
            disabled={activeIndex === desktops.length - 1}
          >
            Next ›
          </button>
        </div>

        <div
          className="desktops-wrapper"
          style={{
            transform: `translateX(calc(-${activeIndex} * (100vw + 60px)))`
          }}
        >
          {desktops.map(desk => (
            <div className="desktop-panel" key={desk.id}>
              <SystemUI />
            </div>
          ))}
        </div>
      </div>
    </MissionControlContext.Provider>
  );
};

export default MissionControl;
