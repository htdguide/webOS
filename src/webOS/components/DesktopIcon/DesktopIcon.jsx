// DesktopIcon.jsx

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

function DesktopIcon({
  name,
  onDoubleClick,
  onClick,
  isSelected,
  icon,
  position: initialPosition
}) {
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
  const isIconVisible = iconVisibleStr === "false" ? false : true;

  const handleMouseDown = (e) => {
    e.preventDefault();
    startHold(
      e.clientX,
      e.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) =>
        startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging)
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startHold(
      touch.clientX,
      touch.clientY,
      iconRef,
      setHoldTimer,
      (x, y, offsetX, offsetY) =>
        startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging)
    );
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
      onMouseUp={() => cancelHold(holdTimer, setHoldTimer)}
      onTouchEnd={(e) => {
        cancelHold(holdTimer, setHoldTimer);
        handleTap(lastTap, setLastTap, onDoubleClick, onClick);
      }}
      onMouseLeave={() => cancelHold(holdTimer, setHoldTimer)}
      onClick={(e) => {
        e.stopPropagation();
        handleTap(lastTap, setLastTap, onDoubleClick, onClick);
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
