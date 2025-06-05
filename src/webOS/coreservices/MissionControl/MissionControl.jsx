// src/components/MissionControl/MissionControl.jsx
import React, { createContext, useState, useCallback } from 'react';
import SystemUI from '../SystemUI/SystemUI.jsx';
import MissionControlUI from './components/MissionControlUI/MissionControlUI.jsx';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_i) => {},
  deleteDesktop: (_i) => {},
  reorderDesktops: (_from, _to) => {},
  activeIndex: 0,
  desktops: [] // now each entry is { id: number, ui: ReactNode }
});

const MissionControl = () => {
  // each desktop is { id, ui }
  const [desktops, setDesktops] = useState(() => {
    const id = Date.now();
    return [{ id, ui: <SystemUI key={id} /> }];
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const createDesktop = useCallback(() => {
    const id = Date.now();
    setDesktops(d => [...d, { id, ui: <SystemUI key={id} /> }]);
    setActiveIndex(d => d + 1);
  }, []);

  const switchDesktop = useCallback(
    i => {
      if (i >= 0 && i < desktops.length) {
        setActiveIndex(i);
      }
    },
    [desktops.length]
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
    [desktops.length]
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
      {/* This component only provides context; UI is in MissionControlUI */}
      <MissionControlUI />
    </MissionControlContext.Provider>
  );
};

export default MissionControl;
