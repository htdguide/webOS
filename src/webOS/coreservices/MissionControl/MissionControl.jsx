// src/components/MissionControl/MissionControl.jsx
import React, { createContext, useState, useCallback } from 'react';
import MissionControlUI from './MissionControlUI.jsx';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_i) => {},
  deleteDesktop: (_i) => {},
  reorderDesktops: (_from, _to) => {},
  activeIndex: 0,
  desktops: []
});

const MissionControl = () => {
  const [desktops, setDesktops] = useState([{ id: Date.now() }]);
  const [activeIndex, setActiveIndex] = useState(0);

  const createDesktop = useCallback(() => {
    setDesktops(d => [...d, { id: Date.now() }]);
    setActiveIndex(i => i + 1);
  }, []);

  const switchDesktop = useCallback(
    i => {
      if (i >= 0 && i < desktops.length) {
        setActiveIndex(i);
      }
    },
    [desktops]
  );

  const deleteDesktop = useCallback(
    i => {
      if (desktops.length === 1) return;
      setDesktops(d => d.filter((_, idx) => idx !== i));
      setActiveIndex(cur => {
        if (i < cur) return cur - 1;
        if (i === cur) return Math.max(0, cur - 1);
        return cur;
      });
    },
    [desktops]
  );

  const reorderDesktops = useCallback((from, to) => {
    setDesktops(d => {
      const arr = Array.from(d);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setActiveIndex(to);
  }, []);

  return (
    <MissionControlContext.Provider
      value={{
        createDesktop,
        switchDesktop,
        deleteDesktop,
        reorderDesktops,
        activeIndex,
        desktops
      }}
    >
      <MissionControlUI />
    </MissionControlContext.Provider>
  );
};

export default MissionControl;
