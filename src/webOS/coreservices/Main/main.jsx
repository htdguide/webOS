// main.jsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import System from '../System/System.jsx';
import MissionControl from '../MissionControl/MissionControl.jsx';

const Main = () => {

  return (
    <StrictMode>
      <System>
        <div className='display-container'>
        <MissionControl/>
        </div>
        <div className="version">
        v0.2.4 alpha
      </div>
      </System>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
