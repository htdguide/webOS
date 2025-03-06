// DockConfig.jsx
// Configuration parameters for the Dock animations and layout.

const DOCK_CONFIG = {
    // Icon dimensions
    ICON_SIZE: 48,            // Icon size in pixels.
    
    // Margins
    ICON_MARGIN: 8,           // Base margin between icons (in pixels) before magnification.
    ADDITIONAL_MARGIN: 20,     // Additional margin factor per unit scale above 1.
  
    // Magnification effect
    DOCK_SPREAD: 150,         // Range in pixels for the magnification effect.
    MAX_SCALE: 1.5,           // Maximum scale when the cursor is directly over an icon.
    MAX_TRANSLATE_Y: -10,     // Maximum vertical translation in pixels at full magnification.
  
    // Transition settings
    INITIAL_TRANSITION: 'all 0.15s ease', // CSS transition for the initial hover animation.
    NO_TRANSITION: 'none'                 // CSS value for immediate updates without inertion.
  };
  
  export default DOCK_CONFIG;
  