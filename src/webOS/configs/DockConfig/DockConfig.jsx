// DockConfig.jsx
// Configuration parameters for the Dock animations and layout.

const DOCK_CONFIG = {

  // Icon spacing and layout.
  ICON_MARGIN: 8,
  ADDITIONAL_MARGIN: 20,

  // Magnification effect.
  DOCK_SPREAD: 150,

  // Transition settings.
  INITIAL_TRANSITION: 'all 0.15s ease',
  NO_TRANSITION: 'none',

  // Feature: Dock position. Options: 'bottom'(default), 'left', 'right'.
  DOCK_POSITION: 'bottom',
  DOCK_MARGIN: 20,          // default bottom margin

  // Adjustments for dots: margin from the bottom of the screen.
  DOTS_MARGIN_BOTTOM: 10,

  // Tooltip configuration.
  APP_NAME_TOOLTIP_OFFSET: 25,
  APP_NAME_BACKGROUND_PADDING: '5px 15px',
  APP_NAME_FONT_SIZE: 14,

  // Portrait mode (vertical layout) — now matches default
  vertical: {
    ICON_MARGIN: 8,
    ADDITIONAL_MARGIN: 12,
    DOCK_SPREAD: 120,
    INITIAL_TRANSITION: 'all 0.15s ease',
    NO_TRANSITION: 'none',
    DOCK_POSITION: 'bottom',
    DOCK_MARGIN: 30,        // ← was 5, bumped to 20 to avoid shift
    DOTS_MARGIN_BOTTOM: 20,
    APP_NAME_TOOLTIP_OFFSET: 25,
    APP_NAME_BACKGROUND_PADDING: '5px 15px',
    APP_NAME_FONT_SIZE: 12,
  },

  // Left dock — inherits shared values by default.
  left: {
    ICON_MARGIN: 8,
    ADDITIONAL_MARGIN: 20,
    DOCK_SPREAD: 130,
    INITIAL_TRANSITION: 'all 0.15s ease',
    NO_TRANSITION: 'none',
    DOCK_POSITION: 'left',
    DOCK_MARGIN: 20,
    DOTS_MARGIN_BOTTOM: 25,
    APP_NAME_TOOLTIP_OFFSET: 15,
    APP_NAME_BACKGROUND_PADDING: '5px 10px',
    APP_NAME_FONT_SIZE: 12,
  },

  // Right dock — inherits shared values by default.
  right: {
    ICON_MARGIN: 8,
    ADDITIONAL_MARGIN: 25,
    DOCK_SPREAD: 130,
    INITIAL_TRANSITION: 'all 0.15s ease',
    NO_TRANSITION: 'none',
    DOCK_POSITION: 'right',
    DOCK_MARGIN: 20,
    DOTS_MARGIN_BOTTOM: 10,
    APP_NAME_TOOLTIP_OFFSET: 15,
    APP_NAME_BACKGROUND_PADDING: '5px 10px',
    APP_NAME_FONT_SIZE: 12,
  },
};

export default DOCK_CONFIG;
