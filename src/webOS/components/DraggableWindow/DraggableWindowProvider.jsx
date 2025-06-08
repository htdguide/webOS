// src/components/DraggableWindow/DraggableWindowProvider.jsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { useFocus } from '../../contexts/FocusControl/FocusControl.jsx';

const DraggableWindowContext = createContext();

/**
 * Top-level provider.  Stores all windows (with their wrapId),
 * plus refs, focus state, and imperative APIs.
 */
export const DraggableWindowProvider = ({ children }) => {
  // [{ wrapId, windowId, windowProps }]
  const [windows, setWindows] = useState([]);
  // { [windowId]: React.RefObject }
  const windowRefs = useRef({});
  const { focusedComponent, updateFocus } = useFocus();

  const openDraggableWindow = ({ wrapId, windowProps }) => {
    const { title } = windowProps;
    const windowId = `${wrapId}::${title}`;
    setWindows(prev => {
      if (prev.some(w => w.windowId === windowId)) return prev;
      windowRefs.current[windowId] = React.createRef();
      return [...prev, { wrapId, windowId, windowProps }];
    });
    return windowId;
  };

  const closeDraggableWindow = (windowId) => {
    setWindows(prev => prev.filter(w => w.windowId !== windowId));
  };

  const showLoading = (windowId) => {
    windowRefs.current[windowId]?.current?.showLoading();
  };
  const hideLoading = (windowId) => {
    windowRefs.current[windowId]?.current?.hideLoading();
  };
  const resizeDraggableWindow = (windowId, w, h) => {
    windowRefs.current[windowId]?.current?.resizeWindow(w, h);
  };
  const moveDraggableWindow = (windowId, x, y) => {
    windowRefs.current[windowId]?.current?.moveWindow(x, y);
  };

  return (
    <DraggableWindowContext.Provider
      value={{
        // core state
        windows,
        windowRefs: windowRefs.current,
        // focus control
        focusedComponent,
        updateFocus,
        // imperative APIs
        openDraggableWindow,
        closeDraggableWindow,
        showLoading,
        hideLoading,
        resizeDraggableWindow,
        moveDraggableWindow,
      }}
    >
      {children}
    </DraggableWindowContext.Provider>
  );
};

export const useDraggableWindowContext = () =>
  useContext(DraggableWindowContext);
