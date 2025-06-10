// src/webOS/interactions/useDraggable/useDraggable.jsx

import { useEffect, useState, useRef } from 'react';

const CORNER_TYPES = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

function useDraggable(windowRef, sizeProps, onMount, onUnmount, onResize) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [snapDirection, setSnapDirection] = useState(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: sizeProps.width, height: sizeProps.height });
  const snapTimerRef = useRef(null);
  const previewRef = useRef(null);

  // Parse and normalize min/max sizes
  const {
    minWidth: propMinWidth,
    minHeight: propMinHeight,
    maxWidth: propMaxWidth,
    maxHeight: propMaxHeight,
  } = sizeProps;
  const minWidth = typeof propMinWidth === 'number'
    ? propMinWidth
    : parseInt(propMinWidth, 10) || 0;
  const minHeight = typeof propMinHeight === 'number'
    ? propMinHeight
    : parseInt(propMinHeight, 10) || 0;
  const maxWidth = typeof propMaxWidth === 'number'
    ? propMaxWidth
    : parseInt(propMaxWidth, 10) || Infinity;
  const maxHeight = typeof propMaxHeight === 'number'
    ? propMaxHeight
    : parseInt(propMaxHeight, 10) || Infinity;

  // Mount / unmount callbacks
  useEffect(() => {
    if (onMount) onMount();
    return () => { if (onUnmount) onUnmount(); };
  }, [onMount, onUnmount]);

  // --- Snap preview overlay (unchanged) ---
  const showSnapPreview = () => {
    if (!previewRef.current && snapDirection) {
      const preview = document.createElement('div');
      preview.style.position = 'absolute';
      preview.style.zIndex = '9999';
      preview.style.pointerEvents = 'none';
      preview.style.backgroundColor = 'rgba(255,255,255,0.2)';
      preview.style.border = '2px solid white';
      preview.style.borderRadius = '12px';
      const topMargin = 32, sideMargin = 8, bottomMargin = 8;
      const container = windowRef.current.parentNode;
      const rect = container.getBoundingClientRect();
      if (snapDirection === 'top') {
        preview.style.left = `${sideMargin}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${rect.width - sideMargin*2}px`;
        preview.style.height = `${rect.height - topMargin - bottomMargin}px`;
      } else if (snapDirection === 'left') {
        preview.style.left = `${sideMargin}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${(rect.width - sideMargin*2)/2}px`;
        preview.style.height = `${rect.height - topMargin - bottomMargin}px`;
      } else if (snapDirection === 'right') {
        preview.style.left = `${sideMargin + (rect.width - sideMargin*2)/2}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${(rect.width - sideMargin*2)/2}px`;
        preview.style.height = `${rect.height - topMargin - bottomMargin}px`;
      }
      preview.style.transition = 'opacity 175ms ease';
      preview.style.opacity = '0';
      container.appendChild(preview);
      previewRef.current = preview;
      requestAnimationFrame(() => {
        if (previewRef.current) previewRef.current.style.opacity = '1';
      });
    }
  };
  const hideSnapPreview = () => {
    if (previewRef.current) {
      previewRef.current.style.opacity = '0';
      setTimeout(() => {
        if (previewRef.current?.parentNode) {
          previewRef.current.parentNode.removeChild(previewRef.current);
          previewRef.current = null;
        }
      }, 500);
    }
  };
  useEffect(() => {
    if (snapDirection) showSnapPreview();
    else hideSnapPreview();
  }, [snapDirection]);

  // --- Snap actions (unchanged) ---
  const enterFullscreen = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition = 'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 8;
    windowRef.current.style.left = `${side}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${rect.width - side*2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    if (onResize) onResize(rect.width - side*2, rect.height - top - bottom);
    setTimeout(() => { windowRef.current.style.transition = ''; }, 150);
  };
  const enterLeftHalf = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition = 'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 8;
    windowRef.current.style.left = `${side}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${(rect.width - side*2)/2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    if (onResize) onResize((rect.width - side*2)/2, rect.height - top - bottom);
    setTimeout(() => { windowRef.current.style.transition = ''; }, 150);
  };
  const enterRightHalf = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition = 'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 8;
    windowRef.current.style.left = `${side + (rect.width - side*2)/2}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${(rect.width - side*2)/2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    if (onResize) onResize((rect.width - side*2)/2, rect.height - top - bottom);
    setTimeout(() => { windowRef.current.style.transition = ''; }, 150);
  };
  const snapToPosition = () => {
    if (snapDirection === 'top') enterFullscreen();
    else if (snapDirection === 'left') enterLeftHalf();
    else if (snapDirection === 'right') enterRightHalf();
  };

  // --- Move & Resize Handler ---
  useEffect(() => {
    const handleMove = (event) => {
      if (!isDragging && !resizeType) return;
      event.preventDefault();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      // Dragging
      if (isDragging) {
        const container = windowRef.current.parentNode;
        const rect = container.getBoundingClientRect();
        const edge = 26;
        if (clientX < rect.left + edge) {
          if (!snapTimerRef.current) snapTimerRef.current = setTimeout(() => setSnapDirection('left'), 250);
        } else if (clientX > rect.right - edge) {
          if (!snapTimerRef.current) snapTimerRef.current = setTimeout(() => setSnapDirection('right'), 250);
        } else if (clientY < rect.top + edge) {
          if (!snapTimerRef.current) snapTimerRef.current = setTimeout(() => setSnapDirection('top'), 250);
        } else {
          clearTimeout(snapTimerRef.current);
          snapTimerRef.current = null;
          setSnapDirection(null);
        }
        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        windowRef.current.style.left = `${windowStartPos.current.x + dx}px`;
        windowRef.current.style.top = `${Math.max(windowStartPos.current.y + dy, 26)}px`;
      }

      // Resizing
      if (resizeType) {
        const initW = resizeStartSize.current.width;
        const initH = resizeStartSize.current.height;
        const origRight = windowStartPos.current.x + initW;
        const origBottom = windowStartPos.current.y + initH;

        let newW = initW;
        let newH = initH;
        let newX = windowStartPos.current.x;
        let newY = windowStartPos.current.y;

        // Corners
        if (resizeType === 'bottom-right') {
          const dx = clientX - dragStartPos.current.x;
          const dy = clientY - dragStartPos.current.y;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
        } else if (resizeType === 'bottom-left') {
          const dx = dragStartPos.current.x - clientX;
          const dy = clientY - dragStartPos.current.y;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          newX = origRight - newW;
        } else if (resizeType === 'top-right') {
          const dx = clientX - dragStartPos.current.x;
          const dy = dragStartPos.current.y - clientY;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          newY = origBottom - newH;
        } else if (resizeType === 'top-left') {
          const dx = dragStartPos.current.x - clientX;
          const dy = dragStartPos.current.y - clientY;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          newX = origRight - newW;
          newY = origBottom - newH;
        }

        // Edges
        else if (resizeType === 'top') {
          const dy = dragStartPos.current.y - clientY;
          newH = Math.max(initH + dy, minHeight);
          newY = origBottom - newH;
        } else if (resizeType === 'bottom') {
          const dy = clientY - dragStartPos.current.y;
          newH = Math.max(initH + dy, minHeight);
        } else if (resizeType === 'left') {
          const dx = dragStartPos.current.x - clientX;
          newW = Math.max(initW + dx, minWidth);
          newX = origRight - newW;
        } else if (resizeType === 'right') {
          const dx = clientX - dragStartPos.current.x;
          newW = Math.max(initW + dx, minWidth);
        }

        // enforce max bounds
        newW = Math.min(newW, maxWidth);
        newH = Math.min(newH, maxHeight);

        windowRef.current.style.width = `${newW}px`;
        windowRef.current.style.height = `${newH}px`;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${Math.max(newY, 26)}px`;

        if (onResize) onResize(newW, newH);
      }
    };

    const handleEnd = () => {
      // if we were dragging & snapped, finish snap
      if (isDragging && snapDirection) snapToPosition();

      // always clear transition‐suppression when resizing stops
      windowRef.current?.classList.remove('no-transition');

      setIsDragging(false);
      setResizeType(null);
      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
      setSnapDirection(null);
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
  }, [isDragging, resizeType, onResize, snapDirection]);

  // --- Start drag / resize ---
  const handleDragStart = (event) => {
    if (resizeType) return;
    if (event.target.closest('.close-button')) return;
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    const container = windowRef.current.parentNode;
    const crect = container.getBoundingClientRect();
    const wrect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = {
      x: wrect.left - crect.left,
      y: wrect.top - crect.top
    };
  };

  const handleResizeStart = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    // if this is a corner, suppress CSS transitions on the window
    if (CORNER_TYPES.includes(type)) {
      windowRef.current?.classList.add('no-transition');
    }

    setResizeType(type);
    dragStartPos.current = { x: clientX, y: clientY };
    const container = windowRef.current.parentNode;
    const crect = container.getBoundingClientRect();
    const wrect = windowRef.current.getBoundingClientRect();
    resizeStartSize.current = { width: wrect.width, height: wrect.height };
    windowStartPos.current = {
      x: wrect.left - crect.left,
      y: wrect.top - crect.top
    };
  };

  // --- Attach corner & edge handlers ---
  useEffect(() => {
    const header = windowRef.current.querySelector('.window-header');
    const resizerBR = windowRef.current.querySelector('.resize-br');
    const resizerTR = windowRef.current.querySelector('.resize-tr');
    const resizerBL = windowRef.current.querySelector('.resize-bl');
    const resizerTL = windowRef.current.querySelector('.resize-tl');
    const resizerTop = windowRef.current.querySelector('.resize-top');
    const resizerBottom = windowRef.current.querySelector('.resize-bottom');
    const resizerLeft = windowRef.current.querySelector('.resize-left');
    const resizerRight = windowRef.current.querySelector('.resize-right');

    header.addEventListener('mousedown', handleDragStart);
    header.addEventListener('touchstart', handleDragStart);

    resizerBR.addEventListener('mousedown', e => handleResizeStart(e, 'bottom-right'));
    resizerBR.addEventListener('touchstart', e => handleResizeStart(e, 'bottom-right'));
    resizerTR.addEventListener('mousedown', e => handleResizeStart(e, 'top-right'));
    resizerTR.addEventListener('touchstart', e => handleResizeStart(e, 'top-right'));
    resizerBL.addEventListener('mousedown', e => handleResizeStart(e, 'bottom-left'));
    resizerBL.addEventListener('touchstart', e => handleResizeStart(e, 'bottom-left'));
    resizerTL.addEventListener('mousedown', e => handleResizeStart(e, 'top-left'));
    resizerTL.addEventListener('touchstart', e => handleResizeStart(e, 'top-left'));

    resizerTop.addEventListener('mousedown', e => handleResizeStart(e, 'top'));
    resizerTop.addEventListener('touchstart', e => handleResizeStart(e, 'top'));
    resizerBottom.addEventListener('mousedown', e => handleResizeStart(e, 'bottom'));
    resizerBottom.addEventListener('touchstart', e => handleResizeStart(e, 'bottom'));
    resizerLeft.addEventListener('mousedown', e => handleResizeStart(e, 'left'));
    resizerLeft.addEventListener('touchstart', e => handleResizeStart(e, 'left'));
    resizerRight.addEventListener('mousedown', e => handleResizeStart(e, 'right'));
    resizerRight.addEventListener('touchstart', e => handleResizeStart(e, 'right'));

    return () => {
      header.removeEventListener('mousedown', handleDragStart);
      header.removeEventListener('touchstart', handleDragStart);

      resizerBR.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom-right'));
      resizerBR.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom-right'));
      resizerTR.removeEventListener('mousedown', e => handleResizeStart(e, 'top-right'));
      resizerTR.removeEventListener('touchstart', e => handleResizeStart(e, 'top-right'));
      resizerBL.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom-left'));
      resizerBL.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom-left'));
      resizerTL.removeEventListener('mousedown', e => handleResizeStart(e, 'top-left'));
      resizerTL.removeEventListener('touchstart', e => handleResizeStart(e, 'top-left'));

      resizerTop.removeEventListener('mousedown', e => handleResizeStart(e, 'top'));
      resizerTop.removeEventListener('touchstart', e => handleResizeStart(e, 'top'));
      resizerBottom.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom'));
      resizerBottom.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom'));
      resizerLeft.removeEventListener('mousedown', e => handleResizeStart(e, 'left'));
      resizerLeft.removeEventListener('touchstart', e => handleResizeStart(e, 'left'));
      resizerRight.removeEventListener('mousedown', e => handleResizeStart(e, 'right'));
      resizerRight.removeEventListener('touchstart', e => handleResizeStart(e, 'right'));
    };
  }, []);

  return { enterFullscreen, snapToPosition };
}

export default useDraggable;
