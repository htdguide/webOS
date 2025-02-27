import React, { useState, useRef, useEffect } from 'react';
import MiniWindow from '../MiniWindow/MiniWindow';
import MiniAppsList from '../../lists/MiniAppsList';

function MiniApps() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const iconRefs = useRef({}); // Store refs dynamically

  const updateAnchorPosition = (appId) => {
    if (iconRefs.current[appId]) {
      const rect = iconRefs.current[appId].getBoundingClientRect();
      setAnchorPos({ x: rect.left, y: rect.top + rect.height });
    }
  };

  const handleAppClick = (appItem) => {
    if (activeApp && activeApp.id === appItem.id) {
      setActiveApp(null);
    } else {
      setActiveApp(appItem);
      updateAnchorPosition(appItem.id);
    }
  };

  // Update miniwindow position when window resizes
  useEffect(() => {
    const handleResize = () => {
      if (activeApp) updateAnchorPosition(activeApp.id);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeApp]);

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
            ref={(el) => (iconRefs.current[id] = el)} // Assign ref dynamically
            onClick={() => handleAppClick(appItem)}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '20px',
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
