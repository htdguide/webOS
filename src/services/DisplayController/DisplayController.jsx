import React, { createContext, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Create a context to allow child components to access brightness controls
const BrightnessContext = createContext();

// Custom hook for accessing the brightness context
export const useBrightness = () => useContext(BrightnessContext);

const DisplayController = ({ children }) => {
  // Internal state: brightness defaults to 100%
  const [brightness, setBrightness] = useState(100);

  // Clamp brightness between 0 and 100
  const clampedBrightness = Math.min(100, Math.max(0, brightness + 3));
  // Calculate overlay opacity: 0 when brightness is 100, 1 when brightness is 0
  const overlayOpacity = (100 - clampedBrightness) / 100;

  // Style for the overlay that covers the entire screen
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    opacity: overlayOpacity,
    pointerEvents: 'none', // Ensures overlay doesn't intercept any mouse events
    zIndex: 9999, // Place it on top of everything
  };

  return (
    <BrightnessContext.Provider value={{ brightness, setBrightness }}>
      <>
        {children}
        {ReactDOM.createPortal(
          <div style={overlayStyle} />,
          document.body
        )}
      </>
    </BrightnessContext.Provider>
  );
};

DisplayController.propTypes = {
  children: PropTypes.node,
};

export default DisplayController;
