import React, { createContext, useContext, useState } from 'react';
import MiniWindow from './MiniWindow.jsx';

const MiniWindowContext = createContext();

export const MiniWindowProvider = ({ children }) => {
  const [miniWindowContent, setMiniWindowContent] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });
  const [miniWindowVisible, setMiniWindowVisible] = useState(false);

  // Call this from any component to open the mini window
  const openMiniWindow = (content, anchor = { x: 0, y: 0 }) => {
    setAnchorPos(anchor);
    setMiniWindowContent(() => content);
    setMiniWindowVisible(true);
  };

  const closeMiniWindow = () => {
    setMiniWindowVisible(false);
    // Wait for the fade-out transition to finish before unmounting
    setTimeout(() => {
      setMiniWindowContent(null);
    }, 300);
  };

  return (
    <MiniWindowContext.Provider value={{ openMiniWindow, closeMiniWindow }}>
      {children}
      {miniWindowContent && (
        <MiniWindow
          anchorPos={anchorPos}
          onClose={closeMiniWindow}
          visible={miniWindowVisible}
        >
          {miniWindowContent}
        </MiniWindow>
      )}
    </MiniWindowContext.Provider>
  );
};

export const useMiniWindow = () => {
  return useContext(MiniWindowContext);
};
