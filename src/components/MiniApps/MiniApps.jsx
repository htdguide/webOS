import React, { useState } from 'react';
import MiniWindow from '../MiniWindow/MiniWindow';
import MiniAppsList from '../../lists/MiniAppsList';

function MiniApps() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });

  const handleAppClick = (appItem, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    // Position the miniwindow so that its left edge aligns with the app's left,
    // and its top is exactly at the bottom of the menubar.
    setAnchorPos({ x: rect.left, y: rect.top + rect.height });
    setActiveApp(activeApp && activeApp.id === appItem.id ? null : appItem);
  };

  // Sort apps by priority ascending, then reverse for right-to-left display
  const sortedApps = MiniAppsList.slice()
    .sort((a, b) => a.priority - b.priority)
    .reverse();

  const ActiveComponent = activeApp ? activeApp.component : null;

  return (
    <div
      className="menu-bar-icons"
      style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}
    >
      {sortedApps.map((appItem) => {
        const {
          id,
          name,
          icon,
          displayType = 'icon', // default to "icon" if not specified
        } = appItem;

        if (displayType === 'div') {
          // Render the component inline (compact mode) in the menubar
          const InlineComponent = appItem.component;
          return (
            <div
              key={id}
              className="menu-bar-div-item"
              onClick={(e) => handleAppClick(appItem, e)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              <InlineComponent compact />
            </div>
          );
        } else {
          // Otherwise, display it as an icon
          return (
            <img
              key={id}
              src={icon}
              alt={name}
              className="menu-bar-icon"
              onClick={(e) => handleAppClick(appItem, e)}
              style={{
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            />
          );
        }
      })}

      {/* Render the miniwindow if an app is active */}
      {activeApp && ActiveComponent && (
        <MiniWindow anchorPos={anchorPos} onClose={() => setActiveApp(null)}>
          {/* Notice here we render the *full* component (no "compact" prop) */}
          <ActiveComponent />
        </MiniWindow>
      )}
    </div>
  );
}

export default MiniApps;
