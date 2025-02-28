import React, { useState, useRef, useLayoutEffect } from 'react';
import './MiniWindow.css';

function MiniWindow({ anchorPos, onClose, children }) {
  const miniWindowRef = useRef(null);
  const [position, setPosition] = useState({ top: anchorPos.y, left: anchorPos.x });

  useLayoutEffect(() => {
    if (miniWindowRef.current) {
      const rect = miniWindowRef.current.getBoundingClientRect();
      let top = anchorPos.y;
      let left = anchorPos.x;

      // If the mini window overflows the right edge, adjust left position
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width - 5; // 5 margin
      }
      // If the mini window overflows the bottom edge, adjust top position
      if (top + rect.height > window.innerHeight) {
        top = window.innerHeight - rect.height - 5; // 5 margin
      }
      // Ensure the position is not negative
      top = Math.max(10, top);
      left = Math.max(10, left);

      setPosition({ top, left });
    }
  }, [anchorPos]);

  return (
    <div 
      ref={miniWindowRef}
      className="mini-window" 
      style={{ top: position.top, left: position.left }}>
      <div className="mini-window-content">
        {children}
      </div>
      <button className="mini-window-close" onClick={onClose}>×</button>
    </div>
  );
}

export default MiniWindow;
