// Area 1: “Imports and constants”
import React, { useState, useRef, useEffect } from 'react';
import './DesktopIcon.css';

import {
  startHold,
  startDragging,
  cancelHold,
  handleTap
} from '../../interactions/IconInteractions/IconInteractions.jsx';

import { useStateManager } from '../../stores/StateManager/StateManager';
import { useLogger } from '../Logger/Logger.jsx';
import {
  HOLD_THRESHOLD,
  DOUBLE_TAP_DELAY
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';

// 30%-opacity overlay PNG
import disabledOverlay from '../../media/icons/disable.png';

// Area 2: “Component state and effects”
function DesktopIcon({
  wrapId,
  id,
  name,
  onDoubleClick,
  onClick,
  isSelected,
  selectedCount,
  onGroupMouseDown,
  disableClick,
  clearDisableClick,
  icon,
  available = true,
  position: controlledPosition,
  onPositionChange
}) {
  // 2.1: Position, drag and tap state
  const iconRef = useRef(null);
  const { log, enabled } = useLogger(`DesktopIcon[${wrapId}]`);
  const { state } = useStateManager();
  const desktopCfg = state.groups.desktop;
  const gridGap    = parseInt(desktopCfg.gridGap,      10) || 30;
  const iconWidth  = parseInt(desktopCfg.iconWidth,    10) || 64;
  const iconHeight = parseInt(desktopCfg.iconHeight,   10) || 64;
  const gridSize   = iconHeight;
  const topMargin    = parseInt(desktopCfg.topMargin,    10) || 40;
  const leftMargin   = parseInt(desktopCfg.leftMargin,   10) || 20;
  const rightMargin  = parseInt(desktopCfg.rightMargin,  10) || 20;
  const bottomMargin = parseInt(desktopCfg.bottomMargin, 10) || 100;

  const [position, setPosition] = useState(
    controlledPosition || { x: leftMargin, y: topMargin }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const isIconVisible = desktopCfg.iconVisible !== 'false';

  // 2.2: Animation state for initial mount
  //     Icons start scaled/down-opacity, then animate in on first render
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    if (isIconVisible) {
      // trigger animation one tick after mount
      setHasMounted(true);
    }
  }, [isIconVisible]);

  // keep controlledPosition in sync
  useEffect(() => {
    if (
      controlledPosition &&
      (controlledPosition.x !== position.x ||
       controlledPosition.y !== position.y)
    ) {
      setPosition(controlledPosition);
    }
  }, [controlledPosition, position.x, position.y]);

  const updatePosition = (newPos) => {
    setPosition(newPos);
    if (onPositionChange) onPositionChange(newPos);
  };

  if (enabled) {
    log('render', `Rendering "${name}" at x=${position.x},y=${position.y}`);
  }

  // Area 3: “Event handlers”
  // 3.1: Mouse/touch down, up, leave, tap logic…
  const handleMouseDown = (e) => {
    if (isSelected && selectedCount > 1 && onGroupMouseDown) {
      onGroupMouseDown(e);
      return;
    }
    e.preventDefault();
    startHold(
      e.clientX,
      e.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        startDragging(
          x, y, offsetX, offsetY,
          iconRef,
          updatePosition,
          setIsDragging,
          {
            TOP_MARGIN: topMargin,
            LEFT_MARGIN: leftMargin,
            RIGHT_MARGIN: rightMargin,
            BOTTOM_MARGIN: bottomMargin,
            gridGap,
            gridSize
          }
        );
      },
      HOLD_THRESHOLD
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (isSelected && selectedCount > 1 && onGroupMouseDown) {
      onGroupMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        touches: e.touches
      });
      return;
    }
    startHold(
      touch.clientX,
      touch.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        startDragging(
          x, y, offsetX, offsetY,
          iconRef,
          updatePosition,
          setIsDragging,
          {
            TOP_MARGIN: topMargin,
            LEFT_MARGIN: leftMargin,
            RIGHT_MARGIN: rightMargin,
            BOTTOM_MARGIN: bottomMargin,
            gridGap,
            gridSize
          }
        );
      },
      HOLD_THRESHOLD
    );
  };

  const wrapperOnClick = () => onClick();
  const wrapperOnDoubleClick = () => onDoubleClick();

  // Area 4: “Render”
  // 4.1: Compute inline style (adds opacity & transform animation)
  const iconStyle = {
    '--icon-width': `${iconWidth}px`,
    '--icon-height': `${iconHeight}px`,
    width: iconWidth,
    height: iconHeight,
    left: position.x,
    top: position.y,
    opacity: hasMounted && isIconVisible ? 1 : 0,
    transform: hasMounted && isIconVisible ? 'scale(1)' : 'scale(0.8)',
    transition: isDragging
      ? 'none'
      : 'left 0.3s, top 0.3s, opacity 0.5s, transform 0.5s'
  };

  return (
    // 4.2: JSX structure with a possible disabled overlay
    <div
      id={`desktop-icon-${wrapId}-${id}`}
      ref={iconRef}
      className={`desktop-icon ${
        isSelected ? 'selected' : ''
      } ${isDragging ? 'dragging' : ''}`}
      style={iconStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseUp={() => cancelHold(holdTimer, setHoldTimer)}
      onTouchEnd={(e) => {
        cancelHold(holdTimer, setHoldTimer);
        if (disableClick) {
          clearDisableClick();
          return;
        }
        handleTap(
          lastTap,
          setLastTap,
          wrapperOnDoubleClick,
          wrapperOnClick,
          DOUBLE_TAP_DELAY
        );
      }}
      onMouseLeave={() => cancelHold(holdTimer, setHoldTimer)}
      onClick={(e) => {
        e.stopPropagation();
        if (disableClick) {
          clearDisableClick();
          return;
        }
        handleTap(
          lastTap,
          setLastTap,
          wrapperOnDoubleClick,
          wrapperOnClick,
          DOUBLE_TAP_DELAY
        );
      }}
    >
      <div className="icon-frame" style={{ position: 'relative' }}>
        <div className="icon-highlight" />
        <div
          className="icon-image"
          style={{ backgroundImage: `url(${icon})` }}
        />
        {!available && (
          <img
            src={disabledOverlay}
            alt={`${name} disabled`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.9,
              pointerEvents: 'none',
              zIndex: 2
            }}
          />
        )}
      </div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
