import { useEffect, useState, useRef } from 'react';

function useDraggable(windowRef, initialWidth, initialHeight, onMount, onUnmount) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeType, setResizeType] = useState(null);
  
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 50, y: 50 });
  const resizeStartSize = useRef({ width: initialWidth, height: initialHeight });

  useEffect(() => {
    if (onMount) onMount();
    return () => {
      if (onUnmount) onUnmount();
    };
  }, [onMount, onUnmount]);

  useEffect(() => {
    const handleMove = (event) => {
      if (!isDragging && !resizeType) return;
      event.preventDefault(); // Prevent scrolling during resize/drag

      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      if (isDragging) {
        const newX = windowStartPos.current.x + (clientX - dragStartPos.current.x);
        const newY = windowStartPos.current.y + (clientY - dragStartPos.current.y);

        windowRef.current.style.left = `${newX}px`;
        windowRef.current.style.top = `${newY}px`;
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
          } else {
            newHeight = 200; // Keep the height at minimum
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
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setResizeType(null);
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
  }, [isDragging, resizeType]);

  const handleDragStart = (event) => {
    if (resizeType) return; // Prevent drag when resizing

    // 🔴 Ignore drag if clicking the close button
    if (event.target.closest('.close-button')) {
      return;
    }

    event.preventDefault();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    const rect = windowRef.current.getBoundingClientRect();
    windowStartPos.current = { x: rect.left, y: rect.top };
  };

  const handleResizeStart = (event, type) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent triggering drag
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    setResizeType(type);
    dragStartPos.current = { x: clientX, y: clientY };
    const rect = windowRef.current.getBoundingClientRect();
    resizeStartSize.current = { width: rect.width, height: rect.height };
    windowStartPos.current = { x: rect.left, y: rect.top };
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
}

export default useDraggable;
