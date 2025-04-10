// MiniApps.jsx
import React, { useState, useRef, useEffect } from 'react';
import MiniAppsList from '../../lists/MiniAppsList';
import { FocusWrapper, useFocus } from '../../contexts/FocusControl/FocusControl.jsx';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { useMiniWindow } from '../MiniWindow/MiniWindowProvider.jsx';
import './MiniApps.css';

function MiniApps() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const iconRefs = useRef({});
  const { focusedComponent } = useFocus();
  const deviceInfo = useDeviceInfo();
  const { openMiniWindow, closeMiniWindow } = useMiniWindow();

  // Helper: Get the bounding rectangle of the monitor container.
  // Here we assume the monitor container has the class "desktop-monitor".
  const getMonitorRect = () => {
    const monitorDiv = document.querySelector('.desktop-monitor');
    return monitorDiv ? monitorDiv.getBoundingClientRect() : null;
  };

  // Update the anchor position relative to the monitor container.
  // The anchor is now set so that its x is the left side of the icon.
  const updateAnchorPosition = (appId) => {
    if (iconRefs.current[appId]) {
      const iconEl = iconRefs.current[appId];
      const monitorRect = getMonitorRect() || iconEl.parentNode.getBoundingClientRect();
      const rect = iconEl.getBoundingClientRect();
      // Anchor position: left edge of the icon; y is at the bottom.
      const newAnchor = {
        x: rect.left - monitorRect.left,
        y: (rect.top - monitorRect.top) + rect.height,
      };
      setAnchorPos(newAnchor);
      if (activeApp) {
        openMiniWindow(<activeApp.miniApp />, newAnchor);
      }
    }
  };

  // Handle app click by toggling the mini window.
  const handleAppClick = (appItem) => {
    if (activeApp && activeApp.id === appItem.id) {
      setActiveApp(null);
      closeMiniWindow();
    } else {
      setActiveApp(appItem);
      if (iconRefs.current[appItem.id]) {
        const iconEl = iconRefs.current[appItem.id];
        const monitorRect = getMonitorRect() || iconEl.parentNode.getBoundingClientRect();
        const rect = iconEl.getBoundingClientRect();
        const newAnchor = {
          x: rect.left - monitorRect.left,
          y: (rect.top - monitorRect.top) + rect.height,
        };
        setAnchorPos(newAnchor);
        openMiniWindow(<appItem.miniApp />, newAnchor);
      }
    }
  };

  // Close mini window when focus is lost.
  useEffect(() => {
    if (focusedComponent !== 'MiniApps') {
      setActiveApp(null);
      closeMiniWindow();
    }
  }, [focusedComponent, closeMiniWindow]);

  // Update mini window position on window (or container) resize.
  useEffect(() => {
    const handleResize = () => {
      if (activeApp) {
        updateAnchorPosition(activeApp.id);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeApp]);

  // Filter and sort the apps.
  const sortedApps = MiniAppsList
    .filter(app => app.available)
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .reverse();

  return (
    <FocusWrapper name="MiniApps">
      <div className="menu-bar-icons" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
        {sortedApps.map((appItem) => {
          const { id, name, barApp: BarApp, icon, iconSize = 30 } = appItem;
          const isActive = activeApp && activeApp.id === id;

          return (
            <div
              key={id}
              className={`menu-bar-app ${isActive ? 'active' : ''}`}
              ref={(el) => (iconRefs.current[id] = el)}
              onClick={() => handleAppClick(appItem)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                pointerEvents: 'auto',
                height: '25px',
                marginLeft: '18px',
                borderRadius: '6px',
                background: isActive ? 'rgba(0, 0, 0, 0.15)' : 'transparent',
              }}
            >
              {BarApp ? (
                <BarApp />
              ) : (
                <img
                  src={icon}
                  alt={name}
                  className="menu-bar-icon"
                  style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
                />
              )}
            </div>
          );
        })}
      </div>
    </FocusWrapper>
  );
}

export default MiniApps;
