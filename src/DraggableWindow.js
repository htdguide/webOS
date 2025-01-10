import React, { useRef, useEffect } from 'react';
import './Draggable.css';

/**
 * DraggableWindow
 *
 * Behavior:
 *   - Draggable only when the user interacts with the title bar (`.drag-handle`).
 *   - Resizable via the bottom-right corner.
 *   - Opens at `wasmWidth x wasmHeight`, scaling down if it doesn't fit the screen.
 *   - The canvas remains fixed in the top-left corner.
 *
 * Props:
 *   - wasmWidth, wasmHeight: Native resolution for the WASM app.
 *   - onClose: Callback when the close button is clicked.
 *   - children: Typically the <canvas> or any child to render inside.
 */
function DraggableWindow({
  wasmWidth = 400,
  wasmHeight = 500,
  onClose,
  children
}) {
  const cardRef = useRef(null);

  const isDraggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  const isResizingRef = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartY = useRef(0);
  const initialWindowWidth = useRef(0);
  const initialWindowHeight = useRef(0);

  useEffect(() => {
    setInitialWindowSize();
    window.addEventListener('resize', clampWindowPosition);

    return () => {
      window.removeEventListener('resize', clampWindowPosition);
    };
  }, []);

  /**
   * Set the initial size of the window to `wasmWidth x wasmHeight`,
   * scaled down if it doesn't fit the screen.
   */
  const setInitialWindowSize = () => {
    const card = cardRef.current;
    if (!card) return;

    let desiredW = wasmWidth;
    let desiredH = wasmHeight;
    const margin = 40;

    if (desiredW + margin > window.innerWidth) {
      const scale = (window.innerWidth - margin) / desiredW;
      desiredW *= scale;
      desiredH *= scale;
    }

    if (desiredH + margin > window.innerHeight) {
      const scale = (window.innerHeight - margin) / desiredH;
      desiredW *= scale;
      desiredH *= scale;
    }

    desiredW = Math.floor(desiredW);
    desiredH = Math.floor(desiredH);

    card.style.width = `${desiredW}px`;
    card.style.height = `${desiredH}px`;
    card.style.minWidth = `${desiredW}px`;
    card.style.minHeight = `${desiredH}px`;
    card.style.left = '50px';
    card.style.top = '50px';
  };

  /**
   * Keep the window fully on-screen.
   */
  const clampWindowPosition = () => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const clampedLeft = Math.min(rect.left, window.innerWidth - rect.width);
    const clampedTop = Math.min(rect.top, window.innerHeight - rect.height);

    card.style.left = `${Math.max(clampedLeft, 0)}px`;
    card.style.top = `${Math.max(clampedTop, 0)}px`;
  };

  /* ------------------ Drag Handlers ------------------ */
  const onDragStart = (e) => {
    if (!e.target.classList.contains('drag-handle')) return; // Only drag from the title bar
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

    const rect = cardRef.current.getBoundingClientRect();
    const newLeft = rect.left - deltaX;
    const newTop = rect.top - deltaY;

    cardRef.current.style.left = `${newLeft}px`;
    cardRef.current.style.top = `${newTop}px`;
    clampWindowPosition();
  };

  const onDragEnd = (e) => {
    isDraggingRef.current = false;
    const isTouch = e.type.includes('touch');
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onDragMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onDragEnd);
  };

  /* ------------------ Resize Handlers ------------------ */
  const onResizeStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = false;
    isResizingRef.current = true;

    const card = cardRef.current;
    if (!card) return;

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const rect = card.getBoundingClientRect();
    initialWindowWidth.current = rect.width;
    initialWindowHeight.current = rect.height;

    resizeStartX.current = clientX;
    resizeStartY.current = clientY;

    document.addEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove, {
      passive: false,
    });
    document.addEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const onResizeMove = (e) => {
    if (!isResizingRef.current || !cardRef.current) return;
    e.preventDefault();

    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - resizeStartX.current;
    const deltaY = clientY - resizeStartY.current;

    let newWidth = initialWindowWidth.current + deltaX;
    let newHeight = initialWindowHeight.current + deltaY;

    const rect = cardRef.current.getBoundingClientRect();
    if (rect.left + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - rect.left;
    }
    if (rect.top + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - rect.top;
    }

    cardRef.current.style.width = `${Math.floor(newWidth)}px`;
    cardRef.current.style.height = `${Math.floor(newHeight)}px`;
  };

  const onResizeEnd = (e) => {
    isResizingRef.current = false;
    const isTouch = e.type.includes('touch');
    document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', onResizeMove);
    document.removeEventListener(isTouch ? 'touchend' : 'mouseup', onResizeEnd);
  };

  const closeWindow = () => {
    onClose?.();
  };

  return (
    <div
      ref={cardRef}
      className="draggable-card"
      style={{
        position: 'fixed',
      }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
    >
      {/* Title bar / drag handle */}
      <div className="drag-handle">
        <div className="close-button" onClick={closeWindow} />
      </div>

      <div
        className="content"
        style={{
          width: '100%',
          height: 'calc(100% - 30px)',
          position: 'relative',
          backgroundColor: '#333',
        }}
      >
        {children}
      </div>

      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      />
    </div>
  );
}

export default DraggableWindow;
