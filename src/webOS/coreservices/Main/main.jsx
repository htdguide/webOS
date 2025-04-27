// main.jsx
import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import System from '../System/System.jsx';
import SystemUI from '../SystemUI/SystemUI.jsx';

const Main = () => {

  return (
    <StrictMode>
      <System>
        <SystemUI />
      </System>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
