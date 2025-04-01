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

// Retrieve the initial dock visibility state from local storage if available,
// otherwise, default to visible (true)
const getInitialDockVisibility = () => {
  const stored = localStorage.getItem('isDockVisible');
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return false;
};

// Retrieve the initial icon visibility state from local storage if available,
// otherwise, default to visible (true)
const getInitialIconVisibility = () => {
  const stored = localStorage.getItem('isIconVisible');
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return true;
};

// Retrieve the initial menubar visibility state from local storage if available,
// otherwise, default to visible (true)
const getInitialMenubarVisibility = () => {
  const stored = localStorage.getItem('isMenubarVisible');
  if (stored !== null) {
    return JSON.parse(stored);
  }
  return true;
};

// Provider component that holds the UI state
export const UIStateProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode());
  const [isDockVisible, setIsDockVisible] = useState(getInitialDockVisibility());
  const [isIconVisible, setIsIconVisible] = useState(getInitialIconVisibility());
  const [isMenubarVisible, setIsMenubarVisible] = useState(getInitialMenubarVisibility());

  // Persist dark mode state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist dock visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDockVisible', JSON.stringify(isDockVisible));
  }, [isDockVisible]);

  // Persist icon visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isIconVisible', JSON.stringify(isIconVisible));
  }, [isIconVisible]);

  // Persist menubar visibility state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isMenubarVisible', JSON.stringify(isMenubarVisible));
  }, [isMenubarVisible]);

  // Function to toggle icon visibility
  const toggleIconVisibility = () => {
    setIsIconVisible(prev => !prev);
  };

  // Function to toggle menubar visibility
  const toggleMenubarVisibility = () => {
    setIsMenubarVisible(prev => !prev);
  };

  return (
    <UIStateContext.Provider value={{
      isDarkMode, setIsDarkMode,
      isDockVisible, setIsDockVisible,
      isIconVisible, setIsIconVisible,
      isMenubarVisible, setIsMenubarVisible,
      toggleIconVisibility,
      toggleMenubarVisibility
    }}>
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
