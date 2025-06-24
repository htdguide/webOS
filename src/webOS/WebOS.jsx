// main.jsx
import React from 'react';
import System from './coreservices/System/System.jsx';
import MissionControl from './coreservices/MissionControl/MissionControl.jsx';
import "./WebOS.css";

const WebOS = () => {

  const webOSver = import.meta.env.VITE_APP_WEBOS_VERSION;
  return (
    <System>
      <MissionControl/>
      <div className='version'>
        v{webOSver} alpha test
      </div>
    </System>
  );
};

export default WebOS;



