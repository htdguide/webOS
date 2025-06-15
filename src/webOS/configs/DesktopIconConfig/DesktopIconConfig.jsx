// DesktopIconConfig.jsx

/**
 * Margins so that icons do not collide with window edges
 * and we keep space for a top menubar, etc.
 */
export const TOP_MARGIN = 40;
export const LEFT_MARGIN = 20;
export const RIGHT_MARGIN = 20;
export const BOTTOM_MARGIN = 100;

/**
 * Grid spacing
 */
export const GRID_GAP = 30;

// Time thresholds
export const HOLD_THRESHOLD = 100;
export const DOUBLE_TAP_DELAY = 300;

/**
 * Icon unit (not image) size configuration. Adjust these values as desired.
 */
export const ICON_WIDTH = 64;
export const ICON_HEIGHT = 64;

/**
 * We'll base the grid size on the icon's height (you can change this logic).
 */
export const GRID_SIZE = ICON_HEIGHT;
