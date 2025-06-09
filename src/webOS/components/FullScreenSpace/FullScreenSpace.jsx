import React, { createContext, useState } from 'react';

//This file creates empty space for full screen

export const FullscreenSpace = createContext({
  isFullscreen: false,
  fullscreenWindowId: null,
  enterFullscreen: (id) => {},
  exitFullscreen: () => {},
});

export const FullscreenProvider = ({ children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenWindowId, setFullscreenWindowId] = useState(null);

  const enterFullscreen = (windowId) => {
    setFullscreenWindowId(windowId);
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenWindowId(null);
  };

  return (
    <FullscreenSpace.Provider
      value={{ isFullscreen, fullscreenWindowId, enterFullscreen, exitFullscreen }}
    >
      {children}
    </FullscreenSpace.Provider>
  );
};
