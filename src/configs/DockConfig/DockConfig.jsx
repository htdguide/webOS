// DockConfig.jsx
// Configuration parameters for the Dock animations and layout.

const DOCK_CONFIG = {
  // Icon dimensions
  ICON_SIZE: 48,            // Icon size in pixels.
  
  // Margins between icons
  ICON_MARGIN: 8,           // Base margin between icons (in pixels) before magnification.
  ADDITIONAL_MARGIN: 20,     // Additional margin factor per unit scale above 1.

  // Magnification effect
  DOCK_SPREAD: 150,         // Range in pixels for the magnification effect.
  MAX_SCALE: 1.5,           // Maximum scale when the cursor is directly over an icon.
  
  // Transition settings
  INITIAL_TRANSITION: 'all 0.15s ease', // CSS transition for the initial hover animation.
  NO_TRANSITION: 'none',                // CSS value for immediate updates without inertion.
  
  // New feature: Enable/disable magnification effect.
  ENABLE_MAGNIFICATION: false,          // Set to false to disable magnification.
  
  // New feature: Dock position. Options: 'bottom', 'left', 'right'.
  DOCK_POSITION: 'bottom',
  
  // New feature: Margin from the edge.
  // For 'bottom', this is the bottom margin; for 'left' or 'right', this is the side margin.
  DOCK_MARGIN: 10,
};

export default DOCK_CONFIG;
