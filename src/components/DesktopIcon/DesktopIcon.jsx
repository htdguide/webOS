import React, { useState, useRef } from 'react';
import './DesktopIcon.css';
import {
  startHold,
  startDragging,
  cancelHold,
  handleTap,
} from './DesktopIconInteractions.jsx';

function DesktopIcon({ name, onDoubleClick, onClick, isSelected, icon, position: initialPosition }) {
  const [position, setPosition] = useState(initialPosition || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [lastTap, setLastTap] = useState(0);
  const iconRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startHold(e.clientX, e.clientY, iconRef, setHoldTimer, (x, y, offsetX, offsetY) =>
      startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging)
    );
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startHold(touch.clientX, touch.clientY, iconRef, setHoldTimer, (x, y, offsetX, offsetY) =>
      startDragging(x, y, offsetX, offsetY, iconRef, setPosition, setIsDragging)
    );
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? 'none' : 'left 0.3s, top 0.3s',
      }}
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
      onDoubleClick={onDoubleClick}
    >
      <div className="icon-image" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
