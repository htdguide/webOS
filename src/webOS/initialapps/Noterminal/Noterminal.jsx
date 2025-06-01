// src/initialapps/Noterminal/Noterminal.jsx
import React, { useEffect } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import FlowManager from './components/FlowManager';

function Noterminal({ onClose, windowTitle }) {
  const {
    openDraggableWindow,
    closeDraggableWindow,
    hideLoading,
    resizeDraggableWindow,
    moveDraggableWindow,
  } = useDraggableWindow();

  // Pull terminal settings (with defaults) from your global state manager
  const { state } = useStateManager();
  const {
    fontSize = '12px',
    fontColor = '#000000',
    fontFamily = 'monospace',
    backgroundColor = '#FFFFFF',
  } = state.groups.terminalSettings || {};

  const deviceInfo = useDeviceInfo();

  // Base dimensions for desktop vs. mobile
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

  // Use the unique windowTitle passed from TaskManager, or fallback to "Noterminal"
  const title = 'Noterminal';

  // Wrap FlowManager so it can resize/move on input focus (especially mobile)
  const terminalContent = (
    <FlowManager
      fontSize={fontSize}
      fontColor={fontColor}
      fontFamily={fontFamily}
      backgroundColor={backgroundColor}
      onInputFocus={() => {
        if (deviceInfo.deviceType !== 'desktop') {
          resizeDraggableWindow(
            title,
            window.innerWidth,
            Math.floor(window.innerHeight / 2)
          );
          moveDraggableWindow(title, 0, 0);
        }
      }}
    />
  );

  useEffect(() => {
    // Open a draggable window identified by this unique title
    openDraggableWindow({
      title,
      windowWidth: windowParams.windowWidth,
      windowHeight: windowParams.windowHeight,
      minWindowWidth: 300,
      minWindowHeight: 200,
      initialX: windowParams.initialX,
      initialY: windowParams.initialY,
      content: terminalContent,
      onClose: () => {
        // First call the parent-provided onClose to let TaskManager remove this task
        onClose?.();
        // Then close the draggable window using the same unique title
        closeDraggableWindow(title);
      },
      onMount: () => {
        // Remove the loading overlay for this specific window title
        hideLoading(title);
      },
      onUnmount: () => {
        console.log(`Terminal window "${title}" unmounted.`);
      },
    });

    return () => {
      // In case the component unmounts unexpectedly, ensure we clean up
      closeDraggableWindow(title);
    };
  }, [
    openDraggableWindow,
    closeDraggableWindow,
    hideLoading,
    resizeDraggableWindow,
    moveDraggableWindow,
    terminalContent,
    windowParams,
    onClose,
    title,
  ]);

  // This component itself renders nothing in the normal React tree,
  // because all actual UI is rendered via the draggable window portal.
  return null;
}

export default Noterminal;
