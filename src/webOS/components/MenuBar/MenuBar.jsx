/*
  MenuBar.jsx

  This file defines the “MenuBar” component, rendering the home icon,
  handling dark/light modes, showing or hiding based on persisted state,
  and initializing an appear animation on first load. No date or clock
  is rendered in this version.

  Topics:
    1. Imports
    2. Animation Injection & State
    3. Core State & Effects
    4. JSX Render
*/

//// 1. Imports /////////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import './MenuBar.css';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import MiniApps from '../MiniApps/MiniApps';
// Use the new StateManager hook instead of the old UIStateStorage.
import { useStateManager } from '../../stores/StateManager/StateManager';
// Import the PNG file
import kiwiIcon from '../../media/icons/kiwiicon.png';

//// 2. Animation Injection & State /////////////////////////////////////////////////

// Injects keyframes and the `.animate` helper class for fade-in slide-down
function useFadeInAnimation() {
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.type = 'text/css';
    styleEl.innerText = `
      @keyframes fadeInMenuBar {
        from { opacity: 0; transform: translateY(-100%); }
        to   { opacity: 1; transform: translateY(0);     }
      }
      .menu-bar.animate {
        animation: fadeInMenuBar 0.5s ease-out;
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);
}

//// 3. Core State & Effects ////////////////////////////////////////////////////////

function MenuBar({ darkMode = false }) {
  // Inject animation CSS once per mount
  useFadeInAnimation();

  const deviceInfo = useDeviceInfo();
  const { state } = useStateManager();

  // Read menubarVisible from the "desktop" group (stored as a string)
  const menubarVisibleStr =
    state.groups.desktop && state.groups.desktop.menubarVisible;
  const isMenubarVisible =
    menubarVisibleStr === 'false' ? false : true;

  // Local state to control adding the “animate” class on first render
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Trigger the appear animation exactly once when menubar becomes visible
  useEffect(() => {
    if (isMenubarVisible) {
      setShouldAnimate(true);
    }
  }, [isMenubarVisible]);

  //// 4. JSX Render /////////////////////////////////////////////////////////////////

  return (
    <div
      className={
        `menu-bar ` +
        `${isMenubarVisible ? 'visible' : 'hidden'} ` +
        `${darkMode ? 'dark-mode' : 'light-mode'} ` +
        `${shouldAnimate ? 'animate' : ''}`
      }
    >
      <div className="menu-left">
        <a href="/" className="menu-item">
          <img src={kiwiIcon} alt="Home" className="menu-item-icon" />
        </a>
      </div>
      <div className="menu-user-info">
        {/* MiniApps sits here; no date/clock rendered */}
        <MiniApps />
      </div>
    </div>
  );
}

export default MenuBar;
