import React, { useRef, useEffect } from 'react';
import './Draggable.css';

/**
 * DraggableWindow
 * 
 * Behavior:
 *   - Tries to open at (wasmWidth x wasmHeight).
 *   - If it doesn't fit the screen, we scale it down proportionally so it does fit.
 *   - We then set the window's min-width and min-height to that scaled dimension,
 *     so the user CANNOT size it below that. (No smaller than native or scaled.)
 *   - The canvas is placed at the top-left corner, at that exact dimension
 *     (no stretching when user resizes bigger).
 *   - Extra space is just empty if the user makes the window larger than min dimension.
 * 
 * Props:
 *   - wasmWidth, wasmHeight: The native resolution for the WASM app, e.g. 400x500.
 *   - onClose: Callback for the window’s close button.
 *   - children: Typically the <canvas> or any child we want pinned top-left.
 */
function DraggableWindow({
  wasmWidth = 400,
  wasmHeight = 500,
  onClose,
  children
}) {
  const cardRef = useRef(null);
  const canvasRef = useRef(null); // If you want direct reference to the canvas, optional

  // We track dragging & resizing in refs (no re-renders).
  const isDraggingRef = useRef(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);

  const isResizingRef = useRef(false);
  const resizeStartX = useRef(0);
  const resizeStartY = useRef(0);
  const initialWindowWidth = useRef(0);
  const initialWindowHeight = useRef(0);

  useEffect(() => {
    // 1) On mount, set the initial window size to wasmWidth x wasmHeight,
    //    scaled down if it doesn’t fit the screen.
    setInitialWindowSize();

    // 2) Keep window on-screen if user resizes browser
    const handleWindowResize = () => clampWindowPosition();
    window.addEventListener('resize', handleWindowResize);

    // 3) Prevent background scrolling on mobile
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

  /** 
   * Set the window to (wasmWidth x wasmHeight). 
   * If that doesn’t fit the screen, scale down proportionally. 
   * Then store that as minWidth/minHeight so user can’t resize smaller.
   */
  const setInitialWindowSize = () => {
    if (!cardRef.current) return;

    let desiredW = wasmWidth;
    let desiredH = wasmHeight;
    const margin = 40; // margin from screen edges

    // Scale down if too wide
    if (desiredW + margin > window.innerWidth) {
      const scale = (window.innerWidth - margin) / desiredW;
      desiredW *= scale;
      desiredH *= scale;
    }
    // Scale down if too tall
    if (desiredH + margin > window.innerHeight) {
      const scale = (window.innerHeight - margin) / desiredH;
      desiredW *= scale;
      desiredH *= scale;
    }

    // Round them just in case
    desiredW = Math.floor(desiredW);
    desiredH = Math.floor(desiredH);

    // Set the window size
    const card = cardRef.current;
    card.style.width = `${desiredW}px`;
    card.style.height = `${desiredH}px`;

    // Position it somewhat nicely
    card.style.left = '50px';
    card.style.top = '50px';

    // Enforce min-size so user cannot go smaller
    card.style.minWidth = `${desiredW}px`;
    card.style.minHeight = `${desiredH}px`;

    // If we have a canvas, place it top-left at EXACTLY this native/scaled dimension
    // But user wants the canvas pinned top-left WITHOUT resizing 
    // => We'll rely on the parent's .content area. The canvas won't be scaled further.
  };

  /**
   * Keep the window fully on-screen if user drags or the browser is resized.
   */
  const clampWindowPosition = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();

    let left = rect.left;
    let top = rect.top;

    if (rect.right > window.innerWidth) {
      left = window.innerWidth - rect.width;
    }
    if (rect.bottom > window.innerHeight) {
      top = window.innerHeight - rect.height;
    }
    if (rect.left < 0) left = 0;
    if (rect.top < 0) top = 0;

    cardRef.current.style.left = `${left}px`;
    cardRef.current.style.top = `${top}px`;
  };

  /* ------------------ Drag Handlers ------------------ */
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

    // Because we set minWidth & minHeight to the final scaled dimension,
    // the user can't shrink it below that. So these checks are optional,
    // but let's clamp if user tries to force it off-screen:
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

      {/* 
        Content area. The canvas (children) is pinned top-left 
        simply by normal flow: no special scaling or positioning. 
      */}
      <div
        className="content"
        style={{
          width: '100%',
          height: 'calc(100% - 30px)',
          position: 'relative',
          backgroundColor: '#333',
          overflow: 'hidden', // optional
        }}
      >
        {/* If we want the canvas top-left, we just put it here. 
            The user can size the window bigger, but the canvas doesn't grow. */}
        {children}
      </div>

      {/* Bottom-right resize handle */}
      <div
        className="resize-handle"
        onMouseDown={onResizeStart}
        onTouchStart={onResizeStart}
      />
    </div>
  );
}

export default DraggableWindow;
