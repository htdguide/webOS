// src/webOS/interactions/useDraggable/useDraggable.jsx

/**
 * React hook to make a window draggable, resizable, and snap-to-edge.
 * On narrow vertical screens (<600px wide):
 *  • Left-edge snaps → height = (screenHeight/2 − 113px) + 40px
 *  • Right-edge snaps → same size, but top = 32px + (half-height + 8px) + 40px
 */

// ================================
// Area 1: Imports & Constants
// ================================
// 1.1: React hooks
import { useEffect, useState, useRef } from 'react';
// 1.2: Corner-resize handle types
const CORNER_TYPES = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];

function useDraggable(windowRef, sizeProps, onMount, onUnmount, onResize) {
  // ================================
  // Area 2: State & Refs
  // ================================
  // 2.1: Flags for dragging & resizing
  const [isDragging, setIsDragging] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [snapDirection, setSnapDirection] = useState(null);

  // 2.2: Track initial pointer & window metrics
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: sizeProps.width, height: sizeProps.height });
  const snapTimerRef = useRef(null);

  // 2.3: Overlay element for snap preview
  const previewRef = useRef(null);

  // 2.4: Normalize min/max dimensions
  const { minWidth: pMinW, minHeight: pMinH, maxWidth: pMaxW, maxHeight: pMaxH } = sizeProps;
  const minWidth = typeof pMinW === 'number' ? pMinW : parseInt(pMinW, 10) || 0;
  const minHeight = typeof pMinH === 'number' ? pMinH : parseInt(pMinH, 10) || 0;
  const maxWidth = typeof pMaxW === 'number' ? pMaxW : parseInt(pMaxW, 10) || Infinity;
  const maxHeight = typeof pMaxH === 'number' ? pMaxH : parseInt(pMaxH, 10) || Infinity;

  // ================================
  // Area 3: Mount & Unmount
  // ================================
  // 3.1: Callbacks on mount/unmount
  useEffect(() => {
    if (onMount) onMount();
    return () => { if (onUnmount) onUnmount(); };
  }, [onMount, onUnmount]);

  // ================================
  // Area 4: Snap Preview Overlay
  // ================================
  // 4.1: Create semi-transparent overlay at snap target
  const showSnapPreview = () => {
    if (!previewRef.current && snapDirection) {
      const preview = document.createElement('div');
      preview.style.position = 'absolute';
      preview.style.zIndex = '9999';
      preview.style.pointerEvents = 'none';
      preview.style.backgroundColor = 'rgba(255,255,255,0.2)';
      preview.style.border = '2px solid white';
      preview.style.borderRadius = '12px';

      const topM = 32, sideM = 8, bottomM = 84, extraH = 0;
      const container = windowRef.current.parentNode;
      const rect = container.getBoundingClientRect();
      const isNarrowVertical = window.innerHeight > window.innerWidth && window.innerWidth < 600;

      if (snapDirection === 'top') {
        // full-screen preview
        preview.style.left = `${sideM}px`;
        preview.style.top = `${topM}px`;
        preview.style.width = `${rect.width - sideM * 2}px`;
        preview.style.height = `${rect.height - topM - bottomM}px`;
      } else if (snapDirection === 'left') {
        if (isNarrowVertical) {
          // custom left-edge preview
          const width = rect.width - sideM * 2;
          const height = window.innerHeight / 2 - 113 + extraH;
          preview.style.left = `${sideM}px`;
          preview.style.top = `${topM}px`;
          preview.style.width = `${width}px`;
          preview.style.height = `${height}px`;
        } else {
          // standard left-half preview (matches top snap height)
          preview.style.left = `${sideM}px`;
          preview.style.top = `${topM}px`;
          preview.style.width = `${(rect.width - sideM * 2) / 2}px`;
          preview.style.height = `${rect.height - topM - bottomM}px`;
        }
      } else if (snapDirection === 'right') {
        if (isNarrowVertical) {
          // custom right-edge preview
          const width = rect.width - sideM * 2;
          const height = window.innerHeight / 2 - 113 + extraH;
          const topPos = topM + height + 8 + extraH;
          preview.style.left = `${sideM}px`;
          preview.style.top = `${topPos}px`;
          preview.style.width = `${width}px`;
          preview.style.height = `${height}px`;
        } else {
          // standard right-half preview (matches top snap height)
          preview.style.left = `${sideM + (rect.width - sideM * 2) / 2}px`;
          preview.style.top = `${topM}px`;
          preview.style.width = `${(rect.width - sideM * 2) / 2}px`;
          preview.style.height = `${rect.height - topM - bottomM}px`;
        }
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
  // 4.2: Fade out & remove preview
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
  // 4.3: Watch for snapDirection changes
  useEffect(() => {
    if (snapDirection) showSnapPreview();
    else hideSnapPreview();
  }, [snapDirection]);

  // ================================
  // Area 5: Snap Actions
  // ================================
  // 5.1: Fullscreen (top-edge) snap
  // Responsibilities: expand window to full width and height (minus margins)
  const enterFullscreen = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition =
      'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 80;
    windowRef.current.style.left = `${side}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${rect.width - side * 2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    onResize?.(rect.width - side * 2, rect.height - top - bottom);
    setTimeout(() => (windowRef.current.style.transition = ''), 150);
  };
  // 5.2: Left-half snap
  // Responsibilities: snap window to left half, matching fullscreen height
  const enterLeftHalf = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition =
      'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 80; // changed to 80 for full-height match
    windowRef.current.style.left = `${side}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${(rect.width - side * 2) / 2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    onResize?.((rect.width - side * 2) / 2, rect.height - top - bottom);
    setTimeout(() => (windowRef.current.style.transition = ''), 150);
  };
  // 5.3: Right-half snap
  // Responsibilities: snap window to right half, matching fullscreen height
  const enterRightHalf = () => {
    const container = windowRef.current.parentNode;
    const rect = container.getBoundingClientRect();
    windowRef.current.style.transition =
      'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
    const side = 8, top = 32, bottom = 80; // changed to 80 for full-height match
    windowRef.current.style.left = `${side + (rect.width - side * 2) / 2}px`;
    windowRef.current.style.top = `${top}px`;
    windowRef.current.style.width = `${(rect.width - side * 2) / 2}px`;
    windowRef.current.style.height = `${rect.height - top - bottom}px`;
    onResize?.((rect.width - side * 2) / 2, rect.height - top - bottom);
    setTimeout(() => (windowRef.current.style.transition = ''), 150);
  };
  // 5.4: Route snap based on direction (with extra height & shift)
  const snapToPosition = () => {
    const extraH = 0;
    const topBase = 32, shiftY = 8 + extraH;
    const nv = window.innerHeight > window.innerWidth && window.innerWidth < 600;
    if (snapDirection === 'top') {
      enterFullscreen();
    } else if (snapDirection === 'left') {
      if (nv) {
        // custom narrow-vertical left-edge snap
        const container = windowRef.current.parentNode;
        const rect = container.getBoundingClientRect();
        const side = 8;
        const width = rect.width - side * 2;
        const height = window.innerHeight / 2 - 113 + extraH;
        windowRef.current.style.transition =
          'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
        windowRef.current.style.left = `${side}px`;
        windowRef.current.style.top = `${topBase}px`;
        windowRef.current.style.width = `${width}px`;
        windowRef.current.style.height = `${height}px`;
        onResize?.(width, height);
        setTimeout(() => (windowRef.current.style.transition = ''), 150);
      } else {
        enterLeftHalf();
      }
    } else if (snapDirection === 'right') {
      if (nv) {
        // custom narrow-vertical right-edge snap
        const container = windowRef.current.parentNode;
        const rect = container.getBoundingClientRect();
        const side = 8;
        const width = rect.width - side * 2;
        const height = window.innerHeight / 2 - 113 + extraH;
        const topPos = topBase + height + shiftY;
        windowRef.current.style.transition =
          'left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease';
        windowRef.current.style.left = `${side}px`;
        windowRef.current.style.top = `${topPos}px`;
        windowRef.current.style.width = `${width}px`;
        windowRef.current.style.height = `${height}px`;
        onResize?.(width, height);
        setTimeout(() => (windowRef.current.style.transition = ''), 150);
      } else {
        enterRightHalf();
      }
    }
  };

  // ================================
  // Area 6: Move & Resize Handler
  // ================================
  // 6.1: Track pointer and apply drag or resize updates
  useEffect(() => {
    const handleMove = (event) => {
      if (!isDragging && !resizeType) return;
      event.preventDefault();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      // — Dragging logic & snap pre-flight —
      if (isDragging) {
        const container = windowRef.current.parentNode;
        const rect = container.getBoundingClientRect();
        const edge = 26;
        if (clientX < rect.left + edge) {
          if (!snapTimerRef.current)
            snapTimerRef.current = setTimeout(() => setSnapDirection('left'), 250);
        } else if (clientX > rect.right - edge) {
          if (!snapTimerRef.current)
            snapTimerRef.current = setTimeout(() => setSnapDirection('right'), 250);
        } else if (clientY < rect.top + edge) {
          if (!snapTimerRef.current)
            snapTimerRef.current = setTimeout(() => setSnapDirection('top'), 250);
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

      // — Resizing logic (corners & edges) —
      if (resizeType) {
        const initW = resizeStartSize.current.width;
        const initH = resizeStartSize.current.height;
        const origR = windowStartPos.current.x + initW;
        const origB = windowStartPos.current.y + initH;
        let newW = initW, newH = initH, newX = windowStartPos.current.x, newY = windowStartPos.current.y;

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
          newX = origR - newW;
        } else if (resizeType === 'top-right') {
          const dx = clientX - dragStartPos.current.x;
          const dy = dragStartPos.current.y - clientY;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          newY = origB - newH;
        } else if (resizeType === 'top-left') {
          const dx = dragStartPos.current.x - clientX;
          const dy = dragStartPos.current.y - clientY;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          newX = origR - newW;
          newY = origB - newH;
        } else if (resizeType === 'top') {
          const dy = dragStartPos.current.y - clientY;
          newH = Math.max(initH + dy, minHeight);
          newY = origB - newH;
        } else if (resizeType === 'bottom') {
          const dy = clientY - dragStartPos.current.y;
          newH = Math.max(initH + dy, minHeight);
        } else if (resizeType === 'left') {
          const dx = dragStartPos.current.x - clientX;
          newW = Math.max(initW + dx, minWidth);
          newX = origR - newW;
        } else if (resizeType === 'right') {
          const dx = clientX - dragStartPos.current.x;
          newW = Math.max(initW + dx, minWidth);
        }

        newW = Math.min(newW, maxWidth);
        newH = Math.min(newH, maxHeight);

        windowRef.current.style.width = `${newW}px`;
        windowRef.current.style.height = `${newH}px`;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${Math.max(newY, 26)}px`;
        onResize?.(newW, newH);
      }
    };

    // 6.2: End drag/resize and apply final snap if needed
    const handleEnd = () => {
      if (isDragging && snapDirection) snapToPosition();
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

  // ================================
  // Area 7: Drag & Resize Start
  // ================================
  // 7.1: Initialize dragging
  const handleDragStart = (event) => {
    if (resizeType) return;
    if (event.target.closest('.close-button')) return;
    event.preventDefault();
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;
    setIsDragging(true);
    dragStartPos.current = { x, y };
    const crect = windowRef.current.parentNode.getBoundingClientRect();
    const wrect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = { x: wrect.left - crect.left, y: wrect.top - crect.top };
  };
  // 7.2: Initialize resizing
  const handleResizeStart = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;
    if (CORNER_TYPES.includes(type)) windowRef.current?.classList.add('no-transition');
    setResizeType(type);
    dragStartPos.current = { x, y };
    const crect = windowRef.current.parentNode.getBoundingClientRect();
    const wrect = windowRef.current.getBoundingClientRect();
    resizeStartSize.current = { width: wrect.width, height: wrect.height };
    windowStartPos.current = { x: wrect.left - crect.left, y: wrect.top - crect.top };
  };

  // ================================
  // Area 8: Attach Event Handlers
  // ================================
  // 8.1: Bind header and resize handles
  useEffect(() => {
    const header = windowRef.current.querySelector('.window-header');
    const resBR = windowRef.current.querySelector('.resize-br');
    const resTR = windowRef.current.querySelector('.resize-tr');
    const resBL = windowRef.current.querySelector('.resize-bl');
    const resTL = windowRef.current.querySelector('.resize-tl');
    const resTop = windowRef.current.querySelector('.resize-top');
    const resBot = windowRef.current.querySelector('.resize-bottom');
    const resLeft = windowRef.current.querySelector('.resize-left');
    const resRight = windowRef.current.querySelector('.resize-right');

    header.addEventListener('mousedown', handleDragStart);
    header.addEventListener('touchstart', handleDragStart);

    resBR.addEventListener('mousedown', e => handleResizeStart(e, 'bottom-right'));
    resBR.addEventListener('touchstart', e => handleResizeStart(e, 'bottom-right'));
    resTR.addEventListener('mousedown', e => handleResizeStart(e, 'top-right'));
    resTR.addEventListener('touchstart', e => handleResizeStart(e, 'top-right'));
    resBL.addEventListener('mousedown', e => handleResizeStart(e, 'bottom-left'));
    resBL.addEventListener('touchstart', e => handleResizeStart(e, 'bottom-left'));
    resTL.addEventListener('mousedown', e => handleResizeStart(e, 'top-left'));
    resTL.addEventListener('touchstart', e => handleResizeStart(e, 'top-left'));

    resTop.addEventListener('mousedown', e => handleResizeStart(e, 'top'));
    resTop.addEventListener('touchstart', e => handleResizeStart(e, 'top'));
    resBot.addEventListener('mousedown', e => handleResizeStart(e, 'bottom'));
    resBot.addEventListener('touchstart', e => handleResizeStart(e, 'bottom'));
    resLeft.addEventListener('mousedown', e => handleResizeStart(e, 'left'));
    resLeft.addEventListener('touchstart', e => handleResizeStart(e, 'left'));
    resRight.addEventListener('mousedown', e => handleResizeStart(e, 'right'));
    resRight.addEventListener('touchstart', e => handleResizeStart(e, 'right'));

    return () => {
      header.removeEventListener('mousedown', handleDragStart);
      header.removeEventListener('touchstart', handleDragStart);
      resBR.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom-right'));
      resBR.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom-right'));
      resTR.removeEventListener('mousedown', e => handleResizeStart(e, 'top-right'));
      resTR.removeEventListener('touchstart', e => handleResizeStart(e, 'top-right'));
      resBL.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom-left'));
      resBL.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom-left'));
      resTL.removeEventListener('mousedown', e => handleResizeStart(e, 'top-left'));
      resTL.removeEventListener('touchstart', e => handleResizeStart(e, 'top-left'));
      resTop.removeEventListener('mousedown', e => handleResizeStart(e, 'top'));
      resTop.removeEventListener('touchstart', e => handleResizeStart(e, 'top'));
      resBot.removeEventListener('mousedown', e => handleResizeStart(e, 'bottom'));
      resBot.removeEventListener('touchstart', e => handleResizeStart(e, 'bottom'));
      resLeft.removeEventListener('mousedown', e => handleResizeStart(e, 'left'));
      resLeft.removeEventListener('touchstart', e => handleResizeStart(e, 'left'));
      resRight.removeEventListener('mousedown', e => handleResizeStart(e, 'right'));
      resRight.removeEventListener('touchstart', e => handleResizeStart(e, 'right'));
    };
  }, []);

  // ================================
  // Area 9: Return API
  // ================================
  // 9.1: Expose methods for external control
  return { enterFullscreen, snapToPosition };
}

export default useDraggable;
