import React, { useState } from 'react';
import MiniWindow from '../components/MiniWindow/MiniWindow';
import batteryIcon from '../media/icons/battery.png'; // Replace with your battery icon file
import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';

/**
 * Icons list for the menubar miniapps.
 * Lower priority numbers appear at the right (i.e. newer icons added from right to left).
 */
const iconsList = [
  {
    id: 'battery',
    name: 'Battery',
    icon: batteryIcon,
    component: BatteryMiniApp,
    priority: 1,
  },
  // Add more icons/apps here as needed
];

function MenuBarIcons() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });

  const handleIconClick = (icon, event) => {
    console.log('Icon clicked:', icon.id); // Debug: verify click event
    const rect = event.currentTarget.getBoundingClientRect();
    // Set anchor position so that the MiniWindow's top-right aligns with the icon's bottom-right.
    setAnchorPos({ x: rect.right, y: rect.bottom });
    // Toggle the miniapp: if the same icon is clicked again, close it.
    setActiveApp(activeApp && activeApp.id === icon.id ? null : icon);
  };

  // Sort icons by priority ascending then reverse to display from right to left.
  const sortedIcons = iconsList.slice().sort((a, b) => a.priority - b.priority).reverse();
  const ActiveComponent = activeApp ? activeApp.component : null;

  return (
    <div
      className="menu-bar-icons"
      style={{
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'auto', // Ensure container receives pointer events
      }}
    >
      {sortedIcons.map((icon) => (
        <img
          key={icon.id}
          src={icon.icon}
          alt={icon.name}
          className="menu-bar-icon"
          onClick={(e) => handleIconClick(icon, e)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer',
            marginRight: '10px',
            pointerEvents: 'auto', // Ensure the icon is clickable
          }}
        />
      ))}
      {activeApp && ActiveComponent && (
        <MiniWindow anchorPos={anchorPos} onClose={() => setActiveApp(null)}>
          <ActiveComponent />
        </MiniWindow>
      )}
    </div>
  );
}

export default MenuBarIcons;
