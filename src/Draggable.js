import React, { useRef, useEffect } from 'react';
import './Draggable.css';

const MIN_WIDTH = 200;   // Minimum width of the window
const MIN_HEIGHT = 150;  // Minimum height of the window

const Draggable = () => {
  const cardRef = useRef(null);

  // Variables for dragging
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;

  // Variables for resizing
  let resizeStartX = 0;
  let resizeStartY = 0;
  let initialWidth = 0;
  let initialHeight = 0;
  let isResizing = false;

  useEffect(() => {
    const handleWindowResize = () => {
      if (!cardRef.current) return;
      clampWindowPosition();
      updateCanvasSize();
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // Ensure the window (and canvas) stays in view if the screen changes size
  const clampWindowPosition = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const clampedLeft = Math.min(rect.left, window.innerWidth - rect.width);
    const clampedTop = Math.min(rect.top, window.innerHeight - rect.height);

    const finalLeft = Math.max(clampedLeft, 0);
    const finalTop = Math.max(clampedTop, 0);

    card.style.left = `${finalLeft}px`;
    card.style.top = `${finalTop}px`;
  };

  // Make the canvas exactly fill its parent `.content` each time we resize or clamp
  const updateCanvasSize = () => {
    if (!cardRef.current) return;

    const content = cardRef.current.querySelector('.content');
    if (!content) return;

    const canvas = content.querySelector('canvas');
    if (!canvas) return;

    // Match the canvas element size (in px) to the content area
    canvas.width = content.clientWidth;
    canvas.height = content.clientHeight;
  };

  /* ------------------------ DRAG HANDLERS ------------------------ */

  const onDragStart = (e) => {
    e.preventDefault();

    isDragging = true;
    isResizing = false;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragStartX = clientX;
    dragStartY = clientY;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!isDragging || !cardRef.current) return;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = dragStartX - clientX;
    const deltaY = dragStartY - clientY;

    dragStartX = clientX;
    dragStartY = clientY;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    const newTop = Math.min(
      Math.max(card.offsetTop - deltaY, 0),
      window.innerHeight - rect.height
    );
    const newLeft = Math.min(
      Math.max(card.offsetLeft - deltaX, 0),
      window.innerWidth - rect.width
    );

    card.style.top = `${newTop}px`;
    card.style.left = `${newLeft}px`;
  };

  const onDragEnd = (e) => {
    isDragging = false;
    const isTouch = e.type.includes('touch');
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  /* ------------------------ RESIZE HANDLERS ------------------------ */

  const onResizeStart = (e) => {
    e.preventDefault();

    isDragging = false;
    isResizing = true;

    const card = cardRef.current;
    if (!card) return;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    resizeStartX = clientX;
    resizeStartY = clientY;

    const { width, height } = card.getBoundingClientRect();
    initialWidth = width;
    initialHeight = height;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const onResizeMove = (e) => {
    if (!isResizing || !cardRef.current) return;

    const card = cardRef.current;
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStartX;
    const deltaY = clientY - resizeStartY;

    let newWidth = initialWidth + deltaX;
    let newHeight = initialHeight + deltaY;

    const rect = card.getBoundingClientRect();

    // Right boundary
    if (rect.left + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - rect.left;
    }
    // Bottom boundary
    if (rect.top + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - rect.top;
    }

    // Enforce minimum size
    newWidth = Math.max(newWidth, MIN_WIDTH);
    newHeight = Math.max(newHeight, MIN_HEIGHT);

    card.style.width = `${newWidth}px`;
    card.style.height = `${newHeight}px`;

    // Update canvas dimension on-the-fly
    updateCanvasSize();
  };

  const onResizeEnd = (e) => {
    isResizing = false;
    const isTouch = e.type.includes('touch');
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  /* ------------------------ CLOSE HANDLER ------------------------ */

  const closeWindow = () => {
    if (cardRef.current) {
      cardRef.current.style.display = 'none';
    }
  };

  /* ------------------------ RENDER ------------------------ */

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      style={{ top: '100px', left: '100px', width: '300px', height: '200px' }}
      onMouseDown={(e) => {
        if (e.target.classList.contains('resize-handle')) return;
        onDragStart(e);
      }}
      onTouchStart={(e) => {
        if (e.target.classList.contains('resize-handle')) return;
        onDragStart(e);
      }}
    >
      {/* Title bar / drag handle */}
      <div className="drag-handle">
        <div className="close-button" onClick={closeWindow} />
      </div>

      {/* Content area with canvas */}
      <div className="content">
        <canvas
          style={{ width: '100%', height: '100%', display: 'block' }}
          width={300}
          height={170}
        />
      </div>

      {/* Resize handle in the bottom-right corner */}
      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      />
    </div>
  );
};

export default Draggable;
