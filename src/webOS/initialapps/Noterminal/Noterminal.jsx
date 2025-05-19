// Noterminal.jsx
import React, { useEffect } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import FlowManager from './components/FlowManager';

function Noterminal({ onClose }) {
  const {
    openDraggableWindow,
    closeDraggableWindow,
    hideLoading,
    resizeDraggableWindow,
    moveDraggableWindow,
  } = useDraggableWindow();

  // pull your terminal settings (with defaults)
  const { state } = useStateManager();
  const {
    fontSize = '12px',
    fontColor = '#000000',
    fontFamily = 'monospace',
    backgroundColor = '#FFFFFF',
  } = state.groups.terminalSettings || {};

  const deviceInfo = useDeviceInfo();

  // base dimensions
  const defaultParams = {
    windowWidth: 600,
    windowHeight: 400,
    initialX: undefined,
    initialY: undefined,
  };

  // full-width on mobile, top half
  const windowParams =
    deviceInfo.deviceType !== 'desktop'
      ? {
          windowWidth: window.innerWidth,
          windowHeight: Math.floor(window.innerHeight / 2),
          initialX: 0,
          initialY: 0,
        }
      : defaultParams;

  const title = 'Noterminal';

  // wrap your FlowManager so it can reposition on input focus
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
        onClose?.();
        closeDraggableWindow(title);
      },
      onMount: () => {
        // now correctly hide *this* window's loading overlay
        hideLoading(title);
      },
      onUnmount: () => {
        console.log('Terminal draggable window unmounted.');
      },
    });

    return () => {
      // clean up in case the parent unmounts us
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
  ]);

  return null;
}

export default Noterminal;
