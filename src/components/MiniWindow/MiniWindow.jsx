import React from 'react';
import './MiniWindow.css';

function MiniWindow({ anchorPos, onClose, children }) {
  return (
    <div className="mini-window" style={{ top: anchorPos.y, left: anchorPos.x }}>
      <div className="mini-window-content">
        {children}
      </div>
      <button className="mini-window-close" onClick={onClose}>×</button>
    </div>
  );
}

export default MiniWindow;
