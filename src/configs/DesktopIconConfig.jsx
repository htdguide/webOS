// DesktopIconConfig.jsx

/**
 * Margins so that icons do not collide with window edges
 * and we keep space for a top menubar, etc.
 */
export const TOP_MARGIN = 60;
export const LEFT_MARGIN = 20;
export const RIGHT_MARGIN = 20;
export const BOTTOM_MARGIN = 20;

/**
 * This value is added to GRID_SIZE to form the "effective" cell size
 * for snapping icons in place. By increasing or decreasing GRID_GAP,
 * you can control how far apart icons are spaced vertically and horizontally.
 */
export const GRID_GAP = 20;

// Time thresholds
export const HOLD_THRESHOLD = 100;
export const DOUBLE_TAP_DELAY = 300;

/**
 * Icon size configuration. Adjust these values as desired.
 */
export const ICON_WIDTH = 64;
export const ICON_HEIGHT = 80;

/**
 * If you also need separate image width/height inside the icon, define them:
 */
export const ICON_IMAGE_WIDTH = 48;
export const ICON_IMAGE_HEIGHT = 48;

/**
 * We'll base the grid size on the icon's height (you can change this logic).
 */
export const GRID_SIZE = ICON_HEIGHT;
