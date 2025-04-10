// DockStyle.jsx

// ---------------------------
// Outer container (the dock)
// ---------------------------
export const getOuterContainerStyle = (DOCK_POSITION, DOCK_MARGIN, isDockVisible) => {
  const style = {
    position: 'absolute', // Changed from 'fixed' to 'absolute' to align with the desktop div
    zIndex: 9998,
    transition: 'transform 0.3s ease', // smooth sliding transition
  };

  if (DOCK_POSITION === 'bottom') {
    style.bottom = `${DOCK_MARGIN}px`;
    // Center horizontally relative to the desktop container
    style.left = '50%';
    style.transform = isDockVisible
      ? 'translateX(-50%)'
      : 'translateX(-50%) translateY(calc(150% + 10px))'; // slide further down when hidden
  } else if (DOCK_POSITION === 'left') {
    style.left = `${DOCK_MARGIN}px`;
    style.top = '50%';
    style.transform = isDockVisible
      ? 'translateY(-50%)'
      : 'translateX(calc(-150% - 10px)) translateY(-50%)';
  } else if (DOCK_POSITION === 'right') {
    style.right = `${DOCK_MARGIN}px`;
    style.top = '50%';
    style.transform = isDockVisible
      ? 'translateY(-50%)'
      : 'translateX(calc(150% + 10px)) translateY(-50%)';
  } else {
    // default/fallback: bottom
    style.bottom = `${DOCK_MARGIN}px`;
    style.left = '50%';
    style.transform = isDockVisible
      ? 'translateX(-50%)'
      : 'translateX(-50%) translateY(calc(150% + 10px))';
  }

  return style;
};

