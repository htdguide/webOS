// src/components/Desktop/Desktop.jsx

import React, { useState, useContext } from "react";
import { AppsContext } from "../../contexts/AppsContext/AppsContext.jsx";
import DesktopIcon from "../DesktopIcon/DesktopIcon.jsx";
import {
  GRID_GAP,
  TOP_MARGIN,
  LEFT_MARGIN,
} from "../../configs/DesktopIconConfig/DesktopIconConfig.jsx";
import { GRID_SIZE } from "../../configs/DesktopIconConfig/DesktopIconConfig.jsx";
import "./Desktop.css";
import { FocusWrapper } from "../../contexts/FocusControl/FocusControl.jsx";
import { useLogger } from "../Logger/Logger.jsx";

/**
 * Helper to convert a priority number into an (x,y) position on the desktop.
 * Uses GRID_SIZE and GRID_GAP to space icons out relative to the desktop content.
 */
function getPositionFromPriority(priority) {
  const safePriority = priority && priority > 0 ? priority : 1;
  const effectiveCellSize = GRID_SIZE + GRID_GAP;
  const x = LEFT_MARGIN;
  const y = TOP_MARGIN + (safePriority - 1) * effectiveCellSize;
  return { x, y };
}

function Desktop({ onOpenApp }) {
  const { apps } = useContext(AppsContext);

  // Create a logger bound to this component name. Internally, it will read
  // state.groups.developer.logsenabled and only print if "true".
  const log = useLogger("Desktop");

  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleWallpaperClick = () => {
    log("Wallpaper clicked: deselecting any selected icon");
    setSelectedIcon(null);
  };

  const handleIconClick = (iconId) => {
    log(`Icon clicked: ${iconId}`);
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (iconId) => {
    log(`Icon double-clicked: ${iconId} (opening app)`);
    onOpenApp(iconId);
  };

  // Log how many desktop icons are being rendered
  const desktopApps = apps.filter((iconConfig) => !iconConfig.indock);
  log(`Rendering ${desktopApps.length} desktop icons`);

  return (
    <FocusWrapper name="Desktop">
      {/* The desktop content fills its parent monitor */}
      <div className="desktop-content" onClick={handleWallpaperClick}>
        {desktopApps.map((iconConfig) => {
          const position = getPositionFromPriority(iconConfig.priority);
          log(
            `Position for icon ${iconConfig.id}: x=${position.x}, y=${position.y}`
          );
          return (
            <DesktopIcon
              key={iconConfig.id}
              name={iconConfig.name}
              icon={iconConfig.icon}
              isSelected={selectedIcon === iconConfig.id}
              onClick={() => handleIconClick(iconConfig.id)}
              onDoubleClick={() => handleIconDoubleClick(iconConfig.id)}
              position={position}
            />
          );
        })}
      </div>
    </FocusWrapper>
  );
}

export default Desktop;
