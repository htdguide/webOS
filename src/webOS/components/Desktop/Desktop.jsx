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

  // Create a logger bound to this component name. 
  // Internally, it will:
  //   1) Read `developer.logsenabled` from StateManager.
  //   2) If logs are enabled ("true"), let us know via `enabled`, and print formatted logs with group names.
  // `log` signature: log(groupName: string, message: string)
  const { log, enabled } = useLogger("Desktop");

  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleWallpaperClick = () => {
    // Group: "userInteraction"
    if (enabled) log("userInteraction", "Wallpaper clicked: deselecting any selected icon");
    setSelectedIcon(null);
  };

  const handleIconClick = (iconId) => {
    // Group: "userInteraction"
    if (enabled) log("userInteraction", `Icon clicked: ${iconId}`);
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (iconId) => {
    // Group: "userInteraction"
    if (enabled) log("userInteraction", `Icon double-clicked: ${iconId} (opening app)`);
    onOpenApp(iconId);
  };

  // Filter out apps that are “in dock” to get desktop icons
  const desktopApps = apps.filter((iconConfig) => !iconConfig.indock);

  // Group: "render"
  if (enabled) log("render", `Rendering ${desktopApps.length} desktop icons`);

  return (
    <FocusWrapper name="Desktop">
      {/* The desktop content fills its parent monitor */}
      <div className="desktop-content" onClick={handleWallpaperClick}>
        {desktopApps.map((iconConfig) => {
          const position = getPositionFromPriority(iconConfig.priority);

          // Group: "layout"
          if (enabled) log("layout", `Position for icon ${iconConfig.id}: x=${position.x}, y=${position.y}`);

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
