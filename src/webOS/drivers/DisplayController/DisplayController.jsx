import React, { createContext, useState, useContext } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

// Create a context for brightness control
const BrightnessContext = createContext();

// Custom hook for accessing the brightness context
export const useBrightness = () => useContext(BrightnessContext);

const DisplayController = ({ children }) => {
  // Internal brightness state initialized to 100%
  const [brightness, setBrightness] = useState(100);

  // For the visual effect:
  // - If brightness is below 10, use 10 as the minimum brightness.
  // - If brightness equals 97, treat it as 100.
  const effectiveBrightness =
    brightness < 10 ? 10 : brightness === 97 ? 100 : brightness;

  // Calculate overlay opacity: at 100% brightness opacity is 0, at 10% brightness it's 0.9.
  const overlayOpacity = (100 - effectiveBrightness) / 100;

  // Style for the overlay that covers the entire screen
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'black',
    opacity: overlayOpacity,
    pointerEvents: 'none', // Allows mouse interactions to pass through
    zIndex: 9999, // Ensures the overlay is on top of everything
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
