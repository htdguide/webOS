// src/components/DraggableWindow/DraggableWindowProvider.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const DraggableWindowContext = createContext();

/**
 * Provider that sits at the root of your app.
 * Keeps track of:
 *   • registered wrapIds
 *   • all open windows, each tagged with its wrapId
 *   • refs, focus, loading, move/resize
 */
export const DraggableWindowProvider = ({ children }) => {
  const [wraps, setWraps] = useState([]); // array of wrapIds
  const [windows, setWindows] = useState([]); // { windowId, wrapId, windowProps }[]
  const [windowRefs, setWindowRefs] = useState({}); // map windowId → React ref
  const [focusedComponent, setFocusedComponent] = useState(null);
  const [loadingWindows, setLoadingWindows] = useState(new Set());

  // --- Wrap registration ---
  const registerWrap = useCallback((wrapId) => {
    setWraps(ws => (ws.includes(wrapId) ? ws : [...ws, wrapId]));
  }, []);

  const unregisterWrap = useCallback((wrapId) => {
    setWraps(ws => ws.filter(id => id !== wrapId));
  }, []);

  // --- Window actions ---
  const openDraggableWindow = useCallback(({ wrapId, windowProps }) => {
    const windowId = `${wrapId}::${windowProps.title}`;
    setWindows(ws => {
      if (ws.some(w => w.windowId === windowId)) return ws;
      return [...ws, { windowId, wrapId, windowProps }];
    });
    setWindowRefs(refs => 
      refs[windowId] 
        ? refs 
        : { ...refs, [windowId]: React.createRef() }
    );
    return windowId;
  }, []);

  const closeDraggableWindow = useCallback((windowId) => {
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
    if (focusedComponent === windowId) {
      setFocusedComponent(null);
    }
  }, [focusedComponent]);

  const showLoading = useCallback((windowId) => {
    setLoadingWindows(l => new Set(l).add(windowId));
  }, []);

  const hideLoading = useCallback((windowId) => {
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

  // --- Reassign window to a different wrap ---
  const reassignDraggableWindow = useCallback((windowId, newWrapId) => {
    setWindows(ws =>
      ws.map(w =>
        w.windowId === windowId
          ? { ...w, wrapId: newWrapId }
          : w
      )
    );
  }, []);

  const updateFocus = useCallback((windowId) => {
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
};

/**
 * Hook to access provider’s internals.
 * You shouldn’t need this outside your wrap component.
 */
export const useDraggableWindowContext = () => {
  const ctx = useContext(DraggableWindowContext);
  if (!ctx) {
    throw new Error('useDraggableWindowContext must be inside DraggableWindowProvider');
  }
  return ctx;
};
