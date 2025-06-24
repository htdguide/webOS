// src/components/MissionControl/components/MissionControlUI/MissionControlUI.jsx

import React, {
  useContext,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react';
import { MissionControlContext } from '../../MissionControl.jsx';
import Dock from '../../../../components/Dock/Dock.jsx';
import { WallpaperPlain } from '../../../../components/Wallpaper/Wallpaper.jsx';
import { useStateManager } from '../../../../stores/StateManager/StateManager.jsx';
import './MissionControlUI.css';
import MissionManager from '../MissionManager/MissionManager.jsx';

const FADE_DURATION = 300;   // match CSS fade timing (ms)
const SLIDE_DURATION = 300;  // match wrapper transition (ms)
const OPEN_DELAY = 200;      // new delay before fade (ms)

const MissionControlUI = () => {
  const {
    createDesktop,       // original: adds & switches
    addDesktop,          // new: adds only
    switchDesktop,
    deleteDesktop,       // newly passed through
    reorderDesktops,
    activeIndex,
    desktops
  } = useContext(MissionControlContext);

  const { state, addState, editStateValue } = useStateManager();
  const overlayVisible =
    state.groups.missionControl?.overlayVisible === 'true';

  // New flag: render wallpaper at opacity 0 immediately when opening
  const [showWallpaperPlaceholder, setShowWallpaperPlaceholder] = useState(false);
  // track when each portal can mount (initially all false)
  const [portalReady, setPortalReady] = useState(() =>
    desktops.map(() => false)
  );

  const prevDesktopsRef = useRef(desktops);
  const prevPortalReadyRef = useRef(portalReady);

  useEffect(() => {
    const prevDesktops = prevDesktopsRef.current;
    const prevReady = prevPortalReadyRef.current;
    const prevLen = prevDesktops.length;
    const currLen = desktops.length;
    let newReady;
    if (currLen > prevLen) {
      const diffCount = currLen - prevLen;
      newReady = [...prevReady, ...Array(diffCount).fill(false)];
    } else {
      const idToReady = {};
      prevDesktops.forEach((d, idx) => {
        idToReady[d.id] = prevReady[idx];
      });
      newReady = desktops.map(d => idToReady[d.id] || false);
    }
    setPortalReady(newReady);
    prevDesktopsRef.current = desktops;
    prevPortalReadyRef.current = newReady;
  }, [desktops]);

  const scaleRefs = useRef([]);
  useLayoutEffect(() => {
    let changed = false;
    const latestReady = prevPortalReadyRef.current.slice();
    desktops.forEach((_, i) => {
      if (!latestReady[i] && scaleRefs.current[i]) {
        latestReady[i] = true;
        changed = true;
      }
    });
    if (changed) {
      setPortalReady(latestReady);
      prevPortalReadyRef.current = latestReady;
    }
  });

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [barExpanded, setBarExpanded] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [disableSlideTransition, setDisableSlideTransition] = useState(false);

  useEffect(() => {
    if (!state.groups.missionControl.hasOwnProperty('opened')) {
      addState('missionControl', 'opened', 'false');
    }
  }, [addState, state.groups.missionControl]);

  const initialMount = useRef(true);
  useEffect(() => {
    if (!initialMount.current) return;
    initialMount.current = false;
    if (state.groups.missionControl.opened === 'true') {
      editStateValue('desktop', 'iconVisible', 'true');
      editStateValue('desktop', 'menubarVisible', 'true');
      editStateValue('missionControl', 'opened', 'false');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (overviewOpen || isFading) ? 'hidden' : '';
  }, [overviewOpen, isFading]);

  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => {
        setOverviewOpen(true);
        setIsFading(false);
      }, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isFading]);

  const openOverview = useCallback(() => {
    setPrevIndex(activeIndex);
    setBarExpanded(false);
    setShowWallpaperPlaceholder(true);
    const t = setTimeout(() => {
      editStateValue('desktop', 'iconVisible', 'false');
      editStateValue('desktop', 'menubarVisible', 'false');
      editStateValue('missionControl', 'opened', 'true');
      setIsFading(true);
    }, OPEN_DELAY);
    return () => clearTimeout(t);
  }, [activeIndex, editStateValue]);

  const instantSwitchDesktop = useCallback(
    index => {
      setDisableSlideTransition(true);
      switchDesktop(index);
    },
    [switchDesktop]
  );
  useEffect(() => {
    if (disableSlideTransition) {
      const t = setTimeout(() => setDisableSlideTransition(false), 0);
      return () => clearTimeout(t);
    }
  }, [disableSlideTransition]);

  const exitOverview = useCallback(
    (restore = true) => {
      setShowWallpaperPlaceholder(false);
      setOverviewOpen(false);
      setIsFading(false);
      setBarExpanded(false);
      if (state.groups.missionControl.opened === 'true') {
        editStateValue('desktop', 'iconVisible', 'true');
        editStateValue('desktop', 'menubarVisible', 'true');
        editStateValue('missionControl', 'opened', 'false');
      }
      if (restore) instantSwitchDesktop(prevIndex);
    },
    [
      prevIndex,
      editStateValue,
      state.groups.missionControl.opened,
      instantSwitchDesktop
    ]
  );

  const onDragStart = useCallback((e, i) => {
    e.dataTransfer.setData('text/plain', String(i));
  }, []);
  const onDragOver = useCallback(e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop = useCallback(
    (e, to) => {
      e.preventDefault();
      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
      if (!isNaN(from) && from !== to) reorderDesktops(from, to);
    },
    [reorderDesktops]
  );

  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const wrapperStyle = overviewOpen
    ? {
        top: 30,
        height: THUMB_H,
        marginleft: 0,
        transform: 'none',
        transition: `top ${SLIDE_DURATION}ms ease, height ${SLIDE_DURATION}ms ease, transform ${SLIDE_DURATION}ms ease`
      }
    : {
        transform: `translateX(calc(-${activeIndex} * (100vw + 60px)))`,
        transition: disableSlideTransition ? 'none' : undefined
      };

  return (
    <div
      className={
        `mission-control-container` +
        (isFading ? ' fade-in' : '') +
        (overviewOpen ? ' overview-open' : '') +
        (barExpanded ? ' bar-expanded' : '')
      }
    >
      <Dock />

      {overlayVisible && (
        <div className="mc-overlay" style={{ display: 'flex', gap: 8 }}>
          <button onClick={createDesktop}>+ New</button>
          <button
            onClick={() => switchDesktop(activeIndex - 1)}
            disabled={activeIndex === 0}
          >
            ‹ Prev
          </button>
          <button
            onClick={() => switchDesktop(activeIndex + 1)}
            disabled={desktops.length === 1}
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

      {(showWallpaperPlaceholder || isFading || overviewOpen) && (
        <WallpaperPlain className="mc-wallpaper" />
      )}

      <MissionManager
        desktops={desktops}
        activeIndex={activeIndex}
        instantSwitchDesktop={instantSwitchDesktop}
        exitOverview={exitOverview}
        setBarExpanded={setBarExpanded}
        wrapperStyle={wrapperStyle}
        overviewOpen={overviewOpen}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        viewport={viewport}
        createDesktop={addDesktop}    // +New from bar
        deleteDesktop={deleteDesktop}  // allow deletion per-panel
      />
    </div>
  );
};

export default MissionControlUI;
