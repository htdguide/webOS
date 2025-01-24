import React, { useRef, useEffect, useState } from 'react';
import './DraggableWindow.css';

function DraggableWindow({ title, wasmWidth, wasmHeight, onClose, children }) {
  const windowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 50, y: 50 });
  const resizeStartSize = useRef({ width: wasmWidth, height: wasmHeight });

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging) {
        const newX = windowStartPos.current.x + (event.clientX - dragStartPos.current.x);
        const newY = windowStartPos.current.y + (event.clientY - dragStartPos.current.y);

        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }

      if (isResizing) {
        const newWidth = Math.max(resizeStartSize.current.width + (event.clientX - dragStartPos.current.x), 200);
        const newHeight = Math.max(resizeStartSize.current.height + (event.clientY - dragStartPos.current.y), 200);

        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleMouseDown = (event) => {
    setIsDragging(true);
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    const rect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = { x: rect.left, y: rect.top };
  };

  const handleResizeStart = (event) => {
    setIsResizing(true);
    dragStartPos.current = { x: event.clientX, y: event.clientY };
    const rect = windowRef.current.getBoundingClientRect();
    resizeStartSize.current = { width: rect.width, height: rect.height };
  };

  return (
    <div
      ref={windowRef}
      className="draggable-window"
      style={{
        width: `${wasmWidth}px`,
        height: `${wasmHeight}px`,
        top: '50px',
        left: '50px',
      }}
    >
      <div className="window-header" onMouseDown={handleMouseDown}>
        <div className="header-left">
          <button className="close-button" onClick={onClose}></button>
        </div>
        <div className="header-title">{title}</div>
        <div className="header-right"></div>
      </div>
      <div className="window-content">{children}</div>
      <div className="resize-handle" onMouseDown={handleResizeStart}></div>
    </div>
  );
}

export default DraggableWindow;
