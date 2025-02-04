import React, { useState } from 'react';
import DesktopIcon from '../DesktopIcon/DesktopIcon';
import DesktopIconsController from '../../managers/DesktopIcons';
import './Desktop.css';

function Desktop({ onOpenApp }) {
  const [selectedIcon, setSelectedIcon] = useState(null); // Track selected icon

  const handleWallpaperClick = () => {
    setSelectedIcon(null); // Deselect all icons when clicking on the wallpaper
  };

  const handleIconClick = (iconId) => {
    setSelectedIcon(iconId); // Highlight the clicked icon
  };

  return (
    <div className="desktop" onClick={handleWallpaperClick}>
      {DesktopIconsController.map((iconConfig) => (
        <DesktopIcon
          key={iconConfig.id}
          name={iconConfig.name}
          icon={iconConfig.icon}
          isSelected={selectedIcon === iconConfig.id}
          onClick={() => handleIconClick(iconConfig.id)}
          onDoubleClick={() => onOpenApp(iconConfig.id)} // Open the app dynamically
          position={iconConfig.position} // Pass initial position for the icon
        />
      ))}
    </div>
  );
}

export default Desktop;
