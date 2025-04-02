import React, { useState, useEffect } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';
import { useTerminalSettings } from '../../contexts/TerminalSettingsContext/TerminalSettingsProvider';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import FlowManager from './components/FlowManager';

function Terminal({ onClose }) {
  const {
    openDraggableWindow,
    closeDraggableWindow,
    updateDraggableWindow,
    hideLoading,
  } = useDraggableWindow();
  const { fontSize, fontColor, fontFamily, backgroundColor } = useTerminalSettings();
  const deviceInfo = useDeviceInfo();

  // Default window parameters for desktop.
  const defaultParams = {
    windowWidth: 600,
    windowHeight: 400,
    initialX: undefined,
    initialY: undefined,
  };

  // For mobile devices, open terminal full width, top half of viewport,
  // and positioned at the top left corner.
  const windowParams =
    deviceInfo.deviceType !== 'desktop'
      ? {
          windowWidth: window.innerWidth,
          windowHeight: Math.floor(window.innerHeight / 2),
          initialX: 0,
          initialY: 0,
        }
      : defaultParams;

  // When input is focused on mobile devices, reposition/rescale the terminal.
  const handleInputFocus = () => {
    if (deviceInfo.deviceType !== 'desktop' && updateDraggableWindow) {
      updateDraggableWindow({
        windowWidth: window.innerWidth,
        windowHeight: Math.floor(window.innerHeight / 2),
        x: 0,
        y: 0,
      });
    }
  };

  const terminalContent = (
    <FlowManager 
      fontSize={fontSize}
      fontColor={fontColor}
      fontFamily={fontFamily}
      backgroundColor={backgroundColor}
      onInputFocus={handleInputFocus}
    />
  );

  useEffect(() => {
    openDraggableWindow({
      title: 'Noterminal',
      windowWidth: windowParams.windowWidth,
      windowHeight: windowParams.windowHeight,
      minWindowWidth: 300,
      minWindowHeight: 200,
      content: terminalContent,
      onClose,
      onMount: () => {
        if (hideLoading) hideLoading();
      },
      onUnmount: () => {
        console.log('Terminal draggable window unmounted.');
      },
      initialX: windowParams.initialX,
      initialY: windowParams.initialY,
    });

    return () => {
      closeDraggableWindow();
    };
  }, [
    openDraggableWindow,
    closeDraggableWindow,
    onClose,
    terminalContent,
    hideLoading,
    windowParams,
  ]);

  return null;
}

export default Terminal;

