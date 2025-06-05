// src/components/MissionControl/MissionControl.jsx
import React, { createContext, useState, useCallback } from 'react';
import SystemUI from '../SystemUI/SystemUI.jsx';
import MissionControlUI from './components/MissionControlUI/MissionControlUI.jsx';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_i) => {},
  deleteDesktop: (_i) => {},
  reorderDesktops: (_from, _to) => {},
  renameDesktop: (_i, _name) => {},
  activeIndex: 0,
  desktops: [] // each entry is { id: number, ui: ReactNode, name: string }
});

const MissionControl = () => {
  // each desktop is { id, ui, name }
  const [desktops, setDesktops] = useState(() => {
    const id = Date.now();
    return [{ id, ui: <SystemUI key={id} />, name: 'Desktop 1' }];
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const createDesktop = useCallback(() => {
    setDesktops(d => {
      const newId = Date.now();
      const defaultName = `Desktop ${d.length + 1}`;
      return [...d, { id: newId, ui: <SystemUI key={newId} />, name: defaultName }];
    });
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

  const renameDesktop = useCallback((i, newName) => {
    setDesktops(d =>
      d.map((desk, idx) =>
        idx === i
          ? { ...desk, name: newName }
          : desk
      )
    );
  }, []);

  return (
    <MissionControlContext.Provider
      value={{
        createDesktop,
        switchDesktop,
        deleteDesktop,
        reorderDesktops,
        renameDesktop,
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
