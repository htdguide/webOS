import React, { useState } from 'react';
import DesktopIcon from './DesktopIcon';
import folderIcon from './icons/macos-folder-icon.webp'; // Replace with your folder icon path
import './Desktop.css';

function Desktop({ onOpenSortingWindow }) {
  const [selectedIcon, setSelectedIcon] = useState(null); // Track selected icon

  const handleWallpaperClick = () => {
    setSelectedIcon(null); // Deselect icon
  };

  const handleIconClick = (iconName) => {
    setSelectedIcon(iconName); // Highlight the clicked icon
  };

  return (
    <div className="desktop" onClick={handleWallpaperClick}>
      <DesktopIcon
        name="Sorting Algorithms"
        icon={folderIcon}
        isSelected={selectedIcon === 'Sorting Algorithms'}
        onClick={() => handleIconClick('Sorting Algorithms')}
        onDoubleClick={onOpenSortingWindow} // Open WASM app
      />
    </div>
  );
}

export default Desktop;
