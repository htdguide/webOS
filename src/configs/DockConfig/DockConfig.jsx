// DockConfig.jsx
// Configuration parameters for the Dock animations and layout.

const DOCK_CONFIG = {
  // Icon dimensions and margins for default (landscape) devices.
  ICON_SIZE: 48,            // Icon size in pixels.
  ICON_MARGIN: 8,           // Base margin between icons (in pixels) before magnification.
  ADDITIONAL_MARGIN: 20,     // Additional margin factor per unit scale above 1.

  // Magnification effect.
  DOCK_SPREAD: 150,         // Range in pixels for the magnification effect.
  MAX_SCALE: 1.5,           // Maximum scale when the cursor is directly over an icon.

  // Transition settings.
  INITIAL_TRANSITION: 'all 0.15s ease', // CSS transition for the initial hover animation.
  NO_TRANSITION: 'none',                // CSS value for immediate updates without inertion.

  // Feature: Enable/disable magnification effect.
  ENABLE_MAGNIFICATION: false,

  // Feature: Dock position. Options: 'bottom', 'left', 'right'.
  DOCK_POSITION: 'bottom',

  // Feature: Margin from the edge.
  // For 'bottom', this is the bottom margin; for 'left' or 'right', this is the side margin.
  DOCK_MARGIN: 20,

  // Vertical orientation overrides (for devices in portrait mode).
  vertical: {
    ICON_SIZE: 56,
    ICON_MARGIN: 8,
    ADDITIONAL_MARGIN: 12,
    DOCK_SPREAD: 120,
    MAX_SCALE: 1.4,
    INITIAL_TRANSITION: 'all 0.15s ease',
    NO_TRANSITION: 'none',
    ENABLE_MAGNIFICATION: false,
    DOCK_POSITION: 'bottom', // For portrait devices, the dock remains at the bottom.
    DOCK_MARGIN: 15,
  },
};

export default DOCK_CONFIG;
