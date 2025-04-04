// DraggableWindowProvider.jsx
// This provider manages the state of a single draggable window and offers imperative methods
// (like showing a loading overlay, moving, or resizing the window). The provider now supports
// an optional iframeSrc property that, if set, tells the window to render an iframe in its content area.

import React, { createContext, useContext, useState, useRef } from 'react';
import DraggableWindow from './DraggableWindow.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';

// Create a context for the draggable window.
const DraggableWindowContext = createContext();

// Provider component that wraps your application and manages the draggable window.
export const DraggableWindowProvider = ({ children }) => {
  // State to store the current window's properties.
  const [windowProps, setWindowProps] = useState(null);
  const draggableWindowRef = useRef(null);

  // Get the current focused component from the FocusControl context.
  const { focusedComponent } = useFocus();
  // Determine if the draggable window is currently focused.
  const isWindowFocused = windowProps ? focusedComponent === windowProps.title : false;

  // Function to open a draggable window with given properties.
  // Now includes an optional iframeSrc property for rendering an iframe.
  const openDraggableWindow = ({
    title,
    windowWidth,
    windowHeight,
    minWindowWidth,
    minWindowHeight,
    maxWindowWidth,
    maxWindowHeight,
    content,
    onClose,
    onMount,
    onUnmount,
    onResize, // optional callback for resize events
    initialX, // initial horizontal position
    initialY, // initial vertical position
    iframeSrc, // new optional prop for the iframe URL
  }) => {
    setWindowProps({
      title,
      windowWidth,
      windowHeight,
      minWindowWidth,
      minWindowHeight,
      maxWindowWidth,
      maxWindowHeight,
      content,
      onClose,
      onMount,
      onUnmount,
      onResize,
      initialX,
      initialY,
      iframeSrc, // pass along the iframe source URL
    });
    // Note: The DraggableWindow component handles focus on mount.
  };

  // Function to close the draggable window.
  const closeDraggableWindow = () => {
    setWindowProps(null);
  };

  // Imperative method to show the loading overlay.
  const showLoading = () => {
    if (draggableWindowRef.current && draggableWindowRef.current.showLoading) {
      draggableWindowRef.current.showLoading();
    }
  };

  // Imperative method to hide the loading overlay.
  const hideLoading = () => {
    if (draggableWindowRef.current && draggableWindowRef.current.hideLoading) {
      draggableWindowRef.current.hideLoading();
    }
  };

  // Imperative method to resize the draggable window.
  const resizeDraggableWindow = (newWidth, newHeight) => {
    if (draggableWindowRef.current && draggableWindowRef.current.resizeWindow) {
      draggableWindowRef.current.resizeWindow(newWidth, newHeight);
    }
  };

  // Imperative method to move the draggable window.
  const moveDraggableWindow = (newX, newY) => {
    if (draggableWindowRef.current && draggableWindowRef.current.moveWindow) {
      draggableWindowRef.current.moveWindow(newX, newY);
    }
  };

  return (
    <DraggableWindowContext.Provider
      value={{
        openDraggableWindow,
        closeDraggableWindow,
        showLoading,
        hideLoading,
        resizeDraggableWindow,
        moveDraggableWindow,
        isWindowFocused,
      }}
    >
      {children}
      {windowProps && (
        <DraggableWindow
          ref={draggableWindowRef}
          title={windowProps.title}
          windowWidth={windowProps.windowWidth}
          windowHeight={windowProps.windowHeight}
          minWindowWidth={windowProps.minWindowWidth}
          minWindowHeight={windowProps.minWindowHeight}
          maxWindowWidth={windowProps.maxWindowWidth}
          maxWindowHeight={windowProps.maxWindowHeight}
          onClose={() => {
            if (windowProps.onClose) windowProps.onClose();
            closeDraggableWindow();
          }}
          onMount={windowProps.onMount}
          onUnmount={windowProps.onUnmount}
          onResize={windowProps.onResize} // pass the onResize callback
          initialX={windowProps.initialX}
          initialY={windowProps.initialY}
          iframeSrc={windowProps.iframeSrc} // pass iframeSrc so DraggableWindow knows to render an iframe
        >
          {windowProps.content}
        </DraggableWindow>
      )}
    </DraggableWindowContext.Provider>
  );
};

// Custom hook to access the DraggableWindowContext.
export const useDraggableWindow = () => useContext(DraggableWindowContext);
