// DockStyle.jsx

// ---------------------------
// Outer container (the dock)
// ---------------------------
export const getOuterContainerStyle = (DOCK_POSITION, DOCK_MARGIN) => {
    const style = {
      position: 'fixed',
      zIndex: 10,
    };
  
    if (DOCK_POSITION === 'bottom') {
      style.bottom = `${DOCK_MARGIN}px`;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    } else if (DOCK_POSITION === 'left') {
      style.left = `${DOCK_MARGIN}px`;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
    } else if (DOCK_POSITION === 'right') {
      style.right = `${DOCK_MARGIN}px`;
      style.top = '50%';
      style.transform = 'translateY(-50%)';
    } else {
      // default/fallback: bottom
      style.bottom = `${DOCK_MARGIN}px`;
      style.left = '50%';
      style.transform = 'translateX(-50%)';
    }
  
    return style;
  };
  
  // ---------------------------------------------------
  // Icons container (holds the icons in row or column)
  // ---------------------------------------------------
  export const getIconsContainerStyle = (isVerticalDock, ICON_SIZE, containerDimension) => {
    if (isVerticalDock) {
      return {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: `${ICON_SIZE}px`,
        height: `${containerDimension}px`,
      };
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
  export const getBackgroundStyle = (isVerticalDock, bgStart, bgSize) => {
    if (isVerticalDock) {
      return {
        position: 'absolute',
        left: -5,
        top: `${bgStart - 5}px`,
        height: `${bgSize + 10}px`,
        width: '120%',
        borderRadius: '16px',
        background: 'rgba(83, 83, 83, 0.25)',
        backdropFilter: 'blur(13px)',
        WebkitBackdropFilter: 'blur(13px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        pointerEvents: 'none',
      };
    } else {
      return {
        position: 'absolute',
        top: -10,
        left: `${bgStart - 10}px`,
        width: `${bgSize + 20}px`,
        height: '150%',
        borderRadius: '16px',
        background: 'rgba(83, 83, 83, 0.25)',
        backdropFilter: 'blur(13px)',
        WebkitBackdropFilter: 'blur(13px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        pointerEvents: 'none',
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
  
    // For vertical docks, margin is vertical; for horizontal, margin is horizontal
    if (DOCK_POSITION === 'left' || DOCK_POSITION === 'right') {
      return {
        ...baseStyle,
        margin: `${dynamicMargin}px 0`,
        transformOrigin: DOCK_POSITION === 'left' ? 'left center' : 'right center',
      };
    } else {
      // bottom or fallback
      return {
        ...baseStyle,
        margin: `0 ${dynamicMargin}px`,
        transformOrigin: 'bottom center',
        alignItems: 'flex-end', // push icon to bottom of container
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
        // fallback to bottom
        style.bottom = `calc(100% + ${APP_NAME_TOOLTIP_OFFSET}px)`;
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        break;
    }
  
    return style;
  };
  
  export const getTooltipBubbleStyle = (APP_NAME_BACKGROUND_PADDING, APP_NAME_FONT_SIZE) => ({
    position: 'relative',
    background: 'rgba(117, 117, 117, 0.9)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    color: '#000',
    padding: APP_NAME_BACKGROUND_PADDING,
    borderRadius: '6px',
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
  
    // Use same color as bubble background
    const arrowColor = 'rgba(117, 117, 117, 0.9)';
  
    switch (DOCK_POSITION) {
      case 'bottom':
        // bubble is above icon => arrow at bubble’s bottom
        style.top = '100%';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        style.borderTop = `6px solid ${arrowColor}`;
        break;
      case 'left':
        // bubble is to the right => arrow on bubble’s left edge
        style.right = '100%';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        style.borderRight = `6px solid ${arrowColor}`;
        break;
      case 'right':
        // bubble is to the left => arrow on bubble’s right edge
        style.left = '100%';
        style.top = '50%';
        style.transform = 'translateY(-50%)';
        style.borderLeft = `6px solid ${arrowColor}`;
        break;
      default:
        // fallback to bottom
        style.top = '100%';
        style.left = '50%';
        style.transform = 'translateX(-50%)';
        style.borderTop = `6px solid ${arrowColor}`;
        break;
    }
  
    return style;
  };
  