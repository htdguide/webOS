// DraggableWindowProvider.jsx
import React, { createContext, useContext, useState, useRef } from 'react';
import DraggableWindow from './DraggableWindow.jsx';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';

const DraggableWindowContext = createContext();

export const DraggableWindowProvider = ({ children }) => {
  // an array of window-prop objects
  const [windows, setWindows] = useState([]);
  // refs keyed by window title
  const windowRefs = useRef({});

  // pull focus state & updater into the provider
  const { focusedComponent, updateFocus } = useFocus();

  /**
   * Opens a window unless one with the same title is already open.
   * We do the dedupe check inside setWindows' functional updater,
   * so even back-to-back calls in the same tick won’t add twice.
   */
  const openDraggableWindow = (props) => {
    const { title } = props;
    setWindows(prev => {
      if (prev.some(w => w.title === title)) return prev;
      if (!windowRefs.current[title]) {
        windowRefs.current[title] = React.createRef();
      }
      return [...prev, props];
    });
  };

  const closeDraggableWindow = (title) => {
    setWindows(prev => prev.filter(w => w.title !== title));
  };

  // Imperative APIs
  const showLoading = (title) => {
    windowRefs.current[title]?.current?.showLoading();
  };
  const hideLoading = (title) => {
    windowRefs.current[title]?.current?.hideLoading();
  };
  const resizeDraggableWindow = (title, newW, newH) => {
    windowRefs.current[title]?.current?.resizeWindow(newW, newH);
  };
  const moveDraggableWindow = (title, newX, newY) => {
    windowRefs.current[title]?.current?.moveWindow(newX, newY);
  };

  // Context value exposed to consumers
  const contextValue = {
    openDraggableWindow,
    closeDraggableWindow,
    showLoading,
    hideLoading,
    resizeDraggableWindow,
    moveDraggableWindow,
    // if any consumer needs to know which is focused
    isWindowFocused: (title) => focusedComponent === title
  };

  return (
    <DraggableWindowContext.Provider value={contextValue}>
      {children}

      {/* render each window, injecting focus props */}
      {windows.map(w => {
        const isFocused = focusedComponent === w.title;
        return (
          <DraggableWindow
            key={w.title}
            ref={windowRefs.current[w.title]}
            // original props
            title={w.title}
            windowWidth={w.windowWidth}
            windowHeight={w.windowHeight}
            minWindowWidth={w.minWindowWidth}
            minWindowHeight={w.minWindowHeight}
            maxWindowWidth={w.maxWindowWidth}
            maxWindowHeight={w.maxWindowHeight}
            initialX={w.initialX}
            initialY={w.initialY}
            iframeSrc={w.iframeSrc}
            // lifted focus props
            isFocused={isFocused}
            updateFocus={updateFocus}
            // wrap onClose so we both run their callback and remove from state
            onClose={() => {
              w.onClose?.();
              closeDraggableWindow(w.title);
            }}
            onMount={w.onMount}
            onUnmount={w.onUnmount}
            onResize={w.onResize}
          >
            {w.content}
          </DraggableWindow>
        );
      })}
    </DraggableWindowContext.Provider>
  );
};

export const useDraggableWindow = () => useContext(DraggableWindowContext);
