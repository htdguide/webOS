// src/components/MissionControl/MissionManager.jsx

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback
} from 'react';
import Wallpaper from '../../../../components/Wallpaper/Wallpaper.jsx';
import './MissionManager.css';

const SLIDE_DURATION = 300;                    // overview open/close timing (ms)
const NEW_DESKTOP_ANIMATION_DURATION = 2000;   // new‐desktop timing (ms)
const DELETE_ANIMATION_DURATION = 200;         // delete timing (ms)
const PREVIEW_HIDE_DELAY = 200;                // hide preview after slide (ms)
const MAX_DESKTOPS = 4;                        // new constant for max

const MissionManager = ({
  desktops,
  activeIndex,
  instantSwitchDesktop,
  exitOverview,
  setBarExpanded,
  wrapperStyle = {},
  overviewOpen,
  onDragStart,
  onDragOver,
  onDrop,
  viewport,
  panelAnimations,
  createDesktop,
  deleteDesktop,
  stateOpened    // ← new prop
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [baselineDesktopIds, setBaselineDesktopIds] = useState([]);

  // new‐desktop shift/back
  const [isShifted, setIsShifted] = useState(false);
  const [isAnimatingBack, setIsAnimatingBack] = useState(false);

  // delete shifts…
  const [isDeleteShifted, setIsDeleteShifted] = useState(false);
  const [isAnimatingDeleteBack, setIsAnimatingDeleteBack] = useState(false);
  const [deleteShiftAmount, setDeleteShiftAmount] = useState(0);
  const [isPanelShifted, setIsPanelShifted] = useState(false);
  const [isAnimatingPanelBack, setIsAnimatingPanelBack] = useState(false);
  const [panelShiftId, setPanelShiftId] = useState(null);
  const [isNameShifted, setIsNameShifted] = useState(false);
  const [isAnimatingNameBack, setIsAnimatingNameBack] = useState(false);
  const [nameShiftId, setNameShiftId] = useState(null);

  // new‐desktop name fade
  const [newNamePhase, setNewNamePhase] = useState('idle');
  const [newNameIndex, setNewNameIndex] = useState(null);

  // disable interactions until animation finishes
  const [disabledIndex, setDisabledIndex] = useState(null);

  // hover to show delete “×”
  const [showDeleteIndex, setShowDeleteIndex] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // preview panel
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);

  const panelRefs = useRef([]);

  // detect touch devices so we can keep the delete‐icon always visible
  const isTouchDevice =
    typeof window !== 'undefined' &&
    (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));

  // capture baseline IDs when overview first opens
  useLayoutEffect(() => {
    if (overviewOpen) {
      setBaselineDesktopIds(desktops.map(d => d.id));
    }
  }, [overviewOpen]);

  // hide all delete buttons whenever the overview is opened
  useEffect(() => {
    if (overviewOpen) {
      setShowDeleteIndex(null);
    }
  }, [overviewOpen]);

  // sync --screenratio for CSS
  useEffect(() => {
    const update = () => {
      document.documentElement.style.setProperty(
        '--screenratio',
        window.innerWidth / window.innerHeight
      );
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // center active thumbnail on overview open
  useEffect(() => {
    if (overviewOpen && panelRefs.current[activeIndex]) {
      panelRefs.current[activeIndex].scrollIntoView({
        behavior: 'smooth', block: 'nearest', inline: 'center'
      });
    }
  }, [overviewOpen, activeIndex]);

  // animate‐back for new desktop
  useEffect(() => {
    if (!isShifted) return;
    const frame = setTimeout(() => {
      setIsAnimatingBack(true);
      const timeout = setTimeout(() => {
        setIsAnimatingBack(false);
        setIsShifted(false);
      }, NEW_DESKTOP_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, 0);
    return () => clearTimeout(frame);
  }, [isShifted]);

  // animate‐back for delete
  useEffect(() => {
    if (!isDeleteShifted) return;
    const frame = setTimeout(() => {
      setIsAnimatingDeleteBack(true);
      const timeout = setTimeout(() => {
        setIsAnimatingDeleteBack(false);
        setIsDeleteShifted(false);
      }, DELETE_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, 0);
    return () => clearTimeout(frame);
  }, [isDeleteShifted]);

  // panel shift animate‐back
  useEffect(() => {
    if (!isPanelShifted) return;
    const frame = setTimeout(() => {
      setIsAnimatingPanelBack(true);
      const timeout = setTimeout(() => {
        setIsAnimatingPanelBack(false);
        setIsPanelShifted(false);
        setPanelShiftId(null);
      }, DELETE_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, 0);
    return () => clearTimeout(frame);
  }, [isPanelShifted]);

  // name shift animate‐back
  useEffect(() => {
    if (!isNameShifted) return;
    const frame = setTimeout(() => {
      setIsAnimatingNameBack(true);
      const timeout = setTimeout(() => {
        setIsAnimatingNameBack(false);
        setIsNameShifted(false);
        setNameShiftId(null);
      }, DELETE_ANIMATION_DURATION);
      return () => clearTimeout(timeout);
    }, 0);
    return () => clearTimeout(frame);
  }, [isNameShifted]);

  // name‐fade when new desktop appears
  useEffect(() => {
    if (newNamePhase !== 'init' || newNameIndex === null) return;
    if (desktops.length <= newNameIndex) return;
    let fadeFrame, resetTimer;
    fadeFrame = setTimeout(() => {
      setNewNamePhase('animating');
      resetTimer = setTimeout(() => {
        setNewNamePhase('idle');
        setNewNameIndex(null);
      }, NEW_DESKTOP_ANIMATION_DURATION);
    }, 0);
    return () => {
      clearTimeout(fadeFrame);
      clearTimeout(resetTimer);
    };
  }, [desktops.length, newNamePhase, newNameIndex]);

  // handleExit invoked on click–overlay or on programmatic close
  const handleExit = () => {
    if (isClosing) return;
    setIsClosing(true);

    // 1) After slide‐up, fade out the wallpaper preview
    setTimeout(() => {
      setIsPreviewVisible(false);
    }, SLIDE_DURATION);

    // 2) After slide‐up + fade, actually signal parent to close
    setTimeout(() => {
      exitOverview(true);
      setIsClosing(false);
    }, SLIDE_DURATION + PREVIEW_HIDE_DELAY);
  };

  // ** NEW: if parent toggles stateOpened → false while we're open, run same handleExit
  useEffect(() => {
    if (!stateOpened && overviewOpen) {
      handleExit();
    }
  }, [stateOpened, overviewOpen]);

  const handleClick = i => {
    if (isClosing) return;
    instantSwitchDesktop(i);
    exitOverview(false);
  };

  const handleNewClick = () => {
    if (isPlusDisabled) return;
    const idx = desktops.length;
    setDisabledIndex(idx);
    setIsShifted(true);
    setNewNamePhase('init');
    setNewNameIndex(idx);
    createDesktop();
    setTimeout(() => setIsPreviewVisible(false), PREVIEW_HIDE_DELAY);
    setTimeout(() => setDisabledIndex(null), NEW_DESKTOP_ANIMATION_DURATION);
  };

  // hover preview‐panel
  const handlePlusMouseEnter = () => {
    if (!isPlusDisabled) {
      setIsPreviewVisible(true);
    }
  };
  const handlePlusMouseLeave = () => {
    setIsPreviewVisible(false);
  };

  const handleMouseEnterPanel = useCallback(i => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowDeleteIndex(i);
    }, 1000);
  }, []);

  const handleMouseLeavePanel = useCallback(() => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = null;
    setShowDeleteIndex(null);
  }, []);

  // sizing
  const THUMB_H = 90;
  const scale = THUMB_H / viewport.height;
  const rawThumbW = viewport.width * scale;
  const cssThumbWidth = Math.max(rawThumbW, 55);
  const shiftX = rawThumbW + 30;
  const centerIndex = (desktops.length - 1) / 2;

  // guard delete when only one desktop
  const handleDelete = (e, i) => {
    if (desktops.length <= 1) {
      return;
    }
    e.stopPropagation();
    const lastIdx = desktops.length - 1;
    if (i === 0) {
      setDeleteShiftAmount(shiftX);
      setIsDeleteShifted(true);
      deleteDesktop(i);
    } else if (i === lastIdx) {
      setDeleteShiftAmount(-shiftX);
      setIsDeleteShifted(true);
      deleteDesktop(i);
    } else {
      const next = desktops[i + 1];
      setPanelShiftId(next.id);
      setIsPanelShifted(true);
      setNameShiftId(next.id);
      setIsNameShifted(true);
      deleteDesktop(i);
    }
  };

  const animations =
    Array.isArray(panelAnimations) && panelAnimations.length === desktops.length
      ? panelAnimations
      : desktops.map(d =>
          baselineDesktopIds.includes(d.id)
            ? 'slideFromCenter'
            : 'slideFadeFromRight'
        );

  const barClass = `mc-bar${isClosing ? ' closing' : ''}`;
  const wrapClass = `desktops-wrapper${isClosing ? ' closing' : ''}`;

  const originalWrapperMargin = wrapperStyle.marginLeft ?? '0px';
  const mergedWrapperStyle = { ...wrapperStyle };
  mergedWrapperStyle['--desktop-count'] = desktops.length;
  mergedWrapperStyle['--thumb-width'] = `${cssThumbWidth}px`;

  if (isShifted && !isAnimatingBack) {
    mergedWrapperStyle.marginLeft = `${shiftX}px`;
    mergedWrapperStyle.transition = 'none';
  } else if (isAnimatingBack) {
    mergedWrapperStyle.marginLeft = originalWrapperMargin;
    mergedWrapperStyle.transition =
      `margin-left ${NEW_DESKTOP_ANIMATION_DURATION}ms var(--easing-flattened)`;
  } else if (isDeleteShifted && !isAnimatingDeleteBack) {
    mergedWrapperStyle.marginLeft = `${deleteShiftAmount}px`;
    mergedWrapperStyle.transition = 'none';
  } else if (isAnimatingDeleteBack) {
    mergedWrapperStyle.marginLeft = originalWrapperMargin;
    mergedWrapperStyle.transition =
      `margin-left ${DELETE_ANIMATION_DURATION}ms var(--easing-flattened)`;
  }

  const mergedNamesStyle = { '--thumb-w': `${cssThumbWidth}px` };
  if (isShifted && !isAnimatingBack) {
    mergedNamesStyle.marginLeft = `${shiftX}px`;
    mergedNamesStyle.transition = 'none';
  } else if (isAnimatingBack) {
    mergedNamesStyle.marginLeft = '0px';
    mergedNamesStyle.transition =
      `margin-left ${NEW_DESKTOP_ANIMATION_DURATION}ms var(--easing-flattened)`;
  } else if (isDeleteShifted && !isAnimatingDeleteBack) {
    mergedNamesStyle.marginLeft = `${deleteShiftAmount}px`;
    mergedNamesStyle.transition = 'none';
  } else if (isAnimatingDeleteBack) {
    mergedNamesStyle.marginLeft = '0px';
    mergedNamesStyle.transition =
      `margin-left ${DELETE_ANIMATION_DURATION}ms var(--easing-flattened)`;
  }

  // Disable + when at max or during animation
  const isPlusDisabled = disabledIndex !== null || desktops.length >= MAX_DESKTOPS;
  const plusClassName = `mc-bar-new${isPlusDisabled ? ' disabled' : ''}${isTouchDevice ? ' touch' : ''}`;
  const plusHandlers = {};
  if (!isPlusDisabled) {
    if (isTouchDevice) {
      plusHandlers.onTouchStart = handleNewClick;
    } else {
      plusHandlers.onClick = handleNewClick;
      plusHandlers.onMouseEnter = handlePlusMouseEnter;
      plusHandlers.onMouseLeave = handlePlusMouseLeave;
    }
  }

  return (
    <>
      {overviewOpen && (
        <>
          <div className={barClass} onMouseEnter={() => setBarExpanded(true)}>
            <div className="mc-bar-names" style={mergedNamesStyle}>
              {desktops.map((desk, i) => {
                const isDisabled = i === disabledIndex;
                let nameStyle = {};
                if (i === newNameIndex && newNamePhase !== 'idle') {
                  nameStyle =
                    newNamePhase === 'init'
                      ? { opacity: 0, transition: 'none' }
                      : {
                          opacity: 1,
                          transition:
                            'opacity 0.1s var(--easing-flattened) calc(var(--desktop-panel-duration) - 0.1s)'
                        };
                }
                if (
                  desk.id === nameShiftId &&
                  isNameShifted &&
                  !isAnimatingNameBack
                ) {
                  nameStyle = {
                    ...nameStyle,
                    marginLeft: `${shiftX}px`,
                    transition: 'none'
                  };
                } else if (
                  desk.id === nameShiftId &&
                  isAnimatingNameBack
                ) {
                  nameStyle = {
                    ...nameStyle,
                    marginLeft: '0px',
                    transition: `margin-left ${DELETE_ANIMATION_DURATION}ms var(--easing-flattened)`
                  };
                }

                return (
                  <span
                    key={desk.id}
                    className={i === activeIndex ? 'mc-bar-name active' : 'mc-bar-name'}
                    onClick={isDisabled ? undefined : () => handleClick(i)}
                    style={{
                      ...nameStyle,
                      ...(isDisabled && { pointerEvents: 'none', cursor: 'default' })
                    }}
                  >
                    {desk.name || `Desktop ${i + 1}`}
                  </span>
                );
              })}
            </div>

            <span
              className={plusClassName}
              {...plusHandlers}
            >
              +
            </span>

            {/* preview panel */}
            <div
              className={`preview-panel${isPreviewVisible ? ' visible' : ''}`}
              style={{
                '--thumb-width': `${cssThumbWidth}px`,
                '--thumb-height': `${THUMB_H}px`
              }}
            >
              <Wallpaper />
            </div>
          </div>
          <div className="mc-exit-overlay" onClick={handleExit} />
        </>
      )}

      <div className={wrapClass} style={mergedWrapperStyle}>
        {desktops.map((desk, i) => {
          const baseStyle = overviewOpen
            ? {
                width: `${cssThumbWidth}px`,
                height: `${THUMB_H}px`,
                '--tx': `${-(i - centerIndex) * (cssThumbWidth + 30)}px`,
                '--ty': `-120px`,
                '--panel-animation': animations[i],
                '--panel-duration':
                  animations[i] === 'slideFromCenter'
                    ? 'var(--bar-slide-duration)'
                    : '2s',
                '--panel-easing': 'var(--easing-flattened)'
              }
            : {};

          const panelStyle = { ...baseStyle };
          if (
            desk.id === panelShiftId &&
            isPanelShifted &&
            !isAnimatingPanelBack
          ) {
            panelStyle.marginLeft = `${shiftX}px`;
            panelStyle.transition = 'none';
          } else if (
            desk.id === panelShiftId &&
            isAnimatingPanelBack
          ) {
            panelStyle.marginLeft = '0px';
            panelStyle.transition =
              `margin-left ${DELETE_ANIMATION_DURATION}ms var(--easing-flattened)`;
          }

          const isDisabled = i === disabledIndex;

          return (
            <div
              ref={el => (panelRefs.current[i] = el)}
              key={desk.id}
              className="desktop-panel"
              draggable={overviewOpen && !isDisabled}
              onDragStart={overviewOpen && !isDisabled ? e => onDragStart(e, i) : undefined}
              onDragOver={overviewOpen && !isDisabled ? onDragOver : undefined}
              onDrop={overviewOpen && !isDisabled ? e => onDrop(e, i) : undefined}
              onClick={overviewOpen && !isDisabled ? () => handleClick(i) : undefined}
              onMouseEnter={overviewOpen ? () => handleMouseEnterPanel(i) : undefined}
              onMouseLeave={overviewOpen ? handleMouseLeavePanel : undefined}
              style={{
                ...panelStyle,
                ...(isDisabled && { pointerEvents: 'none' })
              }}
            >
              {overviewOpen && desktops.length > 1 && (
                <div
                  className="delete-icon"
                  style={{
                    visibility: showDeleteIndex === i || isTouchDevice
                      ? 'visible'
                      : 'hidden'
                  }}
                  onClick={e => handleDelete(e, i)}
                >
                  <div className="cross">
                    ×
                  </div>
                </div>
              )}

              {overviewOpen && <div className="desktop-panel-overlay" />}
              <div
                className="desktop-scale-wrapper"
                style={
                  overviewOpen
                    ? {
                        width: viewport.width,
                        height: viewport.height,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left'
                      }
                    : {}
                }
              >
                {desk.ui}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MissionManager;
