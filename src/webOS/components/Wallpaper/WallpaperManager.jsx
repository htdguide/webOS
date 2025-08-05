// src/components/Wallpaper/WallpaperManager.jsx

// ── Area 1: Imports ───────────────────────────────────────────────────────────
// 1.1: Import video and image assets
import SequoiaSunriseVideo from '/WebintoshHD/Wallpapers/SequoiaSunrise.mp4';
import SequoiaSunriseImage from '../../media/wallpaper/SequoiaSunrise.jpg';


// ── Area 2: Default Wallpaper Definition ───────────────────────────────────────
// 2.1: Bundle the default wallpaper resources
const defaultWallpaper = {
  /** URL to the MP4 video for animated wallpaper */
  videoSrc: SequoiaSunriseVideo,
  /** URL to the JPG used as a static fallback image */
  fallbackImage: SequoiaSunriseImage,
};


// ── Area 3: Exports ────────────────────────────────────────────────────────────
// 3.1: Named exports for convenience
export const wallpaperVideoSrc = defaultWallpaper.videoSrc;
export const wallpaperFallbackImage = defaultWallpaper.fallbackImage;

// 3.2: Default export of the full wallpaper object
export default defaultWallpaper;
