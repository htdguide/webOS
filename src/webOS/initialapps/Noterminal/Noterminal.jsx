// src/initialapps/Noterminal/Noterminal.jsx

// ===== Area 1: Imports and Hooks Setup =====
// --- 1.1: Import statements
import React, { useEffect, useRef } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowWrap';
import { useStateManager } from '../../stores/StateManager/StateManager';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import FlowManager from './components/FlowManager';

// --- 1.2: Hook initializations
function Noterminal({ onClose: parentOnClose, windowTitle }) {
  const { openDraggableWindow, resizeWindow, moveWindow } = useDraggableWindow(); // window API
  const { state } = useStateManager();                                        // styling state
  const deviceInfo = useDeviceInfo();                                          // detect device
  const windowIdRef = useRef(null);                                            // store window ID

  // ===== Area 2: Window Parameter Computation =====
  // --- 2.1: Default dimensions
  const defaultParams = {
    windowWidth: 372,
    windowHeight: 300,
    initialX: undefined,
    initialY: undefined,
  };

  // --- 2.2: Override for vertical, narrow screens
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const isVertical = screenHeight > screenWidth;
  let windowParams;
  if (isVertical && screenWidth < 600) {
    windowParams = {
      windowWidth: screenWidth - 16,                       // full width minus 16px
      windowHeight: Math.floor(screenHeight / 2) - 113,     // half height minus 113px
      initialX: 8,                                          // offset right by 8px
      initialY: 0,
    };
  } else {
    windowParams = defaultParams;                          // always use desktop defaults otherwise
  }

  // ===== Area 3: Terminal Content Wrapper =====
  // --- 3.1: FlowManager with input‐focus handler
  const {
    fontSize = '12px',
    fontColor = '#000000',
    fontFamily = 'monospace',
    backgroundColor = '#FFFFFF',
  } = state.groups.terminalSettings || {};
  const title = windowTitle || 'Noterminal';
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

  // ===== Area 4: Opening the Draggable Window =====
  // --- 4.1: useEffect to call openDraggableWindow
  useEffect(() => {
    const windowId = openDraggableWindow({
      id: title,
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

  return null; // portal renders the UI
}

export default Noterminal;
