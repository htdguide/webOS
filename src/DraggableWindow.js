import React, { useRef, useEffect } from 'react';
import './Draggable.css';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

function DraggableWindow({ children, onClose }) {
  const cardRef = useRef(null);

  // Refs to track drag/resize states
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // Starting points for dragging
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  // Starting points for resizing
  const resizeStartX = useRef(0);
  const resizeStartY = useRef(0);
  const initialWidth = useRef(0);
  const initialHeight = useRef(0);

  useEffect(() => {
    const handleWindowResize = () => {
      clampWindowPosition();
    };

    window.addEventListener('resize', handleWindowResize);

    const preventScroll = (e) => {
      if (isDraggingRef.current || isResizingRef.current) {
        e.preventDefault();
      }
    };
    document.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  /** Ensure window stays in view if the screen is resized */
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

  /** Drag handlers */
  const onDragStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    isResizingRef.current = false;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove, {
      passive: false,
    });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  const onDragMove = (e) => {
    if (!isDraggingRef.current || !cardRef.current) return;
    e.preventDefault();

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = dragStartX.current - clientX;
    const deltaY = dragStartY.current - clientY;

    dragStartX.current = clientX;
    dragStartY.current = clientY;

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
    isDraggingRef.current = false;
    const isTouch = e.type.includes('touch');

    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  /** Resize handlers (no aspect ratio lock) */
  const onResizeStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = false;
    isResizingRef.current = true;

    if (!cardRef.current) return;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    resizeStartX.current = clientX;
    resizeStartY.current = clientY;

    const { width, height } = cardRef.current.getBoundingClientRect();
    initialWidth.current = width;
    initialHeight.current = height;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove, {
      passive: false,
    });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const onResizeMove = (e) => {
    if (!isResizingRef.current || !cardRef.current) return;
    e.preventDefault();

    const card = cardRef.current;
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStartX.current;
    const deltaY = clientY - resizeStartY.current;

    let newWidth = initialWidth.current + deltaX;
    let newHeight = initialHeight.current + deltaY;

    const rect = card.getBoundingClientRect();

    if (rect.left + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - rect.left;
    }
    if (rect.top + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - rect.top;
    }

    newWidth = Math.max(newWidth, MIN_WIDTH);
    newHeight = Math.max(newHeight, MIN_HEIGHT);

    card.style.width = `${newWidth}px`;
    card.style.height = `${newHeight}px`;
  };

  const onResizeEnd = (e) => {
    isResizingRef.current = false;
    const isTouch = e.type.includes('touch');

    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  /** Close the window entirely */
  const closeWindow = () => {
    onClose?.(); // let parent know if needed
  };

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      style={{
        position: 'fixed',
        top: '100px',
        left: '100px',
        width: '300px',
        height: '200px',
      }}
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

      {/* Content area. We'll display children (canvas, etc.) inside here */}
      <div className="content" style={{ width: '100%', height: 'calc(100% - 30px)' }}>
        {children}
      </div>

      {/* Resize handle in bottom-right corner */}
      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      />
    </div>
  );
}

export default DraggableWindow;
