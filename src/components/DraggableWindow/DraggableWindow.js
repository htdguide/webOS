import React, { useRef, useEffect, useState } from 'react';
import './DraggableWindow.css';

function DraggableWindow({ title, wasmWidth, wasmHeight, onClose, onMount, onUnmount, children }) {
  const windowRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 50, y: 50 });
  const resizeStartSize = useRef({ width: wasmWidth, height: wasmHeight });

  // Trigger lifecycle events for mount and unmount
  useEffect(() => {
    if (onMount) onMount();
    return () => {
      if (onUnmount) onUnmount();
    };
  }, [onMount, onUnmount]);

  useEffect(() => {
    const handleMove = (event) => {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      if (isDragging) {
        const newX = windowStartPos.current.x + (clientX - dragStartPos.current.x);
        const newY = windowStartPos.current.y + (clientY - dragStartPos.current.y);

        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
      }

      if (isResizing) {
        const newWidth = Math.max(resizeStartSize.current.width + (clientX - dragStartPos.current.x), 200);
        const newHeight = Math.max(resizeStartSize.current.height + (clientY - dragStartPos.current.y), 200);

        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing]);

  const handleDragStart = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    const rect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = { x: rect.left, y: rect.top };
  };

  const handleResizeStart = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    setIsResizing(true);
    dragStartPos.current = { x: clientX, y: clientY };
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
      <div
        className="window-header"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="header-left">
          <button className="close-button" onClick={onClose}></button>
        </div>
        <div className="header-title">{title}</div>
        <div className="header-right"></div>
      </div>
      <div className="window-content">{children}</div>
      <div
        className="resize-handle"
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      ></div>
    </div>
  );
}

export default DraggableWindow;
