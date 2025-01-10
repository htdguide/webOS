import React, { useState, useRef } from 'react';
import './DesktopIcon.css';

const GRID_SIZE = 80; // Size of each grid cell
const HOLD_THRESHOLD = 100; // Hold duration in milliseconds for dragging
const DOUBLE_TAP_DELAY = 300; // Maximum time between taps for a double-tap (in milliseconds)

function DesktopIcon({ name, onDoubleClick, onClick, isSelected, icon }) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Snapped position
  const [isDragging, setIsDragging] = useState(false); // Track dragging state
  const [holdTimer, setHoldTimer] = useState(null); // Timer for hold detection
  const [lastTap, setLastTap] = useState(0); // Timestamp of the last tap
  const iconRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    startHold(e.clientX, e.clientY);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startHold(touch.clientX, touch.clientY);
  };

  const startHold = (startX, startY) => {
    const rect = iconRef.current.getBoundingClientRect();
    const offsetX = startX - rect.left;
    const offsetY = startY - rect.top;

    const timer = setTimeout(() => {
      startDragging(startX, startY, offsetX, offsetY);
    }, HOLD_THRESHOLD);

    setHoldTimer(timer);
  };

  const startDragging = (startX, startY, offsetX, offsetY) => {
    setIsDragging(true);

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

      iconRef.current.style.left = `${newX}px`; // Update real-time position
      iconRef.current.style.top = `${newY}px`;
    };

    const handleEnd = () => {
      if (isDragging) {
        // Sync real-time position to state
        const rect = iconRef.current.getBoundingClientRect();
        const snappedX = Math.round(rect.left / GRID_SIZE) * GRID_SIZE;
        const snappedY = Math.round(rect.top / GRID_SIZE) * GRID_SIZE;

        setPosition({ x: snappedX, y: snappedY }); // Update state to reflect final position
      }

      setIsDragging(false); // Reset dragging state
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

  const cancelHold = () => {
    if (holdTimer) {
      clearTimeout(holdTimer); // Cancel the hold timer
      setHoldTimer(null);
    }
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      onDoubleClick(); // Trigger double-tap action
    } else {
      onClick(); // Highlight the icon on single tap
    }
    setLastTap(now);
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? 'none' : 'left 0.3s, top 0.3s', // Smooth snap animation
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseUp={cancelHold}
      onTouchEnd={(e) => {
        cancelHold();
        handleTap(); // Handle tap after releasing
      }}
      onMouseLeave={cancelHold} // Cancel hold if the mouse leaves the icon
      onClick={(e) => {
        e.stopPropagation(); // Prevent deselecting on wallpaper click
        handleTap();
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="icon-image" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
