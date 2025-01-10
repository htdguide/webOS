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

  /* --------------------------------------------------------
     1) Handle window/orientation changes
  -------------------------------------------------------- */
  useEffect(() => {
    const handleWindowResize = () => {
      if (!cardRef.current) return;

      // Clamp the window so it doesn't go off-screen
      clampWindowPosition();
    };

    // Listen for browser window resizing (also fires on phone orientation changes)
    window.addEventListener('resize', handleWindowResize);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const clampWindowPosition = () => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Constrain left and top within the new viewport
    const clampedLeft = Math.min(rect.left, window.innerWidth - rect.width);
    const clampedTop = Math.min(rect.top, window.innerHeight - rect.height);

    // Also clamp them to a minimum of 0
    const finalLeft = Math.max(clampedLeft, 0);
    const finalTop = Math.max(clampedTop, 0);

    card.style.left = `${finalLeft}px`;
    card.style.top = `${finalTop}px`;
  };

  /* --------------------------------------------------------
     2) Drag Handlers
  -------------------------------------------------------- */
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

    // Calculate clamped new position
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

  /* --------------------------------------------------------
     3) Resize Handlers
  -------------------------------------------------------- */
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

    // Get the card's initial width and height
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

    // Distance from initial pointer down
    const deltaX = clientX - resizeStartX;
    const deltaY = clientY - resizeStartY;

    // Proposed new sizes
    let newWidth = initialWidth + deltaX;
    let newHeight = initialHeight + deltaY;

    // Current bounding rect for boundary checks
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
  };

  const onResizeEnd = (e) => {
    isResizing = false;

    const isTouch = e.type.includes('touch');
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  /* --------------------------------------------------------
     4) Close Handler
  -------------------------------------------------------- */
  const closeWindow = () => {
    if (cardRef.current) {
      cardRef.current.style.display = 'none';
    }
  };

  /* --------------------------------------------------------
     5) Render
  -------------------------------------------------------- */
  return (
    <div
      ref={cardRef}
      className="draggable-card"
      style={{
        top: '100px',
        left: '100px',
        width: '300px',
        height: '200px',
      }}
      // If not clicking on the resize handle, allow drag
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
        <div className="close-button" onClick={closeWindow}></div>
      </div>
      <div className="content">
        <p>macOS Window Content</p>
      </div>
      {/* Resize handle in the bottom-right corner */}
      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      ></div>
    </div>
  );
};

export default Draggable;
