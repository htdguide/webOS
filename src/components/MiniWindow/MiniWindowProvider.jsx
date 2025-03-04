import React, { createContext, useContext, useState } from 'react';
import MiniWindow from './MiniWindow.jsx';

const MiniWindowContext = createContext();

export const MiniWindowProvider = ({ children }) => {
  const [miniWindowContent, setMiniWindowContent] = useState(null);
  const [anchorPos, setAnchorPos] = useState({ x: 0, y: 0 });

  // Call this from any component to open the mini window
  const openMiniWindow = (content, anchor = { x: 0, y: 0 }) => {
    setAnchorPos(anchor);
    setMiniWindowContent(() => content);
  };

  const closeMiniWindow = () => {
    setMiniWindowContent(null);
  };

  return (
    <MiniWindowContext.Provider value={{ openMiniWindow, closeMiniWindow }}>
      {children}
      {miniWindowContent && (
        <MiniWindow anchorPos={anchorPos} onClose={closeMiniWindow}>
          {miniWindowContent}
        </MiniWindow>
      )}
    </MiniWindowContext.Provider>
  );
};

export const useMiniWindow = () => {
  return useContext(MiniWindowContext);
};
