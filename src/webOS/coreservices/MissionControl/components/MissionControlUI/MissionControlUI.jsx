// src/components/MissionControl/MissionControlUI.jsx
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
import MissionBar from '../MissionBar/MissionBar.jsx';
import './MissionControlUI.css';

const FADE_DURATION = 300;   // match CSS fade timing (ms)
const SLIDE_DURATION = 300;  // match wrapper transition (ms)

const MissionControlUI = () => {
  const {
    createDesktop,
    switchDesktop,
    deleteDesktop,
    reorderDesktops,
    activeIndex,
    desktops
  } = useContext(MissionControlContext);

  const { state, addState, editStateValue } = useStateManager();
  const overlayVisible =
    state.groups.missionControl?.overlayVisible === 'true';

  // track when each portal can mount (initially all false)
  const [portalReady, setPortalReady] = useState(() =>
    desktops.map(() => false)
  );

  // Refs to keep track of previous values without triggering re-renders
  const prevDesktopsRef = useRef(desktops);
  const prevPortalReadyRef = useRef(portalReady);

  // Whenever `desktops` changes (add/remove/reorder), compute a new portalReady array
  useEffect(() => {
    const prevDesktops = prevDesktopsRef.current;
    const prevReady = prevPortalReadyRef.current;
    const prevLen = prevDesktops.length;
    const currLen = desktops.length;

    let newReady;
    if (currLen > prevLen) {
      // One or more desktops added: keep existing flags, append `false` for each new desktop
      const diffCount = currLen - prevLen;
      newReady = [...prevReady, ...Array(diffCount).fill(false)];
    } else if (currLen < prevLen) {
      // One or more desktops removed: rebuild `newReady` by matching IDs
      const idToReady = {};
      prevDesktops.forEach((d, idx) => {
        idToReady[d.id] = prevReady[idx];
      });
      newReady = desktops.map(d => idToReady[d.id] || false);
    } else {
      // Same length → probably reordered: reorder flags by matching IDs
      const idToReady = {};
      prevDesktops.forEach((d, idx) => {
        idToReady[d.id] = prevReady[idx];
      });
      newReady = desktops.map(d => idToReady[d.id] || false);
    }

    // Update state and refs once
    setPortalReady(newReady);
    prevDesktopsRef.current = desktops;
    prevPortalReadyRef.current = newReady;
  }, [desktops]);

  // After each render, check for any newly mounted portal containers and mark them ready
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

  // 1) Ensure missionControl.opened exists
  useEffect(() => {
    if (!state.groups.missionControl.hasOwnProperty('opened')) {
      addState('missionControl', 'opened', 'false');
    }
  }, [addState, state.groups.missionControl]);

  // 2) On initial mount: if we were left “opened”, reset icon & menubar
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

  // 3) Track window size
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 4) Lock background scroll while fading/open
  useEffect(() => {
    document.body.style.overflow = (overviewOpen || isFading) ? 'hidden' : '';
  }, [overviewOpen, isFading]);

  // 5) After fade finishes, actually enter “overview”
  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(() => {
        setOverviewOpen(true);
        setIsFading(false);
      }, FADE_DURATION);
      return () => clearTimeout(timer);
    }
  }, [isFading]);

  // 7) Open overview
  const openOverview = useCallback(() => {
    setPrevIndex(activeIndex);
    setBarExpanded(false);
    editStateValue('desktop', 'iconVisible', 'false');
    editStateValue('desktop', 'menubarVisible', 'false');
    editStateValue('missionControl', 'opened', 'true');
    setIsFading(true);
  }, [activeIndex, editStateValue]);

  // instant switch desktop
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

  // 8) Exit overview
  const exitOverview = useCallback(
    (restore = true) => {
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

  // drag & drop handlers
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

  // layout calculations for the desktop panels
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const THUMB_W = viewport.width * scale;
  const centerIndex = (desktops.length - 1) / 2;
  const wrapperStyle = overviewOpen
    ? {
        top: 30,
        height: THUMB_H,
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

      {(isFading || overviewOpen) && (
        <WallpaperPlain className="mc-wallpaper" />
      )}

      {/* Always render MissionBar, which now includes the desktops-wrapper */}
      <MissionBar
        desktops={desktops}
        activeIndex={activeIndex}
        instantSwitchDesktop={instantSwitchDesktop}
        exitOverview={exitOverview}
        setBarExpanded={setBarExpanded}
        portalReady={portalReady}
        scaleRefs={scaleRefs}
        wrapperStyle={wrapperStyle}
        overviewOpen={overviewOpen}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        viewport={viewport}
      />
    </div>
  );
};

export default MissionControlUI;
