/**
 * This file renders the WebOS component, including System and MissionControl,
 * and provides a unified pointer-based toggle for debug outlines on all <div> elements.
 *
 * Areas:
 * 1: Imports and dependencies
 * 2: WebOS component definition
 *   2.1: State & effects for debug mode
 *   2.2: Debug toggle handler
 *   2.3: Render with pointer event
 */

////////////////////
// Area 1: Imports and dependencies
import React, { useState, useEffect } from 'react';
import System from './coreservices/System/System.jsx';
import MissionControl from './coreservices/MissionControl/MissionControl.jsx';
import "./webOS.css";

////////////////////
// Area 2: WebOS component definition
const WebOS = () => {
  // 2.1: State & effects for debug mode
  const [debugMode, setDebugMode] = useState(false);
  useEffect(() => {
    document.body.classList.toggle('debug-mode', debugMode);
    return () => {
      document.body.classList.remove('debug-mode');
    };
  }, [debugMode]);

  // 2.2: Debug toggle handler using pointer events
  const handleToggleDebug = () => {
    setDebugMode(prev => !prev);
  };

  const webOSver = import.meta.env.VITE_APP_WEBOS_VERSION;

  // 2.3: Render with pointer event on version label
  return (
    <System>
      <MissionControl />
      <div
        className="version"
        onPointerUp={handleToggleDebug}
      >
        v{webOSver} press to debug
      </div>
    </System>
  );
};

export default WebOS;
