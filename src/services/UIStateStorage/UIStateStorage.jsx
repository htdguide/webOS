import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for the UI state
const UIStateContext = createContext();

// Function to determine default dark mode based on current local time
const getDefaultDarkMode = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  // Enable dark mode if it's after 7:30 PM or before 7:00 AM
  if (hours > 19 || (hours === 19 && minutes >= 30)) return true;
  if (hours < 7) return true;
  return false;
};

// Retrieve the initial dark mode state from local storage if available,
// otherwise, use the default determined by the current time
const getInitialDarkMode = () => {
  const stored = localStorage.getItem('isDarkMode');
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return getDefaultDarkMode();
};

// Provider component that holds the UI state
export const UIStateProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode());

  // Persist dark mode state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  return (
    <UIStateContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </UIStateContext.Provider>
  );
};

// Custom hook to access the UI state in any component
export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
};
