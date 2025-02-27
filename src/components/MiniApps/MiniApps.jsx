import React, { useState } from 'react';
import MiniWindow from '../MiniWindow/MiniWindow';
import MiniAppsList from '../../lists/MiniAppsList';

function MiniApps() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });

  const handleAppClick = (appItem, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorPos({ x: rect.left, y: rect.top + rect.height });
    setActiveApp(activeApp && activeApp.id === appItem.id ? null : appItem);
  };

  // Sort apps by priority (right to left display order)
  const sortedApps = MiniAppsList.slice()
    .sort((a, b) => a.priority - b.priority)
    .reverse();

  const ActiveComponent = activeApp ? activeApp.miniApp : null;

  return (
    <div
      className="menu-bar-icons"
      style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}
    >
      {sortedApps.map((appItem) => {
        const { id, name, barApp: BarApp } = appItem;

        return (
          <div
            key={id}
            className="menu-bar-app"
            onClick={(e) => handleAppClick(appItem, e)}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
          >
            {BarApp ? <BarApp /> : <img src={appItem.icon} alt={name} className="menu-bar-icon" style={{ width: '30px', height: '30px' }} />}
          </div>
        );
      })}

      {/* Render the miniwindow if an app is active */}
      {activeApp && ActiveComponent && (
        <MiniWindow anchorPos={anchorPos} onClose={() => setActiveApp(null)}>
          <ActiveComponent />
        </MiniWindow>
      )}
    </div>
  );
}

export default MiniApps;
