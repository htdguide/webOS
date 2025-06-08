// src/components/DraggableWindow/DraggableWindowWrap.jsx
import React, { createContext, useContext, useEffect } from 'react';
import { useDraggableWindowContext } from './DraggableWindowProvider.jsx';
import DraggableWindow from './DraggableWindow.jsx';

const DraggableWindowWrapContext = createContext();

/**
 * Wrap component that you place wherever you need an isolated window area.
 *   • Registers its wrapId with the provider on mount
 *   • Exposes open/close/move/resize/reassign scoped to this wrapId
 *   • Renders only windows whose wrapId matches
 */
export const DraggableWindowWrap = ({ wrapId, children }) => {
  const {
    registerWrap,
    unregisterWrap,
    windows,
    windowRefs,
    focusedComponent,
    updateFocus,
    openDraggableWindow: providerOpen,
    closeDraggableWindow: providerClose,
    showLoading,
    hideLoading,
    resizeDraggableWindow,
    moveDraggableWindow,
    reassignDraggableWindow,
  } = useDraggableWindowContext();

  // register / unregister this wrap
  useEffect(() => {
    registerWrap(wrapId);
    return () => unregisterWrap(wrapId);
  }, [wrapId, registerWrap, unregisterWrap]);

  // scoped APIs
  const openDraggableWindow = windowProps =>
    providerOpen({ wrapId, windowProps });

  const closeDraggableWindow = title =>
    providerClose(`${wrapId}::${title}`);

  const showLoadingFor = title =>
    showLoading(`${wrapId}::${title}`);

  const hideLoadingFor = title =>
    hideLoading(`${wrapId}::${title}`);

  const resizeWindow = (title, w, h) =>
    resizeDraggableWindow(`${wrapId}::${title}`, w, h);

  const moveWindow = (title, x, y) =>
    moveDraggableWindow(`${wrapId}::${title}`, x, y);

  const reassignWindow = (title, newWrapId) =>
    reassignDraggableWindow(`${wrapId}::${title}`, newWrapId);

  const isWindowFocused = title =>
    focusedComponent === `${wrapId}::${title}`;

  // only show windows for this wrapId
  const myWindows = windows.filter(w => w.wrapId === wrapId);

  return (
    <DraggableWindowWrapContext.Provider
      value={{
        openDraggableWindow,
        closeDraggableWindow,
        showLoading: showLoadingFor,
        hideLoading: hideLoadingFor,
        resizeWindow,
        moveWindow,
        reassignWindow,
        isWindowFocused,
      }}
    >
      {children}

      {myWindows.map(({ windowId, windowProps }) => {
        const ref = windowRefs[windowId];
        const isFocused = focusedComponent === windowId;
        const {
          title,
          content,
          iframeSrc,
          onClose,
          onMount,
          onUnmount,
          onResize,
          ...rest
        } = windowProps;

        return (
          <DraggableWindow
            key={windowId}
            ref={ref}
            {...rest}
            title={title}
            iframeSrc={iframeSrc}
            isFocused={isFocused}
            updateFocus={updateFocus}
            onClose={() => {
              onClose?.();
              providerClose(windowId);
            }}
            onMount={onMount}
            onUnmount={onUnmount}
            onResize={onResize}
          >
            {content}
          </DraggableWindow>
        );
      })}
    </DraggableWindowWrapContext.Provider>
  );
};

/**
 * Hook your components use to manage windows in this wrap:
 *
 * const {
 *   openDraggableWindow,
 *   closeDraggableWindow,
 *   showLoading,
 *   hideLoading,
 *   resizeWindow,
 *   moveWindow,
 *   reassignWindow,
 *   isWindowFocused,
 * } = useDraggableWindow();
 */
export const useDraggableWindow = () => {
  const ctx = useContext(DraggableWindowWrapContext);
  if (!ctx) {
    throw new Error('useDraggableWindow must be inside DraggableWindowWrap');
  }
  return ctx;
};
