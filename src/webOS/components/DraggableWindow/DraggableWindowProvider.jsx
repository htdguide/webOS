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

  const { focusedComponent } = useFocus();

  /**
   * Opens a window unless one with the same title is already open.
   * We do the dedupe check inside setWindows' functional updater,
   * so even back-to-back calls in the same tick won’t add twice.
   */
  const openDraggableWindow = (props) => {
    const { title } = props;

    setWindows(prev => {
      // if it’s already in the list, do nothing
      if (prev.some(w => w.title === title)) return prev;

      // ensure we have a ref for imperatives
      if (!windowRefs.current[title]) {
        windowRefs.current[title] = React.createRef();
      }

      return [...prev, props];
    });
  };

  const closeDraggableWindow = (title) => {
    setWindows(prev => prev.filter(w => w.title !== title));
  };

  // Imperative APIs—themselves keyed by title:
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

  const isWindowFocused = (title) => focusedComponent === title;

  return (
    <DraggableWindowContext.Provider value={{
      openDraggableWindow,
      closeDraggableWindow,
      showLoading,
      hideLoading,
      resizeDraggableWindow,
      moveDraggableWindow,
      isWindowFocused
    }}>
      {children}

      {/*
         Render one <DraggableWindow> per entry in windows[].
         We spread in all your props, override onClose to filter it out,
         and pass your “content” as the child.
      */}
      {windows.map(w => (
        <DraggableWindow
          key={w.title}
          ref={windowRefs.current[w.title]}
          title={w.title}
          windowWidth={w.windowWidth}
          windowHeight={w.windowHeight}
          minWindowWidth={w.minWindowWidth}
          minWindowHeight={w.minWindowHeight}
          maxWindowWidth={w.maxWindowWidth}
          maxWindowHeight={w.maxWindowHeight}
          onClose={() => {
            w.onClose?.();
            closeDraggableWindow(w.title);
          }}
          onMount={w.onMount}
          onUnmount={w.onUnmount}
          onResize={w.onResize}
          initialX={w.initialX}
          initialY={w.initialY}
          iframeSrc={w.iframeSrc}
        >
          {w.content}
        </DraggableWindow>
      ))}
    </DraggableWindowContext.Provider>
  );
};

export const useDraggableWindow = () => useContext(DraggableWindowContext);
