import React, { useState, useRef } from 'react';
import './DesktopIcon.css';

const GRID_SIZE = 80; // Size of each grid cell
const DOUBLE_TAP_DELAY = 300; // Maximum time between taps to register as a double-tap

function DesktopIcon({ name, onDoubleClick, onClick, isSelected, icon }) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const [lastTap, setLastTap] = useState(0); // Tracks the last tap timestamp for double-tap detection
  const iconRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startDragging(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDragging(touch.clientX, touch.clientY);
  };

  const startDragging = (startX, startY) => {
    const rect = iconRef.current.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    const handleMove = (event) => {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const newX = Math.max(
        0,
        Math.min(window.innerWidth - GRID_SIZE, clientX - offsetX)
      );
      const newY = Math.max(
        0,
        Math.min(window.innerHeight - GRID_SIZE, clientY - offsetY)
      );

      setPosition({
        x: Math.round(newX / GRID_SIZE) * GRID_SIZE,
        y: Math.round(newY / GRID_SIZE) * GRID_SIZE,
      });
    };

    const handleEnd = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      onDoubleClick(); // Trigger double-tap action
    } else {
      onClick(); // Highlight the icon
    }
    setLastTap(now);
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation(); // Prevent deselecting on wallpaper click
        handleTap();
      }}
    >
      <div className="icon-image" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
