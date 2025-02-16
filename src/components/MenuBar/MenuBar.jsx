import React from 'react';
import './MenuBar.css';

function MenuBar() {
  return (
    <div className="menu-bar">
      <div className="menu-left">
        <a href="/" className="menu-item">Home</a>
        <a href="https://www.linkedin.com/in/htdguide/" className="menu-item">LinkedIn</a>
        <a href="https://github.com/htdguide" className="menu-item">GitHub</a>
      </div>
      <div className="menu-right">
        <span className="menu-username">htdguide</span>
      </div>
    </div>
  );
}

export default MenuBar;
