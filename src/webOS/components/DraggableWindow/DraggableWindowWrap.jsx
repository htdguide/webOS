// src/components/DraggableWindow/DraggableWindowWrap.jsx
import React, { createContext, useContext } from 'react';
import { useDraggableWindowContext } from './DraggableWindowProvider.jsx';
import DraggableWindow from './DraggableWindow.jsx';

const DraggableWindowWrapContext = createContext();

/**
 * Wrap component that apps use anywhere.
 * It pulls *only* the windows for its wrapId out of the provider,
 * and renders each <DraggableWindow> inline, so you can
 * click, drag, focus, etc. directly on them.
 */
export const DraggableWindowWrap = ({ wrapId, children }) => {
  const {
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
  } = useDraggableWindowContext();

  // App-facing APIs:
  const openDraggableWindow = (windowProps) =>
    providerOpen({ wrapId, windowProps });

  const closeDraggableWindow = (title) =>
    providerClose(`${wrapId}::${title}`);

  const showLoadingFor = (title) =>
    showLoading(`${wrapId}::${title}`);
  const hideLoadingFor = (title) =>
    hideLoading(`${wrapId}::${title}`);
  const resizeWindow = (title, w, h) =>
    resizeDraggableWindow(`${wrapId}::${title}`, w, h);
  const moveWindow = (title, x, y) =>
    moveDraggableWindow(`${wrapId}::${title}`, x, y);

  // Only render the windows belonging to *this* wrapId:
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
        isWindowFocused: (title) =>
          focusedComponent === `${wrapId}::${title}`,
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
          ...restProps
        } = windowProps;

        return (
          <DraggableWindow
            key={windowId}
            ref={ref}
            {...restProps}
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
 * Hook for your apps to open/close/move windows:
 *
 *   const {
 *     openDraggableWindow,
 *     closeDraggableWindow,
 *     showLoading,
 *     hideLoading,
 *     resizeWindow,
 *     moveWindow,
 *     isWindowFocused
 *   } = useDraggableWindow();
 */
export const useDraggableWindow = () => useContext(DraggableWindowWrapContext);
