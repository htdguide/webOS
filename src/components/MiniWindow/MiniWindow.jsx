import React, { useEffect, useState } from 'react';
import './MiniWindow.css';

function MiniWindow({ anchorPos, onClose, children }) {
  const [position, setPosition] = useState({ top: anchorPos.y, right: 0 });

  useEffect(() => {
    // Calculate the distance from the right edge of the viewport so that the mini window's
    // top-right corner is aligned with the icon's bottom-right.
    const right = window.innerWidth - anchorPos.x;
    setPosition({ top: anchorPos.y, right });
  }, [anchorPos]);

  return (
    <div className="mini-window" style={{ top: position.top, right: position.right }}>
      <div className="mini-window-content">
        {children}
      </div>
      <button className="mini-window-close" onClick={onClose}>×</button>
    </div>
  );
}

export default MiniWindow;

