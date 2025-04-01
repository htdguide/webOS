// MusicServiceConfig.jsx

/**
 * Configuration options for your MusicService.
 * Keep these in a separate file to make it easy to edit defaults or paths.
 */
const musicServiceConfig = {
    // The default volume level (0–100)
    DEFAULT_VOLUME: 25,
  
    // The exponent factor to apply to volume in order to make it feel more "linear" to the listener
    VOLUME_EXPONENT: 2,
  
    // The path or URL for the musicList.json file
    MUSIC_LIST_URL: '/WebintoshHD/Music/musicList.json',
  
    // If you'd like more advanced config, add them here:
    // e.g. VOLUME_MIN: 0,
    //      VOLUME_MAX: 100,
    //      ... etc.
  };
  
  export default musicServiceConfig;
  