import React, { useState, useRef } from 'react';
import './DesktopIcon.css';

const GRID_SIZE = 80; // Size of each grid cell

function DesktopIcon({ name, onDoubleClick, onClick, isSelected, icon }) {
  const [position, setPosition] = useState({ x: 100, y: 100 }); // Initial position
  const iconRef = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();

    const rect = iconRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (event) => {
      event.preventDefault();

      const newX = Math.max(0, Math.min(window.innerWidth - GRID_SIZE, event.clientX - offsetX));
      const newY = Math.max(0, Math.min(window.innerHeight - GRID_SIZE, event.clientY - offsetY));

      setPosition({
        x: Math.round(newX / GRID_SIZE) * GRID_SIZE,
        y: Math.round(newY / GRID_SIZE) * GRID_SIZE,
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={iconRef}
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
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
