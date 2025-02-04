// DesktopIconInteractions.js

export const GRID_SIZE = 80;
export const HOLD_THRESHOLD = 100;
export const DOUBLE_TAP_DELAY = 300;

export const startHold = (startX, startY, iconRef, setHoldTimer, startDragging) => {
  const rect = iconRef.current.getBoundingClientRect();
  const offsetX = startX - rect.left;
  const offsetY = startY - rect.top;

  const timer = setTimeout(() => {
    startDragging(startX, startY, offsetX, offsetY);
  }, HOLD_THRESHOLD);

  setHoldTimer(timer);
};

export const startDragging = (startX, startY, offsetX, offsetY, iconRef, setPosition, setIsDragging) => {
  setIsDragging(true);

  const handleMove = (event) => {
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const newX = Math.max(0, Math.min(window.innerWidth - GRID_SIZE, clientX - offsetX));
    const newY = Math.max(0, Math.min(window.innerHeight - GRID_SIZE, clientY - offsetY));

    iconRef.current.style.left = `${newX}px`;
    iconRef.current.style.top = `${newY}px`;
  };

  const handleEnd = () => {
    if (setIsDragging) {
      const rect = iconRef.current.getBoundingClientRect();
      const snappedX = Math.round(rect.left / GRID_SIZE) * GRID_SIZE;
      const snappedY = Math.round(rect.top / GRID_SIZE) * GRID_SIZE;

      setPosition({ x: snappedX, y: snappedY });
    }

    setIsDragging(false);
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleEnd);
    window.removeEventListener('touchmove', handleMove);
    window.removeEventListener('touchend', handleEnd);
  };

  window.addEventListener('mousemove', handleMove);
  window.addEventListener('mouseup', handleEnd);
  window.addEventListener('touchmove', handleMove, { passive: false });
  window.addEventListener('touchend', handleEnd);
};

export const cancelHold = (holdTimer, setHoldTimer) => {
  if (holdTimer) {
    clearTimeout(holdTimer);
    setHoldTimer(null);
  }
};

export const handleTap = (lastTap, setLastTap, onDoubleClick, onClick) => {
  const now = Date.now();
  if (now - lastTap < DOUBLE_TAP_DELAY) {
    onDoubleClick();
  } else {
    onClick();
  }
  setLastTap(now);
};
