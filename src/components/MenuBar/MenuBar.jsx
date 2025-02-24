import React, { useState, useEffect } from 'react';
import './MenuBar.css';
import { useDeviceInfo } from '../../services/DeviceInfoProvider';

function MenuBar() {
  const deviceInfo = useDeviceInfo();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function renderFormattedTime(date) {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const [hm, ampm] = timeStr.split(' ');
    const [hour, minute] = hm.split(':');

    if (deviceInfo && deviceInfo.orientation === 'portrait') {
      // In portrait mode, display only the time (e.g., "11:47")
      return (
        <span>
          <span className="time-hour">{hour}</span>
          <span className="time-colon">:</span>
          <span className="time-minute">{minute}</span>
        </span>
      );
    } else {
      // In landscape mode, display date and time (e.g., "Tue 25 Feb   11:06 AM")
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
    <div className="menu-bar">
      <div className="menu-left">
        <a href="/" className="menu-item">Home</a>
        <a href="https://www.linkedin.com/in/htdguide/" className="menu-item">LinkedIn</a>
        <a href="https://github.com/htdguide" className="menu-item">GitHub</a>
      </div>
      <div className="menu-user-info">
        <span className="menu-username">htdguide</span>
        <span className="menu-time">{renderFormattedTime(currentTime)}</span>
      </div>
    </div>
  );
}

export default MenuBar;
