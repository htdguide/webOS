// src/initialapps/Noterminal/Noterminal.jsx

import React, { useEffect, useRef } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowWrap';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import FlowManager from './components/FlowManager';

function Noterminal({ onClose: parentOnClose, windowTitle }) {
  const { openDraggableWindow, resizeWindow, moveWindow } = useDraggableWindow();

  // Terminal styling from global state
  const { state } = useStateManager();
  const {
    fontSize = '12px',
    fontColor = '#000000',
    fontFamily = 'monospace',
    backgroundColor = '#FFFFFF',
  } = state.groups.terminalSettings || {};

  const deviceInfo = useDeviceInfo();

  // Choose dimensions based on device
  const defaultParams = {
    windowWidth: 600,
    windowHeight: 400,
    initialX: undefined,
    initialY: undefined,
  };
  const windowParams =
    deviceInfo.deviceType !== 'desktop'
      ? {
          windowWidth: window.innerWidth,
          windowHeight: Math.floor(window.innerHeight / 2),
          initialX: 0,
          initialY: 0,
        }
      : defaultParams;

  // Use passed title or fallback
  const title = windowTitle || 'Noterminal';

  // Wrap FlowManager so we can resize/move on mobile input focus
  const terminalContent = (
    <FlowManager
      fontSize={fontSize}
      fontColor={fontColor}
      fontFamily={fontFamily}
      backgroundColor={backgroundColor}
      onInputFocus={() => {
        if (deviceInfo.deviceType !== 'desktop') {
          resizeWindow(
            title,
            window.innerWidth,
            Math.floor(window.innerHeight / 2)
          );
          moveWindow(title, 0, 0);
        }
      }}
    />
  );

  // Keep the exact windowId in case you need it
  const windowIdRef = useRef(null);

  useEffect(() => {
    // Open _once_ on mount
    const windowId = openDraggableWindow({
      id: title,                     // stable ID to dedupe
      title,
      windowWidth: windowParams.windowWidth,
      windowHeight: windowParams.windowHeight,
      minWindowWidth: 300,
      minWindowHeight: 200,
      initialX: windowParams.initialX,
      initialY: windowParams.initialY,
      content: terminalContent,
      onClose: () => {
        parentOnClose?.();
      },
    });

    windowIdRef.current = windowId;
  }, [
    openDraggableWindow,
    title,
    windowParams.windowWidth,
    windowParams.windowHeight,
    windowParams.initialX,
    windowParams.initialY,
    terminalContent,
    parentOnClose,
  ]);

  return null; // UI lives in the draggable window portal
}

export default Noterminal;
