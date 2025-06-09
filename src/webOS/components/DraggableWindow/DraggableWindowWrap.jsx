// src/webOS/components/DraggableWindow/DraggableWindowWrap.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useDraggableWindowContext } from './DraggableWindowProvider';
import DraggableWindow from './DraggableWindow';

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
    openDraggableWindow: providerOpen,
    closeDraggableWindow: providerClose,
    showLoading: providerShowLoading,
    hideLoading: providerHideLoading,
    resizeDraggableWindow: providerResize,
    moveDraggableWindow: providerMove,
    reassignDraggableWindow: providerReassign,
  } = useDraggableWindowContext();

  // register / unregister this wrap
  useEffect(() => {
    registerWrap(wrapId);
    return () => unregisterWrap(wrapId);
  }, [wrapId, registerWrap, unregisterWrap]);

  // memoize all scoped APIs so their identity stays constant
  const openDraggableWindow = useCallback(
    (windowProps) => providerOpen({ wrapId, windowProps }),
    [providerOpen, wrapId]
  );
  const closeDraggableWindow = useCallback(
    (windowId) => providerClose(windowId),
    [providerClose]
  );
  const showLoading = useCallback(
    (windowId) => providerShowLoading(windowId),
    [providerShowLoading]
  );
  const hideLoading = useCallback(
    (windowId) => providerHideLoading(windowId),
    [providerHideLoading]
  );
  const resizeWindow = useCallback(
    (windowId, width, height) => providerResize(windowId, width, height),
    [providerResize]
  );
  const moveWindow = useCallback(
    (windowId, x, y) => providerMove(windowId, x, y),
    [providerMove]
  );
  const reassignWindow = useCallback(
    (windowId, newWrapId) => providerReassign(windowId, newWrapId),
    [providerReassign]
  );

  // bundle into one stable object
  const contextValue = useMemo(
    () => ({
      openDraggableWindow,
      closeDraggableWindow,
      showLoading,
      hideLoading,
      resizeWindow,
      moveWindow,
      reassignWindow,
    }),
    [
      openDraggableWindow,
      closeDraggableWindow,
      showLoading,
      hideLoading,
      resizeWindow,
      moveWindow,
      reassignWindow,
    ]
  );

  // only render windows for this wrap
  const myWindows = windows.filter((w) => w.wrapId === wrapId);

  return (
    <DraggableWindowWrapContext.Provider value={contextValue}>
      {children}

      {myWindows.map(({ windowId, windowProps }) => {
        const ref = windowRefs[windowId];
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
            windowId={windowId}
            {...rest}
            title={title}
            iframeSrc={iframeSrc}
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
 * } = useDraggableWindow();
 */
export const useDraggableWindow = () => {
  const ctx = useContext(DraggableWindowWrapContext);
  if (!ctx) {
    throw new Error('useDraggableWindow must be inside DraggableWindowWrap');
  }
  return ctx;
};
