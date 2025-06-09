import React, { createContext, useState } from 'react';

export const FullscreenContext = createContext({
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
    <FullscreenContext.Provider
      value={{ isFullscreen, fullscreenWindowId, enterFullscreen, exitFullscreen }}
    >
      {children}
    </FullscreenContext.Provider>
  );
};
