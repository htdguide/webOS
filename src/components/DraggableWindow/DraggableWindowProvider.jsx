import React, { createContext, useContext, useState, useRef } from 'react';
import DraggableWindow from './DraggableWindow.jsx';

const DraggableWindowContext = createContext();

export const DraggableWindowProvider = ({ children }) => {
  const [windowProps, setWindowProps] = useState(null);
  const draggableWindowRef = useRef(null);

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
    onResize, // new optional callback
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
    });
  };

  const closeDraggableWindow = () => {
    setWindowProps(null);
  };

  // Expose imperative methods from the DraggableWindow component.
  const showLoading = () => {
    if (draggableWindowRef.current && draggableWindowRef.current.showLoading) {
      draggableWindowRef.current.showLoading();
    }
  };

  const hideLoading = () => {
    if (draggableWindowRef.current && draggableWindowRef.current.hideLoading) {
      draggableWindowRef.current.hideLoading();
    }
  };

  return (
    <DraggableWindowContext.Provider
      value={{ openDraggableWindow, closeDraggableWindow, showLoading, hideLoading }}
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
          onResize={windowProps.onResize} // pass onResize prop
        >
          {windowProps.content}
        </DraggableWindow>
      )}
    </DraggableWindowContext.Provider>
  );
};

export const useDraggableWindow = () => useContext(DraggableWindowContext);
