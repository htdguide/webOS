// src/interactions/IconInteractions/IconInteractions.jsx

import {
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  GRID_GAP,
  HOLD_THRESHOLD,
  DOUBLE_TAP_DELAY,
  GRID_SIZE
} from '../../configs/DesktopIconConfig/DesktopIconConfig.jsx';

/**
 * If GRID_SIZE is, say, 80 and GRID_GAP is 20,
 * the effective "snap step" will be 100.
 */
function getSnapSize() {
  return GRID_SIZE + GRID_GAP;
}

/**
 * Initiates a timer that, after HOLD_THRESHOLD ms, begins dragging.
 */
export const startHold = (
  startX,
  startY,
  iconRef,
  setHoldTimer,
  startDraggingCallback
) => {
  const rect = iconRef.current.getBoundingClientRect();
  const offsetX = startX - rect.left;
  const offsetY = startY - rect.top;

  const timer = setTimeout(() => {
    startDraggingCallback(startX, startY, offsetX, offsetY);
  }, HOLD_THRESHOLD);

  setHoldTimer(timer);
};

/**
 * Begins the dragging process.
 */
export const startDragging = (
  startX,
  startY,
  offsetX,
  offsetY,
  iconRef,
  setPosition,
  setIsDragging
) => {
  setIsDragging(true);

  // Remove transitions so it moves freely
  iconRef.current.style.transition = 'none';

  const handleMove = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    // Get the container (the desktop div) and its dimensions.
    const container = iconRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();

    // Compute pointer position relative to the container.
    const relativeX = clientX - containerRect.left;
    const relativeY = clientY - containerRect.top;

    // Calculate max positions (respecting margins) within the container.
    const maxX = containerRect.width - RIGHT_MARGIN - GRID_SIZE;
    const maxY = containerRect.height - BOTTOM_MARGIN - GRID_SIZE;

    // Clamp new positions based on left/top margins and the calculated max.
    const newX = Math.max(LEFT_MARGIN, Math.min(maxX, relativeX - offsetX));
    const newY = Math.max(TOP_MARGIN, Math.min(maxY, relativeY - offsetY));

    // Move the icon freely (no snapping yet)
    iconRef.current.style.left = `${newX}px`;
    iconRef.current.style.top = `${newY}px`;
  };

  const handleEnd = () => {
    // Clean up listeners
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);

    // Recompute positions from the DOM
    const rect = iconRef.current.getBoundingClientRect();
    const container = iconRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;
    const snapSize = getSnapSize();

    // Compute the “ideal” snapped coordinates
    const rawSnappedX =
      LEFT_MARGIN +
      Math.round((relativeLeft - LEFT_MARGIN) / snapSize) * snapSize;
    const rawSnappedY =
      TOP_MARGIN +
      Math.round((relativeTop - TOP_MARGIN) / snapSize) * snapSize;

    // Recompute the same max bounds
    const maxX = containerRect.width - RIGHT_MARGIN - GRID_SIZE;
    const maxY = containerRect.height - BOTTOM_MARGIN - GRID_SIZE;

    // **NEW**: clamp snapped values so they never exceed the container limits
    const snappedX = Math.max(LEFT_MARGIN, Math.min(maxX, rawSnappedX));
    const snappedY = Math.max(TOP_MARGIN, Math.min(maxY, rawSnappedY));

    // Short transition so the icon “flies” to its snapped spot
    iconRef.current.style.transition = 'left 0.2s ease, top 0.2s ease';
    // Force a reflow so the transition actually happens
    // (reading offsetWidth does that)
    // eslint-disable-next-line no-unused-expressions
    iconRef.current.offsetWidth;

    // Move to the clamped/snap position
    iconRef.current.style.left = `${snappedX}px`;
    iconRef.current.style.top = `${snappedY}px`;

    // If already basically there, finalize state immediately
    const dx = Math.abs(relativeLeft - snappedX);
    const dy = Math.abs(relativeTop - snappedY);
    if (dx < 1 && dy < 1) {
      setPosition({ x: snappedX, y: snappedY });
      setIsDragging(false);
      iconRef.current.style.transition = 'none';
    } else {
      // Otherwise, wait for the transition to end, then commit
      const onTransitionEnd = () => {
        iconRef.current.removeEventListener('transitionend', onTransitionEnd);
        setPosition({ x: snappedX, y: snappedY });
        setIsDragging(false);
        iconRef.current.style.transition = 'none';
      };
      iconRef.current.addEventListener('transitionend', onTransitionEnd);
    }
  };

  // Attach movement and end-of-drag listeners.
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
};

/**
 * Cancels the hold timer, preventing drag from initiating
 * if threshold wasn't reached.
 */
export const cancelHold = (holdTimer, setHoldTimer) => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    setHoldTimer(null);
  }
};

/**
 * Handles single vs. double taps (opens on double click, etc.).
 */
export const handleTap = (lastTap, setLastTap, onDoubleClick, onClick) => {
  const now = Date.now();
  if (now - lastTap < DOUBLE_TAP_DELAY) {
    onDoubleClick();
  } else {
    onClick();
  }
  setLastTap(now);
};
