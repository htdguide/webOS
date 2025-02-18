import React, { useState } from 'react';
import DesktopIcon from '../DesktopIcon/DesktopIcon.jsx';
import DesktopIconsController from '../../managers/IconsList.jsx';
import {
  GRID_GAP,
  TOP_MARGIN,
  LEFT_MARGIN,
  // RIGHT_MARGIN,
  // BOTTOM_MARGIN,
} from '../../configs/DesktopIconConfig.jsx';
import { GRID_SIZE } from '../../configs/DesktopIconConfig.jsx';
import './Desktop.css';

/**
 * Helper to convert a priority number into an (x,y) position on the desktop.
 * This version uses both GRID_SIZE and GRID_GAP to space icons out.
 */
function getPositionFromPriority(priority) {
  const safePriority = priority && priority > 0 ? priority : 1;

  // Single-column approach: each subsequent icon moves (GRID_SIZE + GRID_GAP) down
  const effectiveCellSize = GRID_SIZE + GRID_GAP;

  const x = LEFT_MARGIN;
  const y = TOP_MARGIN + (safePriority - 1) * effectiveCellSize;

  return { x, y };
}

function Desktop({ onOpenApp }) {
  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleWallpaperClick = () => {
    setSelectedIcon(null);
  };

  const handleIconClick = (iconId) => {
    setSelectedIcon(iconId);
  };

  return (
    <div className="desktop" onClick={handleWallpaperClick}>
      {DesktopIconsController.map((iconConfig) => {
        // Convert the icon's priority into an (x,y) position,
        // now using GRID_GAP to keep them spaced out.
        const position = getPositionFromPriority(iconConfig.priority);

        return (
          <DesktopIcon
            key={iconConfig.id}
            name={iconConfig.name}
            icon={iconConfig.icon}
            isSelected={selectedIcon === iconConfig.id}
            onClick={() => handleIconClick(iconConfig.id)}
            onDoubleClick={() => onOpenApp(iconConfig.id)}
            position={position} 
          />
        );
      })}
    </div>
  );
}

export default Desktop;
