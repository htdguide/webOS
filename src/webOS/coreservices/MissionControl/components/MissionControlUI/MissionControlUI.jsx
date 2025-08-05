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

const FADE_DURATION = 200;               // CSS fade timing (ms)
const SLIDE_DURATION = 200;              // overview slide timing (ms)
const OPEN_DELAY = 100;                  // delay before fade (ms)
// must match your CSS --desktop-slide-duration: 0.55s
const DESKTOP_SLIDE_DURATION = 450;      // ms

// Hint / touch config
const EDGE_THRESHOLD = 20;        // px from either edge to trigger
const HOVER_DELAY = 200;          // ms to hold before hint / touch‐hold
const TOUCH_HINT_OFFSET = 30;     // px touch‐hold peek
const MOUSE_HINT_OFFSET = 10;     // px hover peek
const HINT_SLIDE_DURATION = 200;  // ms for hover‐hint ease
const DRAG_INITIAL_DURATION = 150;// ms for that very first peek‐ease
const DESKTOP_SPACING = 60;       // px extra between desktops

const MissionControlUI = () => {
  // —— Context & stores ——
  const {
    createDesktop,
    addDesktop,
    switchDesktop: rawSwitchDesktop,
    deleteDesktop: contextDeleteDesktop,
    reorderDesktops,
    activeIndex,
    desktops
  } = useContext(MissionControlContext);
  const { state, editStateValue } = useStateManager();

  const overlayVisible = state.groups.missionControl?.overlayVisible === 'true';
  const stateOpened   = state.groups.missionControl?.isOpened     === 'true';

  // —— Initialize currentDesktopID on mount ——
  useEffect(() => {
    const desktop = desktops[activeIndex];
    if (desktop?.id != null) {
      editStateValue(
        'missionControl',
        'currentDesktopID',
        String(desktop.id)
      );
    }
    // only on mount:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // —— Wrap switchDesktop so it also writes currentDesktopID ——
  const switchDesktop = useCallback((i) => {
    rawSwitchDesktop(i);
    const desktop = desktops[i];
    if (desktop?.id != null) {
      editStateValue(
        'missionControl',
        'currentDesktopID',
        String(desktop.id)
      );
    }
  }, [rawSwitchDesktop, desktops, editStateValue]);

  // —— Keep activeIndex valid after delete ——
  const handleDeleteDesktop = useCallback((index) => {
    contextDeleteDesktop(index);
    let newIndex = activeIndex;
    if (index === activeIndex) {
      newIndex = index > 0 ? index - 1 : 0;
    } else if (index < activeIndex) {
      newIndex = activeIndex - 1;
    }
    switchDesktop(newIndex);
  }, [contextDeleteDesktop, switchDesktop, activeIndex]);

  // —— Wallpaper / portal readiness ——
  const [showWallpaperPlaceholder, setShowWallpaperPlaceholder] = useState(false);
  const [portalReady, setPortalReady] = useState(() => desktops.map(() => false));
  const prevDesktopsRef = useRef(desktops);
  const prevPortalReadyRef = useRef(portalReady);
  const scaleRefs = useRef([]);

  // —— Hover hints ——
  const [showRightHint, setShowRightHint] = useState(false);
  const [showLeftHint, setShowLeftHint] = useState(false);
  const hintTimerRef = useRef(null);
  const hoverSideRef = useRef(null);

  // —— Touch‐drag state ——
  const [touching, setTouching] = useState(false);
  const [touchDelta, setTouchDelta] = useState(0);
  const touchStartRef = useRef({ timer: null, active: false, x0: 0, initialOffset: 0 });
  const initialDragRef = useRef(false);

  // —— One‐time initial‐drag easing ——
  const [dragTransition, setDragTransition] = useState(false);

  // —— Release animations ——
  const [releaseInProgress, setReleaseInProgress] = useState(false);
  const [releaseDirection, setReleaseDirection] = useState(null);
  const [targetIndex, setTargetIndex] = useState(null);

  // —— Viewport & transition disabling ——
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [disableSlideTransition, setDisableSlideTransition] = useState(false);

  // —— Overview / fade state ——
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [barExpanded, setBarExpanded] = useState(false);
  const [prevIndex, setPrevIndex] = useState(0);

  // instant switch (no transition)
  const instantSwitchDesktop = useCallback(i => {
    setDisableSlideTransition(true);
    switchDesktop(i);
  }, [switchDesktop]);

  // —— Sync portalReady on desktop changes ——
  useEffect(() => {
    const prev      = prevDesktopsRef.current;
    const prevReady = prevPortalReadyRef.current;
    const delta     = desktops.length - prev.length;
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

  // —— Mark portals ready on first mount ——
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

  // —— Track viewport resize & orientation change ——
  useEffect(() => {
    const handleResize = () => {
      setDisableSlideTransition(true);
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // —— Reset transition disabling after one render ——
  useEffect(() => {
    if (!disableSlideTransition) return;
    const t = setTimeout(() => setDisableSlideTransition(false), 0);
    return () => clearTimeout(t);
  }, [disableSlideTransition]);

  // —— Mouse hover hints ——
  useEffect(() => {
    if (overviewOpen) return;
    const canRight = desktops.length > activeIndex + 1;
    const canLeft  = activeIndex > 0;

    const onMouseMove = e => {
      const x = e.clientX;
      const atRight = canRight && x >= viewport.width - EDGE_THRESHOLD;
      const atLeft  = canLeft  && x <= EDGE_THRESHOLD;

      if (atRight && hoverSideRef.current !== 'right') {
        clearTimeout(hintTimerRef.current);
        setShowLeftHint(false);
        setShowRightHint(false);
        hoverSideRef.current = 'right';
        hintTimerRef.current = setTimeout(() => setShowRightHint(true), HOVER_DELAY);
      } else if (atLeft && hoverSideRef.current !== 'left') {
        clearTimeout(hintTimerRef.current);
        setShowRightHint(false);
        setShowLeftHint(false);
        hoverSideRef.current = 'left';
        hintTimerRef.current = setTimeout(() => setShowLeftHint(true), HOVER_DELAY);
      } else if (!atRight && !atLeft && hoverSideRef.current) {
        clearTimeout(hintTimerRef.current);
        hoverSideRef.current = null;
        setShowRightHint(false);
        setShowLeftHint(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      clearTimeout(hintTimerRef.current);
      hoverSideRef.current = null;
    };
  }, [overviewOpen, viewport.width, activeIndex, desktops.length]);

  // —— Click to confirm hover hint ——
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
  }, [showRightHint, showLeftHint, viewport.width, activeIndex, switchDesktop]);

  // —— Touch‐hold + draggable swipe ——
  useEffect(() => {
    if (overviewOpen) return;
    const canRight = desktops.length > activeIndex + 1;
    const canLeft  = activeIndex > 0;

    const onTouchStart = e => {
      if (touchStartRef.current.active) return;
      if (e.touches.length !== 1) return;
      const x = e.touches[0].clientX;
      const atRight = canRight && x >= viewport.width - EDGE_THRESHOLD;
      const atLeft  = canLeft  && x <= EDGE_THRESHOLD;
      if (!atRight && !atLeft) return;

      hoverSideRef.current = atRight ? 'right' : 'left';
      touchStartRef.current.timer = setTimeout(() => {
        touchStartRef.current.active = true;
        touchStartRef.current.x0 = x;
        touchStartRef.current.initialOffset =
          hoverSideRef.current === 'right'
            ? -TOUCH_HINT_OFFSET
            : TOUCH_HINT_OFFSET;

        setTouching(true);
        setTouchDelta(touchStartRef.current.initialOffset);

        setDragTransition(true);
        initialDragRef.current = true;
      }, HOVER_DELAY);
    };

    const onTouchMove = e => {
      if (touchStartRef.current.active) {
        e.preventDefault();
        if (initialDragRef.current) {
          setDragTransition(false);
          initialDragRef.current = false;
        }

        const x = e.touches[0].clientX;
        const dx = x - touchStartRef.current.x0;
        const limitedDx =
          hoverSideRef.current === 'right'
            ? Math.min(0, dx)
            : Math.max(0, dx);
        let newDelta = touchStartRef.current.initialOffset + limitedDx;

        const slideAmount = viewport.width + DESKTOP_SPACING;
        if (hoverSideRef.current === 'right') {
          newDelta = Math.max(newDelta, -slideAmount);
        } else {
          newDelta = Math.min(newDelta, slideAmount);
        }

        setTouchDelta(newDelta);
      } else if (touchStartRef.current.timer) {
        const x = e.touches[0].clientX;
        const side = hoverSideRef.current;
        const movedOff =
          (side === 'right' && x < viewport.width - EDGE_THRESHOLD) ||
          (side === 'left'  && x > EDGE_THRESHOLD);
        if (movedOff) {
          clearTimeout(touchStartRef.current.timer);
          touchStartRef.current.timer = null;
          hoverSideRef.current = null;
        }
      }
    };

    const onTouchEnd = () => {
      if (touchStartRef.current.timer) {
        clearTimeout(touchStartRef.current.timer);
        touchStartRef.current.timer = null;
      }
      if (touchStartRef.current.active) {
        const finalDx   = touchDelta;
        const threshold = viewport.width / 6;
        const willSwitch =
          (hoverSideRef.current === 'right' && finalDx < -threshold) ||
          (hoverSideRef.current === 'left'  && finalDx > threshold);

        if (willSwitch) {
          const nextIdx = activeIndex + (finalDx < 0 ? 1 : -1);
          setReleaseDirection('forward');
          setTargetIndex(nextIdx);
          setReleaseInProgress(true);
          setTouching(false);

          setTimeout(() => {
            switchDesktop(nextIdx);
            setReleaseInProgress(false);
            setReleaseDirection(null);
            setTargetIndex(null);
          }, SLIDE_DURATION);
        } else {
          setReleaseDirection('backward');
          setReleaseInProgress(true);
          setTouching(false);

          setTimeout(() => {
            setReleaseInProgress(false);
            setReleaseDirection(null);
          }, SLIDE_DURATION);
        }
      }

      touchStartRef.current.active = false;
      hoverSideRef.current = null;
      initialDragRef.current = false;
      setDragTransition(false);
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    window.addEventListener('touchend',   onTouchEnd);
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
      window.removeEventListener('touchend',   onTouchEnd);
      if (touchStartRef.current.timer) clearTimeout(touchStartRef.current.timer);
    };
  }, [overviewOpen, viewport.width, activeIndex, desktops.length, touchDelta, switchDesktop]);

  // —— Prevent scroll during overview/fade ——
  useEffect(() => {
    document.body.style.overflow = overviewOpen || isFading ? 'hidden' : '';
  }, [overviewOpen, isFading]);

  // —— Fade into overview ——
  useEffect(() => {
    if (!isFading) return;
    const t = setTimeout(() => {
      setOverviewOpen(true);
      setIsFading(false);
    }, FADE_DURATION);
    return () => clearTimeout(t);
  }, [isFading]);

  // —— Handlers to open/exit overview ——
  const openOverview = useCallback(() => {
    setPrevIndex(activeIndex);
    setBarExpanded(false);
    setShowWallpaperPlaceholder(true);
    const t = setTimeout(() => {
      editStateValue('desktop','iconVisible','false');
      editStateValue('desktop','menubarVisible','false');
      setIsFading(true);
    }, OPEN_DELAY);
    return () => clearTimeout(t);
  }, [activeIndex, editStateValue]);

  const exitOverview = useCallback((restore = true) => {
    setOverviewOpen(false);
    setIsFading(false);
    setBarExpanded(false);
    editStateValue('desktop','iconVisible','true');
    editStateValue('desktop','menubarVisible','true');
    editStateValue('missionControl','isOpened','false');

    if (restore) {
      setDisableSlideTransition(false);
      switchDesktop(prevIndex);
      setTimeout(() => {
        setShowWallpaperPlaceholder(false);
      }, DESKTOP_SLIDE_DURATION);
    } else {
      setShowWallpaperPlaceholder(false);
    }
  }, [prevIndex, editStateValue, switchDesktop]);

  // —— Click handler for the UI button ——
  const handleOpenClick = useCallback(() => {
    editStateValue('missionControl','isOpened','true');
    openOverview();
  }, [editStateValue, openOverview]);

  // —— External open trigger ——
  useEffect(() => {
    if (stateOpened && !overviewOpen) openOverview();
  }, [stateOpened, overviewOpen, openOverview]);

  // —— External close trigger during fade or full open ——  
  useEffect(() => {
    if (!stateOpened && (overviewOpen || isFading || showWallpaperPlaceholder)) {
      exitOverview();
    }
  }, [stateOpened, overviewOpen, isFading, showWallpaperPlaceholder, exitOverview]);

  // —— Drag‐drop reorder etc. ——
  const onDragStart = useCallback((e, i) => {
    e.dataTransfer.setData('text/plain', String(i));
  }, []);
  const onDragOver  = useCallback(e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);
  const onDrop      = useCallback((e, to) => {
    e.preventDefault();
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(from) && from !== to) reorderDesktops(from, to);
  }, [reorderDesktops]);

  // —— Compute wrapper transform & style ——
  const baseExpr = `-${activeIndex}*(100vw + ${DESKTOP_SPACING}px)`;
  const wrapperTransform = touching
    ? `translateX(calc(${baseExpr} + ${touchDelta}px))`
    : showRightHint
      ? `translateX(calc(${baseExpr} - ${MOUSE_HINT_OFFSET}px))`
      : showLeftHint
        ? `translateX(calc(${baseExpr} + ${MOUSE_HINT_OFFSET}px))`
        : `translateX(calc(${baseExpr}))`;

  let wrapperStyle;
  if (overviewOpen) {
    wrapperStyle = {
      top: 30,
      height: 90,
      marginLeft: 0,
      transform: 'none',
      transition: `top ${SLIDE_DURATION}ms ease, height ${SLIDE_DURATION}ms ease, transform ${SLIDE_DURATION}ms ease`
    };
  } else if (releaseInProgress) {
    wrapperStyle = {
      transform: releaseDirection === 'forward'
        ? `translateX(calc(-${targetIndex}*(100vw + ${DESKTOP_SPACING}px)))`
        : `translateX(calc(-${activeIndex}*(100vw + ${DESKTOP_SPACING}px)))`,
      transition: `transform ${SLIDE_DURATION}ms ease`
    };
  } else if (touching) {
    wrapperStyle = {
      transform: wrapperTransform,
      transition: dragTransition
        ? `transform ${DRAG_INITIAL_DURATION}ms ease`
        : 'none'
    };
  } else {
    wrapperStyle = {
      transform: wrapperTransform,
      ...(disableSlideTransition
        ? { transition: 'none' }
        : (showRightHint || showLeftHint)
          ? { transition: `transform ${HINT_SLIDE_DURATION}ms ease` }
          : {})
    };
  }

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
        <div className="mc-overlay">
          <button onClick={createDesktop}>+ New</button>
          <button
            onClick={() => switchDesktop(activeIndex - 1)}
            disabled={activeIndex === 0}
          >‹ Prev</button>
          <button
            onClick={() => switchDesktop(activeIndex + 1)}
            disabled={desktops.length === 1}
          >Next ›</button>
          <button
            onClick={() => handleDeleteDesktop(activeIndex)}
            disabled={desktops.length === 1}
          >🗑 Delete</button>
          <button onClick={handleOpenClick}>Mission Control</button>
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
        deleteDesktop={handleDeleteDesktop}
        stateOpened={stateOpened}
      />
    </div>
  );
};

export default MissionControlUI;
