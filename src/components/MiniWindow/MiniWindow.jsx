import React, { useState, useRef, useLayoutEffect } from 'react';

function MiniWindow({ anchorPos, onClose, children, className = '' }) {
  const miniWindowRef = useRef(null);
  const [position, setPosition] = useState({ top: anchorPos.y, left: anchorPos.x });

  useLayoutEffect(() => {
    if (miniWindowRef.current) {
      const rect = miniWindowRef.current.getBoundingClientRect();
      let top = anchorPos.y;
      let left = anchorPos.x;

      // Adjust if the mini window overflows the right edge
      if (left + rect.width > window.innerWidth) {
        left = window.innerWidth - rect.width - 5; // 5px margin
      }
      // Adjust if the mini window overflows the bottom edge
      if (top + rect.height > window.innerHeight) {
        top = window.innerHeight - rect.height - 5; // 5px margin
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
      style={{ position: 'absolute', top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}

export default MiniWindow;
