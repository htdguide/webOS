import React, { createContext, useContext, useState, useEffect } from "react";

// Create a context to store the focused component
const FocusContext = createContext();

// Provider to manage focus state
export const FocusProvider = ({ children }) => {
  const [focusedComponent, setFocusedComponent] = useState(
    localStorage.getItem("focusedComponent") || null
  );

  // Function to update focus state
  const updateFocus = (name) => {
    if (focusedComponent !== name) { // Only log if focus changes
      console.log("Current Focus:", name);
    }
    setFocusedComponent(name);
    localStorage.setItem("focusedComponent", name);
  };

  return (
    <FocusContext.Provider value={{ focusedComponent, updateFocus }}>
      {children}
    </FocusContext.Provider>
  );
};

// Custom hook to use the focus context
export const useFocus = () => {
  return useContext(FocusContext);
};

// Wrapper component to track focus on its children
export const FocusWrapper = ({ name, children }) => {
  const { updateFocus } = useFocus();

  // Function to handle focus events
  const handleFocus = () => {
    updateFocus(name);
  };

  return (
    <div onClick={handleFocus} onKeyDown={handleFocus} onTouchStart={handleFocus} tabIndex={0}>
      {children}
    </div>
  );
};
