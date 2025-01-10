import React, { useRef, useEffect } from 'react';
import './Draggable.css';

/**
 * DraggableWindow (Free-Resize Version)
 *
 * - Allows the user to resize the window in any aspect ratio (no locked ratio).
 * - Keeps the draggable window and canvas inside the screen on both desktop and mobile.
 * - Prevents background scrolling on mobile while dragging/resizing the window.
 *
 * Props (optional):
 *  - wasmWidth  : The native width for WASM content (not enforced; just informational).
 *  - wasmHeight : The native height for WASM content (not enforced; just informational).
 *
 * Usage example:
 *   <DraggableWindow wasmWidth={640} wasmHeight={480} />
 */

const MIN_WIDTH = 200;   // Minimum width of the window (px)
const MIN_HEIGHT = 150;  // Minimum height of the window (px)

const DraggableWindow = ({ wasmWidth = 640, wasmHeight = 480 }) => {
  const cardRef = useRef(null);

  // ---------------------- Dragging Variables ----------------------
  let dragStartX = 0;
  let dragStartY = 0;
  let isDragging = false;

  // ---------------------- Resizing Variables ----------------------
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

    // Prevent the background from scrolling when dragging on mobile
    const preventScrollOnDrag = (e) => {
      if (isDragging || isResizing) {
        // Prevent scrolling if the user is dragging or resizing
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventScrollOnDrag, { passive: false });

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('touchmove', preventScrollOnDrag);
    };
  }, []);

  /**
   * Keep the draggable window within the viewport
   */
  const clampWindowPosition = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();

    // Clamp left/top so we don't move off-screen
    const clampedLeft = Math.min(rect.left, window.innerWidth - rect.width);
    const clampedTop = Math.min(rect.top, window.innerHeight - rect.height);

    const finalLeft = Math.max(clampedLeft, 0);
    const finalTop = Math.max(clampedTop, 0);

    card.style.left = `${finalLeft}px`;
    card.style.top = `${finalTop}px`;
  };

  /**
   * Make the canvas element always fit the .content area
   */
  const updateCanvasSize = () => {
    if (!cardRef.current) return;

    const content = cardRef.current.querySelector('.content');
    const canvas = content?.querySelector('canvas');

    if (!canvas || !content) return;

    canvas.width = content.clientWidth;
    canvas.height = content.clientHeight;
  };

  // ----------------------------------------------------------
  // 1) Drag Handlers
  // ----------------------------------------------------------
  const onDragStart = (e) => {
    e.preventDefault();

    isDragging = true;
    isResizing = false;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragStartX = clientX;
    dragStartY = clientY;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove, {
      passive: false,
    });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!isDragging || !cardRef.current) return;
    e.preventDefault();

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

  // ----------------------------------------------------------
  // 2) Resize Handlers (No Aspect Ratio)
  // ----------------------------------------------------------
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

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove, {
      passive: false,
    });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const onResizeMove = (e) => {
    if (!isResizing || !cardRef.current) return;
    e.preventDefault();

    const card = cardRef.current;
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    // Calculate raw deltas
    const deltaX = clientX - resizeStartX;
    const deltaY = clientY - resizeStartY;

    let newWidth = initialWidth + deltaX;
    let newHeight = initialHeight + deltaY;

    const rect = card.getBoundingClientRect();

    // Boundary checks
    if (rect.left + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - rect.left;
    }
    if (rect.top + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - rect.top;
    }

    // Enforce minimum sizes
    newWidth = Math.max(newWidth, MIN_WIDTH);
    newHeight = Math.max(newHeight, MIN_HEIGHT);

    // Apply final size
    card.style.width = `${newWidth}px`;
    card.style.height = `${newHeight}px`;

    updateCanvasSize();
  };

  const onResizeEnd = (e) => {
    isResizing = false;
    const isTouch = e.type.includes('touch');

    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  // ----------------------------------------------------------
  // 3) Close Handler
  // ----------------------------------------------------------
  const closeWindow = () => {
    if (cardRef.current) {
      cardRef.current.style.display = 'none';
    }
  };

  // ----------------------------------------------------------
  // 4) Render
  // ----------------------------------------------------------
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
      onMouseDown={(e) => {
        // If user is clicking on the resize handle, don't start a drag
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

      {/* Content area with a canvas. This will hold the WASM-rendered image. */}
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

export default DraggableWindow;
