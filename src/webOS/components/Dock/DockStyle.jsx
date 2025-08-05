// src/components/Dock/DockStyle/DockStyle.jsx

// flattened cubic‑bezier easing used everywhere
const FLATTENED_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1.0)';
const DURATION = 0.2; // seconds

/**
 * Safely include both modern and legacy iOS bottom safe‑area insets.
 * env() is the new syntax; constant() is for older WebKit.
 */
const SAFE_BOTTOM_ENV      = 'env(safe-area-inset-bottom)';
const SAFE_BOTTOM_CONSTANT = 'constant(safe-area-inset-bottom)';
const withSafeBottom = (marginPx) =>
  `calc(${marginPx}px + ${SAFE_BOTTOM_CONSTANT} + ${SAFE_BOTTOM_ENV})`;

/**
 * Returns the outer container style, including positioning
 * and staggered transitions for opacity and transform.
 */
export const getOuterContainerStyle = (
  DOCK_POSITION,
  DOCK_MARGIN,
  isDockVisible
) => {
  // when appearing: fade → slide; when hiding: slide → fade
  const transition = isDockVisible
    ? // appear: opacity first, then transform
      `opacity ${DURATION}s ${FLATTENED_EASING}, ` +
      `transform ${DURATION}s ${FLATTENED_EASING} ${DURATION}s`
    : // hide: transform first, then opacity
      `transform ${DURATION}s ${FLATTENED_EASING}, ` +
      `opacity ${DURATION}s ${FLATTENED_EASING}`;

  const style = {
    position: 'fixed',
    zIndex: 200,
    transition,
  };

  if (DOCK_POSITION === 'bottom') {
    style.bottom    = withSafeBottom(DOCK_MARGIN);
    style.left      = '50%';
    style.transform = isDockVisible
      ? 'translateX(-50%)'
      : 'translateX(-50%) translateY(calc(150% + 10px))';
  } else if (DOCK_POSITION === 'left') {
    style.left      = `${DOCK_MARGIN}px`;
    style.top       = '50%';
    style.transform = isDockVisible
      ? 'translateY(-50%)'
      : 'translateX(calc(-150% - 10px)) translateY(-50%)';
  } else if (DOCK_POSITION === 'right') {
    style.right     = `${DOCK_MARGIN}px`;
    style.top       = '50%';
    style.transform = isDockVisible
      ? 'translateY(-50%)'
      : 'translateX(calc(150% + 10px)) translateY(-50%)';
  } else {
    // fallback to bottom
    style.bottom    = withSafeBottom(DOCK_MARGIN);
    style.left      = '50%';
    style.transform = isDockVisible
      ? 'translateX(-50%)'
      : 'translateX(-50%) translateY(calc(150% + 10px))';
  }

  return style;
};

/**
 * Returns the icons container style. We add a width transition here
 * so horizontal docks animate their width smoothly.
 */
export const getIconsContainerStyle = (
  isVerticalDock,
  DOCK_POSITION,
  ICON_SIZE,
  containerDimension
) => {
  if (isVerticalDock) {
    const base = {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: `${ICON_SIZE}px`,
      height: `${containerDimension}px`,
    };
    if (DOCK_POSITION === 'left') {
      return { ...base, alignItems: 'flex-start' };
    } else if (DOCK_POSITION === 'right') {
      return { ...base, alignItems: 'flex-end' };
    } else {
      return { ...base, alignItems: 'center' };
    }
  } else {
    return {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      width: `${containerDimension}px`,
      height: `${ICON_SIZE}px`,
      transition: `width ${DURATION}s ${FLATTENED_EASING}`,
    };
  }
};

export const getBackgroundStyle = (
  isVerticalDock,
  bgStart,
  bgSize,
  DOCK_POSITION
) => {
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
      width: '100%',
      height: '150%',
    };
  }
};

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
  const scaleIndex = paginationEnabled
    ? currentPage * iconsPerPage + index
    : index;
  const scale = scales[scaleIndex];
  const dynamicMargin = ICON_MARGIN + (scale - 1) * ADDITIONAL_MARGIN;

  const baseStyle = {
    width: `${ICON_SIZE}px`,
    height: `${ICON_SIZE}px`,
    transition: shouldTransition
      ? `${INITIAL_TRANSITION}, opacity ${DURATION}s ${FLATTENED_EASING}`
      : NO_TRANSITION,
    transform: `scale(${scale})`,
    cursor: 'pointer',
    position: 'relative',
    zIndex: 210,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  };

  if (DOCK_POSITION === 'left' || DOCK_POSITION === 'right') {
    return {
      ...baseStyle,
      margin: `${dynamicMargin}px 0`,
      transformOrigin:
        DOCK_POSITION === 'left' ? 'left center' : 'right center',
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

export const iconImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  borderRadius: '10%',
};

export const getTooltipWrapperStyle = (
  DOCK_POSITION,
  APP_NAME_TOOLTIP_OFFSET
) => {
  const style = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 220,
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

export const getTooltipBubbleStyle = (
  APP_NAME_BACKGROUND_PADDING,
  APP_NAME_FONT_SIZE
) => ({
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
      return { ...commonStyle, left: -10, top: '50%', transform: 'translateY(-50%)' };
    case 'right':
      return { ...commonStyle, right: -10, top: '50%', transform: 'translateY(-50%)' };
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
