// MissionControl.jsx
import React, {
  createContext,
  useState,
  useCallback,
  useEffect
} from 'react';
import SystemUI from '../SystemUI/SystemUI.jsx';
import Dock from '../../components/Dock/Dock.jsx';
import { useStateManager } from '../../stores/StateManager/StateManager.jsx';
import './MissionControl.css';

export const MissionControlContext = createContext({
  createDesktop: () => {},
  switchDesktop: (_index) => {},
  deleteDesktop: (_index) => {},
  activeIndex: 0,
  desktops: []
});

const MissionControl = () => {
  // desktop state
  const [desktops, setDesktops] = useState([{ id: Date.now() }]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [overviewOpen, setOverviewOpen] = useState(false);

  // track viewport size so we can compute perfect scale
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

  // fixed thumbnail width in px
  const THUMB_W = 240;
  // compute uniform scale factor so width→THUMB_W
  const scale = THUMB_W / viewport.width;
  // scaled height
  const THUMB_H = viewport.height * scale;

  // global overlay toggle
  const { state } = useStateManager();
  const overlayVisible =
    state.groups.missionControl?.overlayVisible === 'true';

  // CRUD & reorder
  const createDesktop = useCallback(() => {
    const newDesk = { id: Date.now() };
    setDesktops((p) => [...p, newDesk]);
    setActiveIndex((p) => p + 1);
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
      setDesktops((p) => p.filter((_, idx) => idx !== i));
      setActiveIndex((p) => {
        if (i < p) return p - 1;
        if (i === p) return Math.max(0, p - 1);
        return p;
      });
    },
    [desktops]
  );
  const reorderDesktops = useCallback((from, to) => {
    setDesktops((p) => {
      const arr = Array.from(p);
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      return arr;
    });
    setActiveIndex(to);
  }, []);

  // disable scroll behind overlay
  useEffect(() => {
    document.body.style.overflow = overviewOpen ? 'hidden' : '';
  }, [overviewOpen]);

  // drag handlers
  const onDragStart = (e, i) => {
    e.dataTransfer.setData('text/plain', i);
  };
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
            <button onClick={() => setOverviewOpen(true)}>
              Mission Control
            </button>
          </div>
        )}

        {/* Mission Control top bar */}
        {overviewOpen && (
          <div className="mc-overview-bar">
            Mission Control
            <button
              className="overview-close-button"
              onClick={() => setOverviewOpen(false)}
            >
              ×
            </button>
          </div>
        )}

        {/* desktops: normal slider or overview */}
        <div
          className="desktops-wrapper"
          style={
            overviewOpen
              ? {}
              : {
                  transform: `translateX(calc(-${activeIndex} * (100vw + 60px)))`
                }
          }
        >
          {desktops.map((desk, i) => {
            const isOV = overviewOpen;
            return (
              <div
                key={desk.id}
                className="desktop-panel"
                draggable={isOV}
                onDragStart={isOV ? (e) => onDragStart(e, i) : undefined}
                onDragOver={isOV ? onDragOver : undefined}
                onDrop={isOV ? (e) => onDrop(e, i) : undefined}
                onClick={
                  isOV
                    ? () => {
                        switchDesktop(i);
                        setOverviewOpen(false);
                      }
                    : undefined
                }
                style={
                  isOV
                    ? { width: THUMB_W, height: THUMB_H }
                    : undefined
                }
              >
                <div
                  className="desktop-scale-wrapper"
                  style={
                    isOV
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
            );
          })}
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
