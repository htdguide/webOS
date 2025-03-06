import React, { useState, useRef, useEffect } from 'react';
import MiniAppsList from '../../lists/MiniAppsList';
import { FocusWrapper, useFocus } from '../../interactions/FocusControl/FocusControl.jsx';
import { useDeviceInfo } from '../../services/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { useMiniWindow } from '../MiniWindow/MiniWindowProvider.jsx';
import './MiniApps.css';

function MiniApps() {
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const iconRefs = useRef({});
  const { focusedComponent } = useFocus();
  const deviceInfo = useDeviceInfo();
  const { openMiniWindow, closeMiniWindow } = useMiniWindow();

  // Update anchor position and, if needed, update the mini window position
  const updateAnchorPosition = (appId) => {
    if (iconRefs.current[appId]) {
      const rect = iconRefs.current[appId].getBoundingClientRect();
      const newAnchor = { x: rect.left, y: rect.top + rect.height };
      setAnchorPos(newAnchor);
      if (activeApp) {
        openMiniWindow(<activeApp.miniApp />, newAnchor);
      }
    }
  };

  // Handle app click by toggling the mini window via the provider
  const handleAppClick = (appItem) => {
    if (activeApp && activeApp.id === appItem.id) {
      setActiveApp(null);
      closeMiniWindow();
    } else {
      setActiveApp(appItem);
      if (iconRefs.current[appItem.id]) {
        const rect = iconRefs.current[appItem.id].getBoundingClientRect();
        const newAnchor = { x: rect.left, y: rect.top + rect.height };
        setAnchorPos(newAnchor);
        openMiniWindow(<appItem.miniApp />, newAnchor);
      }
    }
  };

  // Close mini window when focus is lost
  useEffect(() => {
    if (focusedComponent !== 'MiniApps') {
      setActiveApp(null);
      closeMiniWindow();
    }
  }, [focusedComponent, closeMiniWindow]);

  // Update mini window position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (activeApp) {
        updateAnchorPosition(activeApp.id);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeApp]);

  // Filter apps:
  // - Only include apps with available: true.
  // - For battery app, hide if battery info is not available.
  // - For user app, hide in portrait orientation.
  const sortedApps = MiniAppsList
    .filter(app => app.available)
    .filter(app => {
      if (app.id === 'battery' && deviceInfo.battery.level === null) return false;
      return true;
    })
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
