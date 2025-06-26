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

const FADE_DURATION = 300;   // CSS fade timing (ms)
const SLIDE_DURATION = 300;  // overview slide timing (ms)
const OPEN_DELAY = 200;      // delay before fade (ms)

// Hint configuration
const EDGE_THRESHOLD = 20;        // px from either edge to trigger hint
const HOVER_DELAY = 300;         // ms to wait before showing hint (1 s)
const HINT_OFFSET = 10;           // px to slide as a hint
const HINT_SLIDE_DURATION = 200;  // ms for hint animation

const MissionControlUI = () => {
  const {
    createDesktop,  // original: adds & switches
    addDesktop,     // new: adds only
    switchDesktop,
    deleteDesktop,
    reorderDesktops,
    activeIndex,
    desktops
  } = useContext(MissionControlContext);

  const { state, addState, editStateValue } = useStateManager();
  const overlayVisible =
    state.groups.missionControl?.overlayVisible === 'true';

  // Basic UI state
  const [showWallpaperPlaceholder, setShowWallpaperPlaceholder] = useState(false);
  const [portalReady, setPortalReady] = useState(() =>
    desktops.map(() => false)
  );

  // Hint state
  const [showRightHint, setShowRightHint] = useState(false);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const hintTimerRef = useRef(null);
  const hoverSideRef = useRef(null);       // 'left' | 'right' | null
  const isMouseDownRef = useRef(false);    // track if a button is held

  // Window size for edge detection
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Mission‐Control state
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [disableSlideTransition, setDisableSlideTransition] = useState(false);
  const [barExpanded, setBarExpanded] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);

  // Refs for tracking portal readiness
  const prevDesktopsRef = useRef(desktops);
  const prevPortalReadyRef = useRef(portalReady);
  const scaleRefs = useRef([]);

  // Sync portalReady when desktops array changes
  useEffect(() => {
    const prev = prevDesktopsRef.current;
    const prevReady = prevPortalReadyRef.current;
    const delta = desktops.length - prev.length;
    let nextReady;
    if (delta > 0) {
      nextReady = [...prevReady, ...Array(delta).fill(false)];
    } else {
      const byId = Object.fromEntries(prev.map((d,i) => [d.id, prevReady[i]]));
      nextReady = desktops.map(d => !!byId[d.id]);
    }
    setPortalReady(nextReady);
    prevDesktopsRef.current = desktops;
    prevPortalReadyRef.current = nextReady;
  }, [desktops]);

  // Mark portals ready as soon as their DOM node mounts
  useLayoutEffect(() => {
    let changed = false;
    const arr = prevPortalReadyRef.current.slice();
    desktops.forEach((_, i) => {
      if (!arr[i] && scaleRefs.current[i]) {
        arr[i] = true;
        changed = true;
      }
    });
    if (changed) {
      setPortalReady(arr);
      prevPortalReadyRef.current = arr;
    }
  });

  // Initialize 'opened' flag
  useEffect(() => {
    if (!state.groups.missionControl.hasOwnProperty('opened')) {
      addState('missionControl', 'opened', 'false');
    }
  }, [addState, state.groups.missionControl]);

  // Clear lingering 'opened' on first mount
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

  // Track viewport size
  useEffect(() => {
    const onResize = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // —— Edge‐hover hint (both sides), ignores when mouse is down —— 
  useEffect(() => {
    if (overviewOpen) return;

    const canRight = desktops.length > activeIndex + 1;
    const canLeft = activeIndex > 0;

    const onMouseDown = () => { isMouseDownRef.current = true; };
    const onMouseUp = () => { isMouseDownRef.current = false; };

    const onMouseMove = e => {
      if (isMouseDownRef.current) return; // ignore while dragging/clicking

      const x = e.clientX;
      const atRight = canRight && x >= viewport.width - EDGE_THRESHOLD;
      const atLeft = canLeft && x <= EDGE_THRESHOLD;

      if (atRight && hoverSideRef.current !== 'right') {
        clearTimeout(hintTimerRef.current);
        setShowLeftHint(false);
        setShowRightHint(false);
        hoverSideRef.current = 'right';
        hintTimerRef.current = setTimeout(() => {
          setShowRightHint(true);
        }, HOVER_DELAY);
      } else if (atLeft && hoverSideRef.current !== 'left') {
        clearTimeout(hintTimerRef.current);
        setShowRightHint(false);
        setShowLeftHint(false);
        hoverSideRef.current = 'left';
        hintTimerRef.current = setTimeout(() => {
          setShowLeftHint(true);
        }, HOVER_DELAY);
      } else if (!atRight && !atLeft && hoverSideRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
        hoverSideRef.current = null;
        setShowRightHint(false);
        setShowLeftHint(false);
      }
    };

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
      hoverSideRef.current = null;
      isMouseDownRef.current = false;
    };
  }, [
    overviewOpen,
    viewport.width,
    activeIndex,
    desktops.length
  ]);

  // —— Click to complete switch when hint is visible —— 
  useEffect(() => {
    if (!showRightHint && !showLeftHint) return;

    const onClick = e => {
      const x = e.clientX;
      if (showRightHint && x >= viewport.width - EDGE_THRESHOLD) {
        switchDesktop(activeIndex + 1);
        setShowRightHint(false);
      } else if (showLeftHint && x <= EDGE_THRESHOLD) {
        switchDesktop(activeIndex - 1);
        setShowLeftHint(false);
      }
    };

    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [
    showRightHint,
    showLeftHint,
    viewport.width,
    activeIndex,
    switchDesktop
  ]);

  // Prevent body scroll during overview/fade
  useEffect(() => {
    document.body.style.overflow = overviewOpen || isFading ? 'hidden' : '';
  }, [overviewOpen, isFading]);

  // Fade → open overview
  useEffect(() => {
    if (!isFading) return;
    const t = setTimeout(() => {
      setOverviewOpen(true);
      setIsFading(false);
    }, FADE_DURATION);
    return () => clearTimeout(t);
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
    i => {
      setDisableSlideTransition(true);
      switchDesktop(i);
    },
    [switchDesktop]
  );
  useEffect(() => {
    if (!disableSlideTransition) return;
    const t = setTimeout(() => setDisableSlideTransition(false), 0);
    return () => clearTimeout(t);
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

  // Compute transform & transition
  const baseX = `calc(-${activeIndex} * (100vw + 60px))`;
  const rightHintX = `calc(${baseX} - ${HINT_OFFSET}px)`;
  const leftHintX  = `calc(${baseX} + ${HINT_OFFSET}px)`;
  const wrapperTransform = showRightHint
    ? `translateX(${rightHintX})`
    : showLeftHint
    ? `translateX(${leftHintX})`
    : `translateX(${baseX})`;
  const wrapperStyle = overviewOpen
    ? {
        top: 30,
        height: 90,
        marginLeft: 0,
        transform: 'none',
        transition: `top ${SLIDE_DURATION}ms ease, height ${SLIDE_DURATION}ms ease, transform ${SLIDE_DURATION}ms ease`
      }
    : {
        transform: wrapperTransform,
        ...(disableSlideTransition
          ? { transition: 'none' }
          : (showRightHint || showLeftHint)
          ? { transition: `transform ${HINT_SLIDE_DURATION}ms ease` }
          : {})
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
        createDesktop={addDesktop}
        deleteDesktop={deleteDesktop}
      />
    </div>
  );
};

export default MissionControlUI;
