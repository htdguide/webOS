// main.jsx

import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BIOS from '../src/BIOS/BIOS';

const Main = () => {
  useEffect(() => {
    // Prevent all scrolling
    const preventDefault = (e) => {
      e.preventDefault();
    };

    // Block wheel, touchmove, text selection start, and context menu (long-press)
    document.addEventListener('wheel', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('selectstart', preventDefault);
    document.addEventListener('contextmenu', preventDefault);

    return () => {
      document.removeEventListener('wheel', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('selectstart', preventDefault);
      document.removeEventListener('contextmenu', preventDefault);
    };
  }, []);

  return (
    <StrictMode>
      <BIOS />
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
