// TerminalSettingsProvider.jsx
import React, { createContext, useContext, useState } from 'react';

const TerminalSettingsContext = createContext();

export const TerminalSettingsProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState('12px');
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('monospace');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF'); // new background color setting

  return (
    <TerminalSettingsContext.Provider
      value={{
        fontSize,
        setFontSize,
        fontColor,
        setFontColor,
        fontFamily,
        setFontFamily,
        backgroundColor,
        setBackgroundColor,
      }}
    >
      {children}
    </TerminalSettingsContext.Provider>
  );
};

export const useTerminalSettings = () => {
  const context = useContext(TerminalSettingsContext);
  if (!context) {
    throw new Error('useTerminalSettings must be used within a TerminalSettingsProvider');
  }
  return context;
};
