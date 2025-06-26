// main.jsx

import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BIOS from '../src/BIOS/BIOS';

const Main = () => {
  useEffect(() => {
    // Prevent wheel-based scrolling
    const preventScroll = (e) => {
      e.preventDefault();
    };

    // Add listeners for both mouse wheel and touch moves
    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });

    // Clean up on unmount
    return () => {
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <StrictMode>
      <BIOS />
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
