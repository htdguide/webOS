import React, { useState, useRef } from 'react';
import './DesktopIcon.css';

const GRID_SIZE = 80; // Size of each grid cell

function DesktopIcon({ name, onDoubleClick, onClick, isSelected, icon }) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Snapped position
  const [isDragging, setIsDragging] = useState(false); // Track dragging state
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
    setIsDragging(true);

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

      iconRef.current.style.left = `${newX}px`; // Update real-time position
      iconRef.current.style.top = `${newY}px`;
    };

    const handleEnd = () => {
      setIsDragging(false);

      // Snap to the grid
      const rect = iconRef.current.getBoundingClientRect();
      const snappedX = Math.round(rect.left / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(rect.top / GRID_SIZE) * GRID_SIZE;

      // Smoothly move the icon to the snapped position
      setPosition({ x: snappedX, y: snappedY });

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

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      }`}
      style={{
        left: isDragging ? undefined : position.x,
        top: isDragging ? undefined : position.y,
        transition: isDragging ? 'none' : 'left 0.3s, top 0.3s', // Smooth snap animation
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={(e) => {
        e.stopPropagation(); // Prevent deselecting on wallpaper click
        onClick();
      }}
      onDoubleClick={onDoubleClick}
    >
      <div className="icon-image" style={{ backgroundImage: `url(${icon})` }}></div>
      <div className="icon-label">{name}</div>
    </div>
  );
}

export default DesktopIcon;
