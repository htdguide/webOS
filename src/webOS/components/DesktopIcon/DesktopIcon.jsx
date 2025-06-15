// src/components/DesktopIcon/DesktopIcon.jsx

import React, { useState, useRef, useEffect } from 'react';
import './DesktopIcon.css';

import {
  startHold,
  startDragging,
  cancelHold,
  handleTap
} from '../../interactions/IconInteractions/IconInteractions.jsx';

import {
  ICON_WIDTH,
  ICON_HEIGHT
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';

import { useStateManager } from '../../stores/StateManager/StateManager';
import { useLogger } from '../Logger/Logger.jsx';

function DesktopIcon({
  name,
  onDoubleClick,
  onClick,
  isSelected,
  icon,
  position: controlledPosition,
  onPositionChange
}) {
  const iconRef = useRef(null);
  const { log, enabled } = useLogger('DesktopIcon');

  const [position, setPosition] = useState(
    controlledPosition || { x: 100, y: 100 }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);

  // Sync with controlled prop
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

  // Visibility from StateManager
  const { state } = useStateManager();
  const iconVisibleStr =
    state.groups.desktop && state.groups.desktop.iconVisible;
  const isIconVisible = iconVisibleStr === 'false' ? false : true;

  if (enabled) {
    log(
      'render',
      `Rendering icon "${name}" at position x=${position.x}, y=${position.y}`
    );
  }

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (enabled) {
      log(
        'userInteraction',
        `Mouse down on icon "${name}" at clientX=${e.clientX}, clientY=${e.clientY}`
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
            `Start dragging icon "${name}" at x=${x}, y=${y} (offsetX=${offsetX}, offsetY=${offsetY})`
          );
        }
        startDragging(
          x,
          y,
          offsetX,
          offsetY,
          iconRef,
          updatePosition,
          setIsDragging
        );
      }
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (enabled) {
      log(
        'userInteraction',
        `Touch start on icon "${name}" at clientX=${touch.clientX}, clientY=${touch.clientY}`
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
            `Start dragging icon "${name}" (touch) at x=${x}, y=${y} (offsetX=${offsetX}, offsetY=${offsetY})`
          );
        }
        startDragging(
          x,
          y,
          offsetX,
          offsetY,
          iconRef,
          updatePosition,
          setIsDragging
        );
      }
    );
  };

  const wrapperOnClick = () => {
    if (enabled) {
      log('userInteraction', `Icon single-clicked/tapped: "${name}"`);
    }
    onClick();
  };

  const wrapperOnDoubleClick = () => {
    if (enabled) {
      log('userInteraction', `Icon double-clicked/tapped: "${name}"`);
    }
    onDoubleClick();
  };

  // Inject CSS variables for width/height so CSS can calc remap
  const iconStyle = {
    '--icon-width': `${ICON_WIDTH}px`,
    '--icon-height': `${ICON_HEIGHT}px`,
    width: ICON_WIDTH,
    height: ICON_HEIGHT,
    left: position.x,
    top: position.y,
    opacity: isIconVisible ? 1 : 0,
    transition: isDragging
      ? 'none'
      : 'left 0.3s, top 0.3s, opacity 0.5s'
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${
        isSelected ? 'selected' : ''
      } ${isDragging ? 'dragging' : ''}`}
      style={iconStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseUp={() => {
        if (enabled) {
          log('userInteraction', `Mouse up on icon "${name}"`);
        }
        cancelHold(holdTimer, setHoldTimer);
      }}
      onTouchEnd={(e) => {
        if (enabled) {
          log('userInteraction', `Touch end on icon "${name}"`);
        }
        cancelHold(holdTimer, setHoldTimer);
        handleTap(lastTap, setLastTap, wrapperOnDoubleClick, wrapperOnClick);
      }}
      onMouseLeave={() => {
        if (enabled) {
          log('userInteraction', `Mouse left icon "${name}"`);
        }
        cancelHold(holdTimer, setHoldTimer);
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleTap(lastTap, setLastTap, wrapperOnDoubleClick, wrapperOnClick);
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
