// MiniWindow.jsx
import React, { useState, useRef, useLayoutEffect } from 'react';

function MiniWindow({ anchorPos, onClose, children, className = '', visible = true }) {
  const miniWindowRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (anchorPos && miniWindowRef.current) {
      // Get the mini window's parent container (assumed to be the desktop div)
      const container = miniWindowRef.current.parentNode;
      const containerRect = container.getBoundingClientRect();
      const rect = miniWindowRef.current.getBoundingClientRect();
      let top = anchorPos.y;
      let left = anchorPos.x;

      // Adjust if the mini window overflows the right edge of the container
      if (left + rect.width > containerRect.width) {
        left = containerRect.width - rect.width - 5; // 5px margin
      }
      // Adjust if the mini window overflows the bottom edge of the container
      if (top + rect.height > containerRect.height) {
        top = containerRect.height - rect.height - 5; // 5px margin
      }
      // Ensure the position is not too close to the top or left edge
      top = Math.max(10, top);
      left = Math.max(10, left);

      setPosition({ top, left });
    }
  }, [anchorPos]);

  return (
    <div
      ref={miniWindowRef}
      className={className}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        opacity: visible ? 1 : 0,
        zIndex: 9999,
        transition: 'opacity 300ms ease-in-out, backdrop-filter 300ms ease-in-out'
      }}
    >
      {children}
    </div>
  );
}

export default MiniWindow;
