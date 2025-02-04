import React, { useRef } from 'react';
import useDraggable from './useDraggable';
import './DraggableWindow.css';

function DraggableWindow({ title, wasmWidth: windowWidth, wasmHeight: windowHeight, onClose, onMount, onUnmount, children }) {
  const windowRef = useRef(null);

  useDraggable(windowRef, windowWidth, windowHeight, onMount, onUnmount);

  return (
    <div
      ref={windowRef}
      className="draggable-window"
      style={{
        width: `${windowWidth}px`,
        height: `${windowHeight}px`,
        top: '50px',
        left: '50px',
      }}
    >
      <div className="window-header">
        <div className="header-left">
          <button className="close-button" onClick={onClose}></button>
        </div>
        <div className="header-title">{title}</div>
        <div className="header-right"></div>
      </div>
      <div className="window-content">{children}</div>

      {/* Bottom-right resizer */}
      <div className="resize-handle resize-br"></div>

      {/* Top-right resizer */}
      <div className="resize-handle resize-tr"></div>

      {/* Bottom-left resizer */}
      <div className="resize-handle resize-bl"></div>
    </div>
  );
}

export default DraggableWindow;
