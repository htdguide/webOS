// src/interactions/IconInteractions/IconInteractions.jsx

/**
 * Initiates a timer that, after holdThreshold ms, begins dragging.
 * startDraggingCallback receives (startX, startY, offsetX, offsetY).
 */
export const startHold = (
  startX,
  startY,
  iconRef,
  setHoldTimer,
  startDraggingCallback,
  holdThreshold
) => {
  const rect = iconRef.current.getBoundingClientRect();
  const offsetX = startX - rect.left;
  const offsetY = startY - rect.top;

  const timer = setTimeout(() => {
    startDraggingCallback(startX, startY, offsetX, offsetY);
  }, holdThreshold);

  setHoldTimer(timer);
};

/**
 * Begins the dragging process. `config` must include:
 * { TOP_MARGIN, LEFT_MARGIN, RIGHT_MARGIN, BOTTOM_MARGIN, gridGap, gridSize }
 */
export const startDragging = (
  startX,
  startY,
  offsetX,
  offsetY,
  iconRef,
  setPosition,
  setIsDragging,
  config
) => {
  setIsDragging(true);
  iconRef.current.style.transition = 'none';

  const {
    TOP_MARGIN,
    LEFT_MARGIN,
    RIGHT_MARGIN,
    BOTTOM_MARGIN,
    gridGap,
    gridSize
  } = config;

  const snapSize = gridSize + gridGap;

  const handleMove = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const container = iconRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();

    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    const maxX = containerRect.width - RIGHT_MARGIN - gridSize;
    const maxY = containerRect.height - BOTTOM_MARGIN - gridSize;

    const newX = Math.max(LEFT_MARGIN, Math.min(maxX, relativeX - offsetX));
    const newY = Math.max(TOP_MARGIN, Math.min(maxY, relativeY - offsetY));

    iconRef.current.style.left = `${newX}px`;
    iconRef.current.style.top = `${newY}px`;
  };

  const handleEnd = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);

    const rect = iconRef.current.getBoundingClientRect();
    const container = iconRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;

    const rawSnappedX =
      LEFT_MARGIN +
      Math.round((relativeLeft - LEFT_MARGIN) / snapSize) * snapSize;
    const rawSnappedY =
      TOP_MARGIN +
      Math.round((relativeTop - TOP_MARGIN) / snapSize) * snapSize;

    const maxX = containerRect.width - RIGHT_MARGIN - gridSize;
    const maxY = containerRect.height - BOTTOM_MARGIN - gridSize;

    const snappedX = Math.max(LEFT_MARGIN, Math.min(maxX, rawSnappedX));
    const snappedY = Math.max(TOP_MARGIN, Math.min(maxY, rawSnappedY));

    iconRef.current.style.transition = 'left 0.2s ease, top 0.2s ease';
    /* force reflow */ void iconRef.current.offsetWidth;

    iconRef.current.style.left = `${snappedX}px`;
    iconRef.current.style.top = `${snappedY}px`;

    const dx = Math.abs(relativeLeft - snappedX);
    const dy = Math.abs(relativeTop - snappedY);
    if (dx < 1 && dy < 1) {
      setPosition({ x: snappedX, y: snappedY });
      setIsDragging(false);
      iconRef.current.style.transition = 'none';
    } else {
      const onTransitionEnd = () => {
        iconRef.current.removeEventListener('transitionend', onTransitionEnd);
        setPosition({ x: snappedX, y: snappedY });
        setIsDragging(false);
        iconRef.current.style.transition = 'none';
      };
      iconRef.current.addEventListener('transitionend', onTransitionEnd);
    }
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
};

/**
 * Cancels the hold timer, preventing drag from initiating.
 */
export const cancelHold = (holdTimer, setHoldTimer) => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    setHoldTimer(null);
  }
};

/**
 * Handles single vs. double taps. Pass in delay.
 */
export const handleTap = (
  lastTap,
  setLastTap,
  onDoubleClick,
  onClick,
  doubleTapDelay
) => {
  const now = Date.now();
  if (now - lastTap < doubleTapDelay) {
    onDoubleClick();
  } else {
    onClick();
  }
  setLastTap(now);
};
