import React, { createContext, useState } from 'react';

// Context for fullscreen management, now also carries wrapId
export const FullscreenSpace = createContext({
  isFullscreen: false,
  fullscreenWindowId: null,
  wrapId: null,
  enterFullscreen: () => {},
  exitFullscreen: () => {},
});

export const FullscreenProvider = ({ children, wrapId }) => {
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
      value={{
        isFullscreen,
        fullscreenWindowId,
        wrapId,
        enterFullscreen,
        exitFullscreen
      }}
    >
      {children}
    </FullscreenSpace.Provider>
  );
};
