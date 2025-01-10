import React, { useRef } from 'react';
import './Draggable.css';

const Draggable = () => {
  const cardRef = useRef(null);

  // We use these to store initial positions/sizes for dragging or resizing.
  let dragStartX = 0;
  let dragStartY = 0;

  let resizeStartX = 0;
  let resizeStartY = 0;
  let initialWidth = 0;
  let initialHeight = 0;

  // Flags to know which mode is active: "drag" or "resize"
  let isDragging = false;
  let isResizing = false;

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

    // Add appropriate move/end listeners depending on mouse or touch
    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!isDragging || !cardRef.current) return;

    const card = cardRef.current;
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate how far the cursor has moved
    const deltaX = dragStartX - clientX;
    const deltaY = dragStartY - clientY;

    // Update for next move event
    dragStartX = clientX;
    dragStartY = clientY;

    // Current position of the card
    const cardRect = card.getBoundingClientRect();

    // Calculate new top/left, clamped to viewport boundaries
    const newTop = Math.min(
      Math.max(card.offsetTop - deltaY, 0),
      window.innerHeight - cardRect.height
    );
    const newLeft = Math.min(
      Math.max(card.offsetLeft - deltaX, 0),
      window.innerWidth - cardRect.width
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

    // Get the card's initial width and height
    const { width, height } = card.getBoundingClientRect();
    initialWidth = width;
    initialHeight = height;

    // Add appropriate move/end listeners depending on mouse or touch
    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const onResizeMove = (e) => {
    if (!isResizing || !cardRef.current) return;

    const card = cardRef.current;
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate total distance from the initial resize click
    const deltaX = clientX - resizeStartX;
    const deltaY = clientY - resizeStartY;

    // Proposed new width/height
    let newWidth = initialWidth + deltaX;
    let newHeight = initialHeight + deltaY;

    // Read current bounding rectangle for boundary checks
    const cardRect = card.getBoundingClientRect();

    // Check boundary: if the right side + (proposed change) stays within window
    if (cardRect.left + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - cardRect.left;
    }
    // If the bottom + (proposed change) stays within window
    if (cardRect.top + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - cardRect.top;
    }

    // Enforce minimum dimensions
    newWidth = Math.max(newWidth, 200);
    newHeight = Math.max(newHeight, 150);

    // Apply new sizes
    card.style.width = `${newWidth}px`;
    card.style.height = `${newHeight}px`;
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

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      // We only need to start a drag from the card if it's NOT the resize handle area 
      onMouseDown={(e) => {
        // If the user clicked the resize area, don't start a drag here
        if (e.target.classList.contains('resize-handle')) return;
        onDragStart(e);
      }}
      onTouchStart={(e) => {
        if (e.target.classList.contains('resize-handle')) return;
        onDragStart(e);
      }}
    >
      {/* Title bar / drag handle */}
      <div
        className="drag-handle"
        onMouseDown={(e) => onDragStart(e)}
        onTouchStart={(e) => onDragStart(e)}
      >
        <div className="close-button" onClick={closeWindow} />
      </div>

      <div className="content">
        <p>macOS Window Content</p>
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
