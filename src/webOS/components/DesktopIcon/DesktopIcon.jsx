// src/components/DesktopIcon/DesktopIcon.jsx

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
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  HOLD_THRESHOLD,
  DOUBLE_TAP_DELAY
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';

function DesktopIcon({
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
  position: controlledPosition,
  onPositionChange
}) {
  const iconRef = useRef(null);
  const { log, enabled } = useLogger('DesktopIcon');

  // dynamic config from state manager
  const { state } = useStateManager();
  const desktopCfg = state.groups.desktop;
  const gridGap = parseInt(desktopCfg.gridGap, 10) || 30;
  const iconWidth = parseInt(desktopCfg.iconWidth, 10) || 64;
  const iconHeight = parseInt(desktopCfg.iconHeight, 10) || 64;
  const gridSize = iconHeight;

  const [position, setPosition] = useState(
    controlledPosition || { x: 100, y: 100 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);

  // sync controlledPosition
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

  const iconVisibleStr =
    state.groups.desktop && state.groups.desktop.iconVisible;
  const isIconVisible = iconVisibleStr === 'false' ? false : true;

  if (enabled) {
    log(
      'render',
      `Rendering icon "${name}" at x=${position.x},y=${position.y}`
    );
  }

  const handleMouseDown = (e) => {
    if (isSelected && selectedCount > 1 && onGroupMouseDown) {
      onGroupMouseDown(e);
      return;
    }
    e.preventDefault();
    if (enabled) {
      log(
        'userInteraction',
        `Mouse down on "${name}" at clientX=${e.clientX},clientY=${e.clientY}`
      );
    }
    startHold(
      e.clientX,
      e.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        if (enabled) {
          log(
            'userInteraction',
            `Start dragging "${name}" at x=${x},y=${y}`
          );
        }
        startDragging(
          x,
          y,
          offsetX,
          offsetY,
          iconRef,
          updatePosition,
          setIsDragging,
          { TOP_MARGIN, LEFT_MARGIN, RIGHT_MARGIN, BOTTOM_MARGIN, gridGap, gridSize }
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
    if (enabled) {
      log(
        'userInteraction',
        `Touch start on "${name}" at x=${touch.clientX},y=${touch.clientY}`
      );
    }
    startHold(
      touch.clientX,
      touch.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        if (enabled) {
          log(
            'userInteraction',
            `Start drag (touch) "${name}" at x=${x},y=${y}`
          );
        }
        startDragging(
          x,
          y,
          offsetX,
          offsetY,
          iconRef,
          updatePosition,
          setIsDragging,
          { TOP_MARGIN, LEFT_MARGIN, RIGHT_MARGIN, BOTTOM_MARGIN, gridGap, gridSize }
        );
      },
      HOLD_THRESHOLD
    );
  };

  const wrapperOnClick = () => {
    if (enabled) log('userInteraction', `Single-click "${name}"`);
    onClick();
  };
  const wrapperOnDoubleClick = () => {
    if (enabled) log('userInteraction', `Double-click "${name}"`);
    onDoubleClick();
  };

  const iconStyle = {
    '--icon-width': `${iconWidth}px`,
    '--icon-height': `${iconHeight}px`,
    width: iconWidth,
    height: iconHeight,
    left: position.x,
    top: position.y,
    opacity: isIconVisible ? 1 : 0,
    transition: isDragging
      ? 'none'
      : 'left 0.3s, top 0.3s, opacity 0.5s'
  };

  return (
    <div
      id={`desktop-icon-${id}`}
      ref={iconRef}
      className={`desktop-icon ${
        isSelected ? 'selected' : ''
      } ${isDragging ? 'dragging' : ''}`}
      style={iconStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseUp={() => {
        if (enabled) log('userInteraction', `Mouse up "${name}"`);
        cancelHold(holdTimer, setHoldTimer);
      }}
      onTouchEnd={(e) => {
        if (enabled) log('userInteraction', `Touch end "${name}"`);
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
      onMouseLeave={() => {
        if (enabled) log('userInteraction', `Mouse leave "${name}"`);
        cancelHold(holdTimer, setHoldTimer);
      }}
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
      <div className="icon-frame">
        <div className="icon-highlight" />
        <div
          className="icon-image"
          style={{ backgroundImage: `url(${icon})` }}
        />
      </div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
