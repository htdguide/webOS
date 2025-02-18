import React, { useState, useEffect } from 'react';
import './MenuBar.css';

function MenuBar() {
  const [currentTime, setCurrentTime] = useState(getFormattedTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function getFormattedTime() {
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
    let time = new Date().toLocaleString('en-US', options);
    return time.replace(/,/g, '').replace(' AM', 'AM').replace(' PM', 'PM');
  }

  return (
    <div className="menu-bar">
      <div className="menu-left">
        <a href="/" className="menu-item">Home</a>
        <a href="https://www.linkedin.com/in/htdguide/" className="menu-item">LinkedIn</a>
        <a href="https://github.com/htdguide" className="menu-item">GitHub</a>
      </div>
      <div className="menu-right">
        <span className="menu-username">htdguide</span>
        <span className="menu-time">{currentTime}</span>
      </div>
    </div>
  );
}

export default MenuBar;
