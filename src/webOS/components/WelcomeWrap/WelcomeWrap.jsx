// welcomewrap.jsx

//Thanks for the hello animation from here: https://codepen.io/steefmaster/pen/MWvdyGb

import React, { useEffect, useState } from 'react';
import messages from './messages';
import './WelcomeWrap.css';
import { useUIState } from '../../contexts/UIStateStorage/UIStateStorage';

const WelcomeWrap = () => {
  const totalDuration = 10; // Duration (in seconds) for the welcome phase
  const initialDelay = 1;   // White screen delay before the first message (in seconds)
  const messageCount = messages.length;
  // Each message is shown for an equal portion of the remaining time
  const messageDuration = (totalDuration - initialDelay) / messageCount;

  // Controls the display of the welcome messages and loading screen.
  const [showWelcome, setShowWelcome] = useState(true);
  const [showLoading, setShowLoading] = useState(false); // initially hidden
  // -1 indicates no message is shown yet (initial white screen phase)
  const [messageIndex, setMessageIndex] = useState(-1);
  // States for triggering fade outs
  const [fadeHello, setFadeHello] = useState(false);
  const [fadeLoading, setFadeLoading] = useState(false);
  // New state for fade-out of the welcome (white background) screen
  const [fadeWelcome, setFadeWelcome] = useState(false);

  // Get the UI state setters for dock, icon, and menubar visibility.
  const { setIsDockVisible, setIsIconVisible, setIsMenubarVisible } = useUIState();

  // On mount, hide the dock, icons, and menubar if they are showing.
  useEffect(() => {
    setIsDockVisible(false);
    setIsIconVisible(false);
    setIsMenubarVisible(false);
  }, [setIsDockVisible, setIsIconVisible, setIsMenubarVisible]);

  // After the welcome phase finishes, render the loading screen immediately,
  // then trigger the fade-out for the welcome screen.
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(true); // Render loading screen behind the welcome screen
      setFadeWelcome(true); // Start fading out the welcome screen
      // After fade-out animation (1s), remove the welcome screen
      setTimeout(() => {
        setShowWelcome(false);
      }, 1000);
    }, totalDuration * 1000);
    return () => clearTimeout(timer);
  }, [totalDuration]);

  // Cycle through welcome messages.
  useEffect(() => {
    if (!showWelcome) return;
    if (messageIndex === -1) {
      const timer = setTimeout(() => {
        setMessageIndex(0);
      }, initialDelay * 1000);
      return () => clearTimeout(timer);
    }
    if (messageIndex < messageCount - 1) {
      const timer = setTimeout(() => {
        setMessageIndex(messageIndex + 1);
      }, messageDuration * 1000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, messageIndex, messageCount, messageDuration, initialDelay]);

  // Handler for when the SVG animation finishes.
  const handleHelloAnimationEnd = () => {
    // Fade out the hello element.
    setFadeHello(true);
    // After its fade-out (1s), show the dock, icons, and menubar and then fade out the entire loading screen.
    setTimeout(() => {
      setIsDockVisible(true);    // Show the dock right before the loading screen fades out
      setIsIconVisible(true);    // Show icons as well
      setIsMenubarVisible(true); // Show the menubar as well
      setFadeLoading(true);
      // Finally remove the loading screen after its fade-out completes (1s).
      setTimeout(() => {
        setShowLoading(false);
      }, 1000);
    }, 1000);
  };

  return (
    <div>
      {showLoading && (
        <div className={`loading-screen ${fadeLoading ? 'fade-out' : ''}`}>
          <div className="loading-animation">
            <div className={`hello__div ${fadeHello ? 'fade-out' : ''}`}>
              <svg
                className="hello__svg"
                viewBox="0 0 1230.94 414.57"
                onAnimationEnd={handleHelloAnimationEnd}
              >
                <path d="M-293.58-104.62S-103.61-205.49-60-366.25c9.13-32.45,9-58.31,0-74-10.72-18.82-49.69-33.21-75.55,31.94-27.82,70.11-52.22,377.24-44.11,322.48s34-176.24,99.89-183.19c37.66-4,49.55,23.58,52.83,47.92a117.06,117.06,0,0,1-3,45.32c-7.17,27.28-20.47,97.67,33.51,96.86,66.93-1,131.91-53.89,159.55-84.49,31.1-36.17,31.1-70.64,19.27-90.25-16.74-29.92-69.47-33-92.79,16.73C62.78-179.86,98.7-93.8,159-81.63S302.7-99.55,393.3-269.92c29.86-58.16,52.85-114.71,46.14-150.08-7.44-39.21-59.74-54.5-92.87-8.7-47,65-61.78,266.62-34.74,308.53S416.62-58,481.52-130.31s133.2-188.56,146.54-256.23c14-71.15-56.94-94.64-88.4-47.32C500.53-375,467.58-229.49,503.3-127a73.73,73.73,0,0,0,23.43,33.67c25.49,20.23,55.1,16,77.46,6.32a111.25,111.25,0,0,0,30.44-19.87c37.73-34.23,29-36.71,64.58-127.53C724-284.3,785-298.63,821-259.13a71,71,0,0,1,13.69,22.56c17.68,46,6.81,80-6.81,107.89-12,24.62-34.56,42.72-61.45,47.91-23.06,4.45-48.37-.35-66.48-24.27a78.88,78.88,0,0,1-12.66-25.8c-14.75-51,4.14-88.76,11-101.41,6.18-11.39,37.26-69.61,103.42-42.24,55.71,23.05,100.66-23.31,100.66-23.31" transform="translate(311.08 476.02)" style={{ fill: 'none', stroke: '#fff', strokeLinecap: 'round', strokeMiterlimit: 10, strokeWidth: '35px' }} />
              </svg>
            </div>
          </div>
        </div>
      )}
      {showWelcome && (
        <div
          className={`welcome-wrap ${fadeWelcome ? 'fade-out' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white'
          }}
        >
          {messageIndex >= 0 && (
            <div
              key={messageIndex}
              className="welcome-message"
              style={{ animationDuration: `${messageDuration}s` }}
            >
              {messages[messageIndex]}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WelcomeWrap;
