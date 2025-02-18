// DesktopIconInteractions.jsx

import {
  TOP_MARGIN,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  BOTTOM_MARGIN,
  GRID_GAP,
  HOLD_THRESHOLD,
  DOUBLE_TAP_DELAY,
} from '../configs/DesktopIconConfig.jsx';

/**
 * Dynamically calculate grid size for the usable screen area:
 * (window width - LEFT_MARGIN - RIGHT_MARGIN) x
 * (window height - TOP_MARGIN - BOTTOM_MARGIN).
 */
function calculateGridSize() {
  const usableWidth = window.innerWidth - LEFT_MARGIN - RIGHT_MARGIN;
  const usableHeight = window.innerHeight - TOP_MARGIN - BOTTOM_MARGIN;
  const minDimension = Math.min(usableWidth, usableHeight);

  // For example, ~10 cells along the smaller dimension:
  const approximateCells = 10;
  const gridSize = Math.floor(minDimension / approximateCells);

  // Fallback if the screen is extremely small
  return gridSize > 0 ? gridSize : 40;
}

export const GRID_SIZE = calculateGridSize();

/**
 * We'll define a helper to get the actual snap step.
 * If GRID_SIZE is 60 and GRID_GAP is 10, the snap step is 70.
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
 * The icon can be placed anywhere while dragging (not snapping yet).
 * On release, we animate a "fly" to the nearest grid position.
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

  // Remove any previous transitions so it moves freely during drag
  iconRef.current.style.transition = 'none';

  const handleMove = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    // Calculate max positions (respecting margins)
    const maxX = window.innerWidth - RIGHT_MARGIN - GRID_SIZE;
    const maxY = window.innerHeight - BOTTOM_MARGIN - GRID_SIZE;

    // Clamp new positions by left/top margins and the calculated max
    const newX = Math.max(LEFT_MARGIN, Math.min(maxX, clientX - offsetX));
    const newY = Math.max(TOP_MARGIN, Math.min(maxY, clientY - offsetY));

    // Move the icon freely without snapping
    iconRef.current.style.left = `${newX}px`;
    iconRef.current.style.top = `${newY}px`;
  };

  const handleEnd = () => {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);

    // Calculate the final snapped position
    const rect = iconRef.current.getBoundingClientRect();
    const snapSize = getSnapSize();

    // Snap the X coordinate
    const snappedX =
      LEFT_MARGIN +
      Math.round((rect.left - LEFT_MARGIN) / snapSize) * snapSize;

    // Snap the Y coordinate
    const snappedY =
      TOP_MARGIN +
      Math.round((rect.top - TOP_MARGIN) / snapSize) * snapSize;

    // Set up a short transition so the icon "flies" to the snap
    iconRef.current.style.transition = 'left 0.2s ease, top 0.2s ease';

    // We force the browser to apply the transition by reflow or a tiny delay
    iconRef.current.offsetWidth; // Force reflow
    iconRef.current.style.left = `${snappedX}px`;
    iconRef.current.style.top = `${snappedY}px`;

    // Once the transition finishes, we finalize the position in state
    const onTransitionEnd = () => {
      iconRef.current.removeEventListener('transitionend', onTransitionEnd);

      // Finalize state with snapped position
      setPosition({ x: snappedX, y: snappedY });
      setIsDragging(false);

      // Optionally remove the transition so future style changes are instant
      iconRef.current.style.transition = 'none';
    };
    iconRef.current.addEventListener('transitionend', onTransitionEnd);
  };

  // Attach listeners to track movement and end of drag
  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
};

/**
 * Cancels the hold timer, preventing drag from initiating if
 * threshold wasn't reached.
 */
export const cancelHold = (holdTimer, setHoldTimer) => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    setHoldTimer(null);
  }
};

/**
 * Handles single vs. double taps (e.g., to open an app on double click).
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
