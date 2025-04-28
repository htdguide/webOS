// useDraggable.jsx
import { useEffect, useState, useRef } from 'react';

function useDraggable(windowRef, sizeProps, onMount, onUnmount, onResize) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  const [snapDirection, setSnapDirection] = useState(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: sizeProps.width, height: sizeProps.height });
  const snapTimerRef = useRef(null);
  const previewRef = useRef(null);

  // Parse and normalize min/max sizes from props
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
    return () => {
      if (onUnmount) onUnmount();
    };
  }, [onMount, onUnmount]);

  // Snap-preview helpers
  const showSnapPreview = () => {
    if (!previewRef.current && snapDirection) {
      const preview = document.createElement("div");
      preview.style.position = "absolute";
      preview.style.zIndex = "9999";
      preview.style.pointerEvents = "none";
      preview.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      preview.style.border = "2px solid white";
      preview.style.borderRadius = "12px";
      const topMargin = 32;
      const sideMargin = 8;
      const bottomMargin = 8;
      const container = windowRef.current.parentNode;
      const containerRect = container.getBoundingClientRect();
      if (snapDirection === "top") {
        preview.style.left = `${sideMargin}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${containerRect.width - sideMargin * 2}px`;
        preview.style.height = `${containerRect.height - topMargin - bottomMargin}px`;
      } else if (snapDirection === "left") {
        preview.style.left = `${sideMargin}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${(containerRect.width - sideMargin * 2) / 2}px`;
        preview.style.height = `${containerRect.height - topMargin - bottomMargin}px`;
      } else if (snapDirection === "right") {
        preview.style.left = `${sideMargin + (containerRect.width - sideMargin * 2) / 2}px`;
        preview.style.top = `${topMargin}px`;
        preview.style.width = `${(containerRect.width - sideMargin * 2) / 2}px`;
        preview.style.height = `${containerRect.height - topMargin - bottomMargin}px`;
      }
      preview.style.transition = "opacity 175ms ease";
      preview.style.opacity = "0";
      container.appendChild(preview);
      previewRef.current = preview;
      requestAnimationFrame(() => {
        if (previewRef.current) previewRef.current.style.opacity = "1";
      });
    }
  };

  const hideSnapPreview = () => {
    if (previewRef.current) {
      previewRef.current.style.opacity = "0";
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

  // Snap actions
  const enterFullscreen = () => {
    const container = windowRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    windowRef.current.style.transition = "left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease";
    const sideMargin = 8;
    const topMargin = 32;
    const bottomMargin = 8;
    const newLeft = sideMargin;
    const newTop = topMargin;
    const newWidth = containerRect.width - sideMargin * 2;
    const newHeight = containerRect.height - topMargin - bottomMargin;
    windowRef.current.style.left = `${newLeft}px`;
    windowRef.current.style.top = `${newTop}px`;
    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
    if (onResize) onResize(newWidth, newHeight);
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  const enterLeftHalf = () => {
    const container = windowRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    windowRef.current.style.transition = "left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease";
    const sideMargin = 8;
    const topMargin = 32;
    const bottomMargin = 8;
    const newLeft = sideMargin;
    const newTop = topMargin;
    const newWidth = (containerRect.width - sideMargin * 2) / 2;
    const newHeight = containerRect.height - topMargin - bottomMargin;
    windowRef.current.style.left = `${newLeft}px`;
    windowRef.current.style.top = `${newTop}px`;
    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
    if (onResize) onResize(newWidth, newHeight);
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  const enterRightHalf = () => {
    const container = windowRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    windowRef.current.style.transition = "left 150ms ease, top 150ms ease, width 150ms ease, height 150ms ease";
    const sideMargin = 8;
    const topMargin = 32;
    const bottomMargin = 8;
    const newLeft = sideMargin + (containerRect.width - sideMargin * 2) / 2;
    const newTop = topMargin;
    const newWidth = (containerRect.width - sideMargin * 2) / 2;
    const newHeight = containerRect.height - topMargin - bottomMargin;
    windowRef.current.style.left = `${newLeft}px`;
    windowRef.current.style.top = `${newTop}px`;
    windowRef.current.style.width = `${newWidth}px`;
    windowRef.current.style.height = `${newHeight}px`;
    if (onResize) onResize(newWidth, newHeight);
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  const snapToPosition = () => {
    if (snapDirection === "top") {
      enterFullscreen();
    } else if (snapDirection === "left") {
      enterLeftHalf();
    } else if (snapDirection === "right") {
      enterRightHalf();
    }
  };

  // Move / Resize handler
  useEffect(() => {
    const handleMove = (event) => {
      if (!isDragging && !resizeType) return;
      event.preventDefault();

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      // Dragging
      if (isDragging) {
        const container = windowRef.current.parentNode;
        const containerRect = container.getBoundingClientRect();
        const leftEdgeThreshold = 26;
        const rightEdgeThreshold = 26;
        const topEdgeThreshold = 26;

        if (clientX < containerRect.left + leftEdgeThreshold) {
          if (!snapTimerRef.current) {
            snapTimerRef.current = setTimeout(() => {
              setSnapDirection("left");
            }, 250);
          }
        } else if (clientX > containerRect.right - rightEdgeThreshold) {
          if (!snapTimerRef.current) {
            snapTimerRef.current = setTimeout(() => {
              setSnapDirection("right");
            }, 250);
          }
        } else if (clientY < containerRect.top + topEdgeThreshold) {
          if (!snapTimerRef.current) {
            snapTimerRef.current = setTimeout(() => {
              setSnapDirection("top");
            }, 250);
          }
        } else {
          clearTimeout(snapTimerRef.current);
          snapTimerRef.current = null;
          setSnapDirection(null);
        }

        const dx = clientX - dragStartPos.current.x;
        const dy = clientY - dragStartPos.current.y;
        const newX = windowStartPos.current.x + dx;
        const newY = Math.max(windowStartPos.current.y + dy, 26);

        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
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
          // Anchor top-right
          newX = origRight - newW;
        } else if (resizeType === 'top-right') {
          const dx = clientX - dragStartPos.current.x;
          const dy = dragStartPos.current.y - clientY;
          newW = Math.max(initW + dx, minWidth);
          newH = Math.max(initH + dy, minHeight);
          // Anchor bottom-left
          newY = origBottom - newH;
        }

        // Enforce max sizes
        newW = Math.min(newW, maxWidth);
        newH = Math.min(newH, maxHeight);

        // Apply styles
        windowRef.current.style.width = `${newW}px`;
        windowRef.current.style.height = `${newH}px`;
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${Math.max(newY, 26)}px`;

        if (onResize) {
          onResize(newW, newH);
        }
      }
    };

    const handleEnd = () => {
      if (isDragging && snapDirection) {
        snapToPosition();
      }
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

  // Start dragging or resizing
  const handleDragStart = (event) => {
    if (resizeType) return;
    if (event.target.closest('.close-button')) return;
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    const container = windowRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    const rect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
    };
  };

  const handleResizeStart = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    setResizeType(type);
    dragStartPos.current = { x: clientX, y: clientY };
    const container = windowRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    const rect = windowRef.current.getBoundingClientRect();
    resizeStartSize.current = { width: rect.width, height: rect.height };
    windowStartPos.current = {
      x: rect.left - containerRect.left,
      y: rect.top - containerRect.top,
    };
  };

  // Attach listeners to header and resizers
  useEffect(() => {
    const header = windowRef.current.querySelector('.window-header');
    const resizerBR = windowRef.current.querySelector('.resize-br');
    const resizerTR = windowRef.current.querySelector('.resize-tr');
    const resizerBL = windowRef.current.querySelector('.resize-bl');

    header.addEventListener('mousedown', handleDragStart);
    header.addEventListener('touchstart', handleDragStart);

    resizerBR.addEventListener('mousedown', (e) => handleResizeStart(e, 'bottom-right'));
    resizerBR.addEventListener('touchstart', (e) => handleResizeStart(e, 'bottom-right'));

    resizerTR.addEventListener('mousedown', (e) => handleResizeStart(e, 'top-right'));
    resizerTR.addEventListener('touchstart', (e) => handleResizeStart(e, 'top-right'));

    resizerBL.addEventListener('mousedown', (e) => handleResizeStart(e, 'bottom-left'));
    resizerBL.addEventListener('touchstart', (e) => handleResizeStart(e, 'bottom-left'));

    return () => {
      header.removeEventListener('mousedown', handleDragStart);
      header.removeEventListener('touchstart', handleDragStart);

      resizerBR.removeEventListener('mousedown', (e) => handleResizeStart(e, 'bottom-right'));
      resizerBR.removeEventListener('touchstart', (e) => handleResizeStart(e, 'bottom-right'));

      resizerTR.removeEventListener('mousedown', (e) => handleResizeStart(e, 'top-right'));
      resizerTR.removeEventListener('touchstart', (e) => handleResizeStart(e, 'top-right'));

      resizerBL.removeEventListener('mousedown', (e) => handleResizeStart(e, 'bottom-left'));
      resizerBL.removeEventListener('touchstart', (e) => handleResizeStart(e, 'bottom-left'));
    };
  }, []);

  // Return snap functions for external use
  return { enterFullscreen, snapToPosition };
}

export default useDraggable;