// ---------------------------------------------------
// Icons container (holds the icons in row or column)
// ---------------------------------------------------
export const getIconsContainerStyle = (isVerticalDock, DOCK_POSITION, ICON_SIZE, containerDimension) => {
  if (isVerticalDock) {
    switch (DOCK_POSITION) {
      case 'left':
        return {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: `${ICON_SIZE}px`,
          height: `${containerDimension}px`,
        };
      case 'right':
        return {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-end',
          width: `${ICON_SIZE}px`,
          height: `${containerDimension}px`,
        };
      default:
        return {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${ICON_SIZE}px`,
          height: `${containerDimension}px`,
        };
    }
  } else {
    return {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      width: `${containerDimension}px`,
      height: `${ICON_SIZE}px`,
    };
  }
};

// -------------------------------------------
// Background "glass" behind the dock’s icons
// -------------------------------------------
export const getBackgroundStyle = (isVerticalDock, bgStart, bgSize, DOCK_POSITION) => {
  const commonStyle = {
    position: 'absolute',
    borderRadius: '16px',
    background: 'rgba(220, 220, 220, 0.25)',
    backdropFilter: 'blur(13px)',
    WebkitBackdropFilter: 'blur(13px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    pointerEvents: 'none',
  };

  if (isVerticalDock) {
    if (DOCK_POSITION === 'left') {
      return {
        ...commonStyle,
        right: -10,
        top: `${bgStart - 10}px`,
        height: `${bgSize + 18}px`,
        width: '150%',
      };
    } else if (DOCK_POSITION === 'right') {
      return {
        ...commonStyle,
        left: -10,
        top: `${bgStart - 10}px`,
        height: `${bgSize + 18}px`,
        width: '150%',
      };
    } else {
      return {
        ...commonStyle,
        left: -16,
        top: `${bgStart - 10}px`,
        height: `${bgSize + 18}px`,
        width: '150%',
      };
    }
  } else {
    return {
      ...commonStyle,
      top: -10,
      left: `${bgStart - 10}px`,
      width: `${bgSize + 20}px`,
      height: '150%',
    };
  }
};

// -------------------------------
// Individual icon container style
// -------------------------------
export const getIconContainerStyle = ({
  index,
  paginationEnabled,
  scales,
  currentPage,
  iconsPerPage,
  ICON_SIZE,
  ICON_MARGIN,
  ADDITIONAL_MARGIN,
  shouldTransition,
  INITIAL_TRANSITION,
  NO_TRANSITION,
  DOCK_POSITION,
}) => {
  // Find the correct scale for this icon (considering pagination)
  const scaleIndex = paginationEnabled ? (currentPage * iconsPerPage + index) : index;
  const scale = scales[scaleIndex];

  // Magnification margin
  const dynamicMargin = ICON_MARGIN + (scale - 1) * ADDITIONAL_MARGIN;

  const baseStyle = {
    width: `${ICON_SIZE}px`,
    height: `${ICON_SIZE}px`,
    transition: shouldTransition ? INITIAL_TRANSITION : NO_TRANSITION,
    transform: `scale(${scale})`,
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (DOCK_POSITION === 'left' || DOCK_POSITION === 'right') {
    return {
      ...baseStyle,
      margin: `${dynamicMargin}px 0`,
      transformOrigin: DOCK_POSITION === 'left' ? 'left center' : 'right center',
    };
  } else {
    return {
      ...baseStyle,
      margin: `0 ${dynamicMargin}px`,
      transformOrigin: 'bottom center',
      alignItems: 'flex-end',
    };
  }
};

// -----------------
// The icon <img> style
// -----------------
export const iconImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: '10%',
};

// ---------------------
// Tooltip (label) styles
// ---------------------
export const getTooltipWrapperStyle = (DOCK_POSITION, APP_NAME_TOOLTIP_OFFSET) => {
  const style = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 2,
  };

  switch (DOCK_POSITION) {
    case 'bottom':
      style.bottom = `calc(100% + ${APP_NAME_TOOLTIP_OFFSET}px)`;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      break;
    case 'left':
      style.left = `calc(100% + ${APP_NAME_TOOLTIP_OFFSET}px)`;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      break;
    case 'right':
      style.right = `calc(100% + ${APP_NAME_TOOLTIP_OFFSET}px)`;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      break;
    default:
      style.bottom = `calc(100% + ${APP_NAME_TOOLTIP_OFFSET}px)`;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      break;
  }

  return style;
};

export const getTooltipBubbleStyle = (APP_NAME_BACKGROUND_PADDING, APP_NAME_FONT_SIZE) => ({
  position: 'relative',
  background: 'rgba(200, 200, 200, 0.6)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  color: '#111',
  padding: APP_NAME_BACKGROUND_PADDING,
  borderRadius: '4px',
  fontSize: APP_NAME_FONT_SIZE,
  whiteSpace: 'nowrap',
  boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
});

export const getTooltipArrowStyle = (DOCK_POSITION) => {
  const style = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
  };

  const arrowColor = 'rgba(200, 200, 200, 0.6)';

  switch (DOCK_POSITION) {
    case 'bottom':
      style.top = '100%';
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      style.borderTop = `6px solid ${arrowColor}`;
      break;
    case 'left':
      style.right = '100%';
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      style.borderRight = `6px solid ${arrowColor}`;
      break;
    case 'right':
      style.left = '100%';
      style.top = '50%';
      style.transform = 'translateY(-50%)';
      style.borderLeft = `6px solid ${arrowColor}`;
      break;
    default:
      style.top = '100%';
      style.left = '50%';
      style.transform = 'translateX(-50%)';
      style.borderTop = `6px solid ${arrowColor}`;
      break;
  }

  return style;
};

// ---------------------
// Open indicator dot style
// ---------------------
export const getOpenIndicatorStyle = (DOCK_POSITION) => {
  const commonStyle = {
    position: 'absolute',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: '#111',
  };

  switch (DOCK_POSITION) {
    case 'left':
      return {
        ...commonStyle,
        left: -10,
        top: '50%',
        transform: 'translateY(-50%)',
      };
    case 'right':
      return {
        ...commonStyle,
        right: -10,
        top: '50%',
        transform: 'translateY(-50%)',
      };
    case 'bottom':
    default:
      return {
        ...commonStyle,
        bottom: -10,
        left: '50%',
        transform: 'translateX(-50%)',
      };
  }
};
