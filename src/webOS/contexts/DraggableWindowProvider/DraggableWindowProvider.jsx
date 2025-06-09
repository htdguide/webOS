// src/webOS/components/DraggableWindow/DraggableWindowProvider.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const DraggableWindowContext = createContext();

/**
 * Provider that sits at the root of your app.
 */
export function DraggableWindowProvider({ children }) {
  const [wraps, setWraps] = useState([]);
  const [windows, setWindows] = useState([]);
  const [windowRefs, setWindowRefs] = useState({});
  const [focusedComponent, setFocusedComponent] = useState(null);
  const [loadingWindows, setLoadingWindows] = useState(new Set());

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const registerWrap = useCallback(wrapId => {
    setWraps(ws => (ws.includes(wrapId) ? ws : [...ws, wrapId]));
  }, []);

  const unregisterWrap = useCallback(wrapId => {
    setWraps(ws => ws.filter(id => id !== wrapId));
  }, []);

  const openDraggableWindow = useCallback(({ wrapId, windowProps }) => {
    const suffix = windowProps.id ?? generateId();
    const windowId = `${wrapId}::${suffix}`;

    setWindows(ws =>
      ws.some(w => w.windowId === windowId)
        ? ws
        : [...ws, { windowId, wrapId, windowProps }]
    );

    setWindowRefs(refs =>
      refs[windowId] ? refs : { ...refs, [windowId]: React.createRef() }
    );

    return windowId;
  }, []);

  const closeDraggableWindow = useCallback(windowId => {
    setWindows(ws => ws.filter(w => w.windowId !== windowId));
    setWindowRefs(refs => {
      const { [windowId]: _, ...rest } = refs;
      return rest;
    });
    setLoadingWindows(l => {
      const copy = new Set(l);
      copy.delete(windowId);
      return copy;
    });
    setFocusedComponent(f => (f === windowId ? null : f));
  }, []);

  const showLoading = useCallback(windowId => {
    setLoadingWindows(l => new Set(l).add(windowId));
  }, []);

  const hideLoading = useCallback(windowId => {
    setLoadingWindows(l => {
      const copy = new Set(l);
      copy.delete(windowId);
      return copy;
    });
  }, []);

  const resizeDraggableWindow = useCallback((windowId, width, height) => {
    setWindows(ws =>
      ws.map(w =>
        w.windowId === windowId
          ? { ...w, windowProps: { ...w.windowProps, width, height } }
          : w
      )
    );
  }, []);

  const moveDraggableWindow = useCallback((windowId, x, y) => {
    setWindows(ws =>
      ws.map(w =>
        w.windowId === windowId
          ? { ...w, windowProps: { ...w.windowProps, x, y } }
          : w
      )
    );
  }, []);

  const reassignDraggableWindow = useCallback((windowId, newWrapId) => {
    setWindows(ws =>
      ws.map(w =>
        w.windowId === windowId ? { ...w, wrapId: newWrapId } : w
      )
    );
  }, []);

  const updateFocus = useCallback(windowId => {
    setFocusedComponent(windowId);
  }, []);

  return (
    <DraggableWindowContext.Provider
      value={{
        wraps,
        windows,
        windowRefs,
        focusedComponent,
        loadingWindows,
        registerWrap,
        unregisterWrap,
        openDraggableWindow,
        closeDraggableWindow,
        showLoading,
        hideLoading,
        resizeDraggableWindow,
        moveDraggableWindow,
        reassignDraggableWindow,
        updateFocus,
      }}
    >
      {children}
    </DraggableWindowContext.Provider>
  );
}

/**
 * Hook to access provider’s internals.
 */
export function useDraggableWindowContext() {
  const ctx = useContext(DraggableWindowContext);
  if (!ctx) {
    throw new Error(
      'useDraggableWindowContext must be used within DraggableWindowProvider'
    );
  }
  return ctx;
}
