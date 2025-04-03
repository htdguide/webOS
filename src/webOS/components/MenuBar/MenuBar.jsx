import React, { useState, useEffect } from 'react';
import './MenuBar.css';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import MiniApps from '../MiniApps/MiniApps';
// Use the new StateManager hook instead of the old UIStateStorage.
import { useStateManager } from '../../stores/StateManager/StateManager';

function MenuBar({ darkMode = false }) {
  const deviceInfo = useDeviceInfo();
  // Get state from the new StateManager.
  const { state } = useStateManager();
  // Read menubarVisible from the "desktop" group (stored as a string).
  const menubarVisibleStr = state.groups.desktop && state.groups.desktop.menubarVisible;
  // Only if the value is exactly "false" then it is hidden; otherwise it is visible.
  const isMenubarVisible = menubarVisibleStr === "false" ? false : true;
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function renderFormattedTime(date) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    const [hm, ampm] = timeStr.split(' ');
    const [hour, minute] = hm.split(':');

    if (deviceInfo && deviceInfo.orientation === 'portrait') {
      return (
        <span>
          <span className="time-hour">{hour}</span>
          <span className="time-colon">:</span>
          <span className="time-minute">{minute}</span>
        </span>
      );
    } else {
      return (
        <span>
          {weekday} {day} {month}&nbsp;&nbsp;&nbsp;
          <span className="time-hour">{hour}</span>
          <span className="time-colon">:</span>
          <span className="time-minute">{minute}</span> {ampm}
        </span>
      );
    }
  }

  return (
    <div className={`menu-bar ${isMenubarVisible ? 'visible' : 'hidden'} ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="menu-left">
        <a href="/" className="menu-item">Home</a>
      </div>
      <div className="menu-user-info">
        {/* You can include formatted time or additional UI elements here */}
        <MiniApps />
      </div>
    </div>
  );
}

export default MenuBar;
