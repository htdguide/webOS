// src/components/DesktopIcon/DesktopIcon.jsx

import React, { useState, useRef } from 'react';
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
// Use the new StateManager hook instead of the old UIStateStorage.
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useLogger } from '../Logger/Logger.jsx'; // <-- Import the logger

function DesktopIcon({
  name,
  onDoubleClick,
  onClick,
  isSelected,
  icon,
  position: initialPosition
}) {
  // Initialize logger for this component
  const { log, enabled } = useLogger('DesktopIcon');

  // Local state for position and dragging.
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);

  const iconRef = useRef(null);

  // Get icon visibility from the new StateManager.
  const { state } = useStateManager();
  // Assume icon visibility is stored in a group named "desktop" as a string.
  const iconVisibleStr = state.groups.desktop && state.groups.desktop.iconVisible;
  // Only if the value is exactly "false", we consider icons hidden.
  const isIconVisible = iconVisibleStr === 'false' ? false : true;

  // Log rendering with the current position
  if (enabled) {
    log('render', `Rendering icon "${name}" at position x=${position.x}, y=${position.y}`);
  }

  const handleMouseDown = (e) => {
    e.preventDefault();
    if (enabled) {
      log('userInteraction', `Mouse down on icon "${name}" at clientX=${e.clientX}, clientY=${e.clientY}`);
    }
    startHold(
      e.clientX,
      e.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        if (enabled) {
          log('userInteraction', `Start dragging icon "${name}" at x=${x}, y=${y} (offsetX=${offsetX}, offsetY=${offsetY})`);
        }
        startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging);
      }
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (enabled) {
      log('userInteraction', `Touch start on icon "${name}" at clientX=${touch.clientX}, clientY=${touch.clientY}`);
    }
    startHold(
      touch.clientX,
      touch.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) => {
        if (enabled) {
          log('userInteraction', `Start dragging icon "${name}" (touch) at x=${x}, y=${y} (offsetX=${offsetX}, offsetY=${offsetY})`);
        }
        startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging);
      }
    );
  };

  // Wrappers to log single- and double-click/tap events
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

  // The style ensures the icon is placed using absolute coordinates
  // relative to its parent container (the desktop div).
  const iconStyle = {
    width: ICON_WIDTH,
    height: ICON_HEIGHT,
    left: position.x,
    top: position.y,
    opacity: isIconVisible ? 1 : 0,
    transition: isDragging ? 'none' : 'left 0.3s, top 0.3s, opacity 0.5s'
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
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
