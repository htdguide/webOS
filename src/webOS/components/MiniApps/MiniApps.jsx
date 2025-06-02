// src/components/MiniApps/MiniApps.jsx

import React, { useState, useRef, useEffect } from 'react';
import MiniAppsList from '../../lists/MiniAppsList';
import { FocusWrapper, useFocus } from '../../contexts/FocusControl/FocusControl.jsx';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { useMiniWindow } from '../MiniWindow/MiniWindowProvider.jsx';
import { useLogger } from '../Logger/Logger.jsx';
import './MiniApps.css';

function MiniApps() {
  const { log, enabled } = useLogger('MiniApps');
  const [activeApp, setActiveApp] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const iconRefs = useRef({});
  const { focusedComponent } = useFocus();
  const deviceInfo = useDeviceInfo();
  const { openMiniWindow, closeMiniWindow } = useMiniWindow();

  // Log mount/unmount
  useEffect(() => {
    if (enabled) log('lifecycle', 'MiniApps mounted');
    return () => {
      if (enabled) log('lifecycle', 'MiniApps unmounted');
    };
  }, [enabled]);

  // Log activeApp changes
  useEffect(() => {
    if (enabled) {
      const id = activeApp ? activeApp.id : 'null';
      log('state', `activeApp changed to "${id}"`);
    }
  }, [activeApp, enabled]);

  // Log anchor position updates
  useEffect(() => {
    if (enabled) {
      log('layout', `anchorPos updated to x=${anchorPos.x}, y=${anchorPos.y}`);
    }
  }, [anchorPos, enabled]);

  // Helper: Get the bounding rectangle of the monitor container.
  // Here we assume the monitor container has the class "desktop-monitor".
  const getMonitorRect = () => {
    const monitorDiv = document.querySelector('.desktop-monitor');
    const rect = monitorDiv ? monitorDiv.getBoundingClientRect() : null;
    if (enabled) {
      log('layout', `getMonitorRect called, result: ${rect ? `left=${rect.left}, top=${rect.top}, width=${rect.width}, height=${rect.height}` : 'null'}`);
    }
    return rect;
  };

  // Update the anchor position relative to the monitor container.
  // The anchor is now set so that its x is the left side of the icon.
  const updateAnchorPosition = (appId) => {
    if (enabled) log('action', `updateAnchorPosition called for "${appId}"`);
    if (iconRefs.current[appId]) {
      const iconEl = iconRefs.current[appId];
      const monitorRect = getMonitorRect() || iconEl.parentNode.getBoundingClientRect();
      if (enabled) {
        log('layout', `Using monitorRect: left=${monitorRect.left}, top=${monitorRect.top}`);
      }
      const rect = iconEl.getBoundingClientRect();
      const newAnchor = {
        x: rect.left - monitorRect.left,
        y: rect.top - monitorRect.top + rect.height,
      };
      if (enabled) {
        log('layout', `Calculated newAnchor for "${appId}": x=${newAnchor.x}, y=${newAnchor.y}`);
      }
      setAnchorPos(newAnchor);
      if (activeApp) {
        if (enabled) log('action', `Opening mini window for activeApp "${appId}" at new anchor`);
        openMiniWindow(<activeApp.miniApp />, newAnchor);
      }
    } else {
      if (enabled) log('warning', `updateAnchorPosition: iconRefs.current["${appId}"] is undefined`);
    }
  };

  // Handle app click by toggling the mini window.
  const handleAppClick = (appItem) => {
    const { id } = appItem;
    if (enabled) log('userInteraction', `handleAppClick called for "${id}"`);
    if (activeApp && activeApp.id === id) {
      if (enabled) log('action', `Closing mini window for "${id}"`);
      setActiveApp(null);
      closeMiniWindow();
    } else {
      if (enabled) log('action', `Setting activeApp to "${id}" and opening mini window`);
      setActiveApp(appItem);
      if (iconRefs.current[id]) {
        const iconEl = iconRefs.current[id];
        const monitorRect = getMonitorRect() || iconEl.parentNode.getBoundingClientRect();
        if (enabled) {
          log('layout', `Using monitorRect for click: left=${monitorRect.left}, top=${monitorRect.top}`);
        }
        const rect = iconEl.getBoundingClientRect();
        const newAnchor = {
          x: rect.left - monitorRect.left,
          y: rect.top - monitorRect.top + rect.height,
        };
        if (enabled) {
          log('layout', `Calculated anchor on click for "${id}": x=${newAnchor.x}, y=${newAnchor.y}`);
        }
        setAnchorPos(newAnchor);
        openMiniWindow(<appItem.miniApp />, newAnchor);
      } else {
        if (enabled) log('warning', `handleAppClick: iconRefs.current["${id}"] is undefined`);
      }
    }
  };

  // Close mini window when focus is lost.
  useEffect(() => {
    if (focusedComponent !== 'MiniApps') {
      if (enabled) log('focus', `Focus lost from MiniApps (focusedComponent="${focusedComponent}"), closing mini window`);
      setActiveApp(null);
      closeMiniWindow();
    }
  }, [focusedComponent, closeMiniWindow, enabled]);

  // Update mini window position on window (or container) resize.
  useEffect(() => {
    const handleResize = () => {
      if (activeApp) {
        if (enabled) log('resize', `Window resized while activeApp="${activeApp.id}", updating anchor position`);
        updateAnchorPosition(activeApp.id);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (enabled) log('lifecycle', 'Removed window resize listener');
    };
  }, [activeApp, enabled]);

  // Filter and sort the apps.
  const sortedApps = MiniAppsList
    .filter(app => app.available)
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .reverse();

  if (enabled) {
    log('render', `Rendering MiniApps: ${sortedApps.length} app(s), activeApp="${activeApp ? activeApp.id : 'null'}", deviceInfo=${JSON.stringify(deviceInfo)}`);
  }

  return (
    <FocusWrapper name="MiniApps">
      <div className="menu-bar-icons" style={{ display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
        {sortedApps.map((appItem) => {
          const { id, name, barApp: BarApp, icon, iconSize = 30 } = appItem;
          const isActive = activeApp && activeApp.id === id;
          if (enabled) log('render', `Rendering icon "${id}", isActive=${isActive}`);
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
