// src/components/MissionControl/MissionControl.jsx
import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import SystemUI from '../SystemUI/SystemUI.jsx';
import Dock from '../../components/Dock/Dock.jsx';
import { WallpaperPlain } from '../../components/Wallpaper/Wallpaper.jsx';
import { useStateManager } from '../../stores/StateManager/StateManager.jsx';
import './MissionControl.css';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_i) => {},
  deleteDesktop: (_i) => {},
  activeIndex: 0,
  desktops: []
});

const MissionControl = () => {
  // desktops + active
  const [desktops, setDesktops] = useState([{ id: Date.now() }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // track viewport for correct thumbnail ratio
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // thumbnail sizing: target 90px height to preserve ratio
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;

  // refs for scrolling
  const wrapperRef = useRef(null);
  const panelRefs = useRef([]);

  // when overview opens or activeIndex changes, center that panel
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // global overlay toggle
  const { state } = useStateManager();
  const overlayVisible =
    state.groups.missionControl?.overlayVisible === 'true';

  // actions
  const createDesktop = useCallback(() => {
    setDesktops((d) => [...d, { id: Date.now() }]);
    setActiveIndex((i) => i + 1);
  }, []);
  const switchDesktop = useCallback(
    (i) => {
      if (i >= 0 && i < desktops.length) setActiveIndex(i);
    },
    [desktops]
  );
  const deleteDesktop = useCallback(
    (i) => {
      if (desktops.length === 1) return;
      setDesktops((d) => d.filter((_, idx) => idx !== i));
      setActiveIndex((cur) => {
        if (i < cur) return cur - 1;
        if (i === cur) return Math.max(0, cur - 1);
        return cur;
      });
    },
    [desktops]
  );
  const reorderDesktops = useCallback((from, to) => {
    setDesktops((d) => {
      const arr = Array.from(d);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setActiveIndex(to);
  }, []);

  // open overview: remember previous
  const openOverview = () => {
    setPrevIndex(activeIndex);
    setOverviewOpen(true);
  };
  // exit by clicking empty space
  const exitOverview = () => {
    setOverviewOpen(false);
    setActiveIndex(prevIndex);
  };

  // lock scroll behind
  useEffect(() => {
    document.body.style.overflow = overviewOpen ? 'hidden' : '';
  }, [overviewOpen]);

  // drag/drop
  const onDragStart = (e, i) => e.dataTransfer.setData('text/plain', String(i));
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (e, to) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(from) && from !== to) reorderDesktops(from, to);
  };

  return (
    <MissionControlContext.Provider
      value={{
        createDesktop,
        switchDesktop,
        deleteDesktop,
        activeIndex,
        desktops
      }}
    >
      <div
        className={`mission-control-container ${
          overviewOpen ? 'overview-open' : ''
        }`}
      >
        {/* standard toolbar */}
        {overlayVisible && (
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
            <button
              onClick={() => deleteDesktop(activeIndex)}
              disabled={desktops.length === 1}
            >
              🗑 Delete
            </button>
            <button onClick={openOverview}>Mission Control</button>
          </div>
        )}

        {/* wallpaper behind overview */}
        {overviewOpen && <WallpaperPlain className="mc-wallpaper" />}

        {/* click-anywhere overlay to exit */}
        {overviewOpen && (
          <div className="mc-exit-overlay" onClick={exitOverview} />
        )}

        {/* desktops: slider vs overview */}
        <div
          ref={wrapperRef}
          className="desktops-wrapper"
          style={
            overviewOpen
              ? { top: 30, height: THUMB_H, transform: 'none' }
              : {
                  transform: `translateX(calc(-${activeIndex} * (100vw + 60px)))`
                }
          }
        >
          {desktops.map((desk, i) => (
            <div
              ref={el => (panelRefs.current[i] = el)}
              key={desk.id}
              className="desktop-panel"
              draggable={overviewOpen}
              onDragStart={overviewOpen ? (e) => onDragStart(e, i) : undefined}
              onDragOver={overviewOpen ? onDragOver : undefined}
              onDrop={overviewOpen ? (e) => onDrop(e, i) : undefined}
              onClick={
                overviewOpen
                  ? () => {
                      switchDesktop(i);
                      setOverviewOpen(false);
                    }
                  : undefined
              }
              style={
                overviewOpen
                  ? { width: THUMB_W, height: THUMB_H }
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
                <SystemUI />
              </div>
            </div>
          ))}
        </div>

        {/* fixed Dock */}
        <div className="mc-dock">
          <Dock />
        </div>
      </div>
    </MissionControlContext.Provider>
  );
};

export default MissionControl;
