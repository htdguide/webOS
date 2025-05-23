import React, {
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef
  } from 'react';
  import { MissionControlContext } from './MissionControl.jsx';
  import SystemUI from '../SystemUI/SystemUI.jsx';
  import Dock from '../../components/Dock/Dock.jsx';
  import { WallpaperPlain } from '../../components/Wallpaper/Wallpaper.jsx';
  import { useStateManager } from '../../stores/StateManager/StateManager.jsx';
  import './MissionControl.css';
  
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
  
    const [overviewOpen, setOverviewOpen] = useState(false);
    const [barExpanded, setBarExpanded] = useState(false);
    const [prevIndex, setPrevIndex] = useState(0);
    const [viewport, setViewport] = useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  
    // Ensure tracking state exists
    useEffect(() => {
      if (!state.groups.missionControl.hasOwnProperty('opened')) {
        addState('missionControl', 'opened', 'false');
      }
    }, [addState, state.groups.missionControl]);
  
    // On mount or reload: if missionControl.opened is true but overview not active, revert UI
    useEffect(() => {
      if (
        state.groups.missionControl.opened === 'true' &&
        !overviewOpen
      ) {
        // Restore desktop elements
        editStateValue('desktop', 'iconVisible', 'true');
        editStateValue('desktop', 'menubarVisible', 'true');
        // Clear the opened flag
        editStateValue('missionControl', 'opened', 'false');
      }
      // Only run this when overviewOpen or opened flag changes
    }, [overviewOpen, state.groups.missionControl.opened, editStateValue]);
  
    const [animateTransitions, setAnimateTransitions] = useState(true);
  
    // handle window resize
    useEffect(() => {
      const onResize = () =>
        setViewport({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);
  
    // lock background scroll when in overview
    useEffect(() => {
      document.body.style.overflow = overviewOpen ? 'hidden' : '';
    }, [overviewOpen]);
  
    const THUMB_H = 90;
    const scale = THUMB_H / viewport.height;
    const THUMB_W = viewport.width * scale;
    const centerIndex = (desktops.length - 1) / 2;
  
    const wrapperRef = useRef(null);
    const panelRefs = useRef([]);
  
    // scroll active thumbnail into view on open
    useEffect(() => {
      if (overviewOpen && panelRefs.current[activeIndex]) {
        panelRefs.current[activeIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, [overviewOpen, activeIndex]);
  
    // Open overview: hide certain UI elements and track
    const openOverview = useCallback(() => {
      setPrevIndex(activeIndex);
      setBarExpanded(false);
  
      // Hide welcome wrap and desktop UI
      editStateValue('welcomeWrap', 'welcomeEnabled', 'false');
      editStateValue('desktop', 'iconVisible', 'false');
      editStateValue('desktop', 'menubarVisible', 'false');
  
      // Mark mission control as opened
      editStateValue('missionControl', 'opened', 'true');
  
      setOverviewOpen(true);
    }, [activeIndex, editStateValue]);
  
    // Exit overview: restore desktop UI and clear tracking
    const exitOverview = useCallback(
      (restore = true) => {
        setOverviewOpen(false);
        setBarExpanded(false);
  
        if (state.groups.missionControl.opened === 'true') {
          editStateValue('desktop', 'iconVisible', 'true');
          editStateValue('desktop', 'menubarVisible', 'true');
          editStateValue('missionControl', 'opened', 'false');
        }
  
        if (restore) setActiveIndex(prevIndex);
      },
      [prevIndex, editStateValue, state.groups.missionControl]
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
  
    const wrapperStyle = overviewOpen
      ? { top: 30, height: THUMB_H, transform: 'none', transition: 'none' }
      : {
          transform: `translateX(calc(-${activeIndex} * (100vw + 60px)))`,
          ...(animateTransitions ? {} : { transition: 'none' })
        };
  
    return (
      <div
        className={
          `mission-control-container` +
          (overviewOpen ? ' overview-open' : '') +
          (barExpanded ? ' bar-expanded' : '')
        }
      >
        {overlayVisible && (
          <div className="mc-overlay" style={{ display: 'flex', gap: 8 }}>
            <button onClick={createDesktop}>+ New</button>
            <button onClick={() => switchDesktop(activeIndex - 1)} disabled={activeIndex === 0}>
              ‹ Prev
            </button>
            <button
              onClick={() => switchDesktop(activeIndex + 1)}
              disabled={activeIndex === desktops.length - 1}
            >
              Next ›
            </button>
            <button onClick={() => deleteDesktop(activeIndex)} disabled={desktops.length === 1}>
              🗑 Delete
            </button>
            <button onClick={openOverview}>Mission Control</button>
            <button onClick={() => setAnimateTransitions(prev => !prev)}>
              <input
                type="checkbox"
                checked={animateTransitions}
                readOnly
                style={{ marginRight: 4, pointerEvents: 'none' }}
              />
              Animate transitions
            </button>
          </div>
        )}
  
        {overviewOpen && <WallpaperPlain className="mc-wallpaper" />}  
        {overviewOpen && (
          <div className="mc-bar" onMouseEnter={() => setBarExpanded(true)}>
            <div className="mc-bar-names">
              {desktops.map((_, i) => (
                <span
                  key={i}
                  className={i === activeIndex ? 'mc-bar-name active' : 'mc-bar-name'}
                  onClick={() => {
                    switchDesktop(i);
                    exitOverview(false);
                  }}
                >
                  Desktop {i + 1}
                </span>
              ))}
            </div>
          </div>
        )}
  
        {overviewOpen && <div className="mc-exit-overlay" onClick={() => exitOverview(true)} />}  
        <div ref={wrapperRef} className="desktops-wrapper" style={wrapperStyle}>
          {desktops.map((desk, i) => (
            <div
              ref={el => (panelRefs.current[i] = el)}
              key={desk.id}
              className="desktop-panel"
              draggable={overviewOpen}
              onDragStart={overviewOpen ? e => onDragStart(e, i) : undefined}
              onDragOver={overviewOpen ? onDragOver : undefined}
              onDrop={overviewOpen ? e => onDrop(e, i) : undefined}
              onClick={overviewOpen ? () => { switchDesktop(i); exitOverview(false); } : undefined}
              style={
                overviewOpen
                  ? { width: `${THUMB_W}px`, height: `${THUMB_H}px`, '--tx': `${-(i - centerIndex) * (THUMB_W + 30)}px`, '--ty': `-120px` }
                  : undefined
              }
            >
              <div
                className="desktop-scale-wrapper"
                style={overviewOpen ? { width: viewport.width, height: viewport.height, transform: `scale(${scale})`, transformOrigin: 'top left', pointerEvents: 'none' } : {}}
              >
                <SystemUI />
              </div>
            </div>
          ))}
        </div>
  
        <div className="mc-dock">
          <Dock />
        </div>
      </div>
    );
  };
  
  export default MissionControlUI;
  