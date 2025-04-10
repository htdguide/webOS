// useDraggable.jsx
import { useEffect, useState, useRef } from 'react';

function useDraggable(windowRef, sizeProps, onMount, onUnmount, onResize) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  // snapDirection: "top", "left", "right", or null
  const [snapDirection, setSnapDirection] = useState(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  // Store the window's initial position relative to its parent.
  const windowStartPos = useRef({ x: 50, y: 50 });
  const resizeStartSize = useRef({ width: sizeProps.width, height: sizeProps.height });
  const snapTimerRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (onMount) onMount();
    return () => {
      if (onUnmount) onUnmount();
    };
  }, [onMount, onUnmount]);

  // Helper: Show the snap preview overlay based on snapDirection.
  const showSnapPreview = () => {
    if (!previewRef.current && snapDirection) {
      const preview = document.createElement("div");
      // Set position to absolute so that it is positioned relative to the container.
      preview.style.position = "absolute";
      preview.style.zIndex = "9999";
      preview.style.pointerEvents = "none";
      preview.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
      preview.style.border = "2px solid white";
      preview.style.borderRadius = "12px";
      const topMargin = 32;
      const sideMargin = 8;
      const bottomMargin = 8;
      // Use the container’s dimensions rather than the window’s.
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
      // Transition for opacity (fade in 175ms).
      preview.style.transition = "opacity 175ms ease";
      preview.style.opacity = "0";
      container.appendChild(preview);
      previewRef.current = preview;
      requestAnimationFrame(() => {
        if (previewRef.current) {
          previewRef.current.style.opacity = "1";
        }
      });
    }
  };

  // Helper: Hide the snap preview overlay.
  const hideSnapPreview = () => {
    if (previewRef.current) {
      previewRef.current.style.opacity = "0";
      setTimeout(() => {
        if (previewRef.current && previewRef.current.parentNode) {
          previewRef.current.parentNode.removeChild(previewRef.current);
          previewRef.current = null;
        }
      }, 500);
    }
  };

  // When snapDirection changes, show or hide the preview.
  useEffect(() => {
    if (snapDirection) {
      showSnapPreview();
    } else {
      hideSnapPreview();
    }
  }, [snapDirection]);

  // Fullscreen (top) snap: almost full container with margins.
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
    if (onResize) {
      onResize(newWidth, newHeight);
    }
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  // Left half snap.
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
    if (onResize) {
      onResize(newWidth, newHeight);
    }
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  // Right half snap.
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
    if (onResize) {
      onResize(newWidth, newHeight);
    }
    setTimeout(() => {
      windowRef.current.style.transition = "";
    }, 150);
  };

  // Snap function that uses the appropriate snap action.
  const snapToPosition = () => {
    if (snapDirection === "top") {
      enterFullscreen();
    } else if (snapDirection === "left") {
      enterLeftHalf();
    } else if (snapDirection === "right") {
      enterRightHalf();
    }
  };

  // Alias for snapToPosition.
  const snapToFullscreen = snapToPosition;

  useEffect(() => {
    const handleMove = (event) => {
      if (!isDragging && !resizeType) return;
      event.preventDefault();

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      const container = windowRef.current.parentNode;
      const containerRect = container.getBoundingClientRect();

      if (isDragging) {
        // Check pointer position relative to the container's edges.
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
          if (snapTimerRef.current) {
            clearTimeout(snapTimerRef.current);
            snapTimerRef.current = null;
          }
          setSnapDirection(null);
        }
        // Update window position normally.
        // Here we work with coordinates relative to the container.
        const deltaX = clientX - dragStartPos.current.x;
        const deltaY = clientY - dragStartPos.current.y;
        const newX = windowStartPos.current.x + deltaX;
        const newY = windowStartPos.current.y + deltaY;
        // Clamp newY so it doesn't go above a minimum (e.g., 26px).
        const clampedY = Math.max(newY, 26);
        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${clampedY}px`;
      }

      if (resizeType) {
        let newWidth = resizeStartSize.current.width;
        let newHeight = resizeStartSize.current.height;
        let newX = windowStartPos.current.x;
        let newY = windowStartPos.current.y;

        if (resizeType === 'bottom-right') {
          newWidth = Math.max(resizeStartSize.current.width + (clientX - dragStartPos.current.x), 200);
          newHeight = Math.max(resizeStartSize.current.height + (clientY - dragStartPos.current.y), 200);
        }

        if (resizeType === 'top-right') {
          newWidth = Math.max(resizeStartSize.current.width + (clientX - dragStartPos.current.x), 200);
          const newCalculatedHeight = resizeStartSize.current.height - (clientY - dragStartPos.current.y);
          if (newCalculatedHeight > 200) {
            newHeight = newCalculatedHeight;
            newY = windowStartPos.current.y + (clientY - dragStartPos.current.y);
            newY = Math.max(newY, containerRect.top + 26);
          } else {
            newHeight = 200;
          }
        }

        if (resizeType === 'bottom-left') {
          const widthDiff = dragStartPos.current.x - clientX;
          newWidth = Math.max(resizeStartSize.current.width + widthDiff, 200);
          if (newWidth > 200) {
            newX = windowStartPos.current.x - widthDiff;
          }
          newHeight = Math.max(resizeStartSize.current.height + (clientY - dragStartPos.current.y), 200);
        }

        windowRef.current.style.width = `${newWidth}px`;
        windowRef.current.style.height = `${newHeight}px`;

        if (resizeType === 'top-right' && newHeight > 200) {
          windowRef.current.style.top = `${newY}px`;
        }

        if (resizeType === 'bottom-left' && newWidth > 200) {
          windowRef.current.style.left = `${newX}px`;
        }

        if (onResize) {
          onResize(newWidth, newHeight);
        }
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        if (snapDirection) {
          snapToPosition();
        }
      }
      setIsDragging(false);
      setResizeType(null);
      if (snapTimerRef.current) {
        clearTimeout(snapTimerRef.current);
        snapTimerRef.current = null;
      }
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
  }, [isDragging, resizeType, onResize, windowRef, sizeProps, snapDirection]);

  const handleDragStart = (event) => {
    if (resizeType) return;
    if (event.target.closest('.close-button')) return;
    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    // Capture the starting position relative to the parent container.
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
      resizerBR.removeEventListener('mousedown', handleResizeStart);
      resizerBR.removeEventListener('touchstart', handleResizeStart);
      resizerTR.removeEventListener('mousedown', handleResizeStart);
      resizerTR.removeEventListener('touchstart', handleResizeStart);
      resizerBL.removeEventListener('mousedown', handleResizeStart);
      resizerBL.removeEventListener('touchstart', handleResizeStart);
    };
  }, []);

  // Return the fullscreen functions so they can be invoked externally.
  return { enterFullscreen, snapToFullscreen };
}

export default useDraggable;
