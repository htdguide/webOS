// main.jsx
import React from 'react';
import System from './coreservices/System/System.jsx';
import MissionControl from './coreservices/MissionControl/MissionControl.jsx';
import "./webOS.css";

const WebOS = () => {

  return (
    <System>
      <MissionControl/>
      <div className='version'>
        version 0.2.4
      </div>
    </System>
  );
};

export default WebOS;



