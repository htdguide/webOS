// IconInteractions.jsx
import {
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  GRID_GAP,
  HOLD_THRESHOLD,
  DOUBLE_TAP_DELAY,
  GRID_SIZE, // <--- Import from DesktopIconConfig now
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
  startDragging
) => {
  const rect = iconRef.current.getBoundingClientRect();
  const offsetX = startX - rect.left;
  const offsetY = startY - rect.top;

  const timer = setTimeout(() => {
    startDragging(startX, startY, offsetX, offsetY);
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
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);

    // Get the current icon rect and container rect to compute relative positions.
    const rect = iconRef.current.getBoundingClientRect();
    const container = iconRef.current.parentNode;
    const containerRect = container.getBoundingClientRect();
    const relativeLeft = rect.left - containerRect.left;
    const relativeTop = rect.top - containerRect.top;
    const snapSize = getSnapSize();

    const snappedX =
      LEFT_MARGIN +
      Math.round((relativeLeft - LEFT_MARGIN) / snapSize) * snapSize;
    const snappedY =
      TOP_MARGIN +
      Math.round((relativeTop - TOP_MARGIN) / snapSize) * snapSize;

    // Add a short transition so the icon "flies" to the snapped position.
    iconRef.current.style.transition = 'left 0.2s ease, top 0.2s ease';
    // Force reflow.
    iconRef.current.offsetWidth;

    // Set new (snapped) positions.
    iconRef.current.style.left = `${snappedX}px`;
    iconRef.current.style.top = `${snappedY}px`;

    // If the icon is already at the snapped position,
    // the transition event may not fire so we finalize immediately.
    if (
      Math.abs(relativeLeft - snappedX) < 1 &&
      Math.abs(relativeTop - snappedY) < 1
    ) {
      setPosition({ x: snappedX, y: snappedY });
      setIsDragging(false);
      iconRef.current.style.transition = 'none';
    } else {
      // Once the transition finishes, finalize position in state.
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
