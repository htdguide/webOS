import React, { useState, useEffect } from 'react';
import './Noterminal.css';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';
import { useTerminalSettings } from '../../contexts/TerminalSettingsContext/TerminalSettingsProvider';
import FlowManager from './FlowManager';

function Terminal({ onClose }) {
  const [windowSize, setWindowSize] = useState({ width: 600, height: 400 });
  const { openDraggableWindow, closeDraggableWindow, hideLoading } = useDraggableWindow();
  const { fontSize, fontColor, fontFamily, backgroundColor } = useTerminalSettings();

  const terminalContent = (
    <FlowManager 
      fontSize={fontSize}
      fontColor={fontColor}
      fontFamily={fontFamily}
      backgroundColor={backgroundColor}
    />
  );

  useEffect(() => {
    openDraggableWindow({
      title: 'Noterminal',
      windowWidth: windowSize.width,
      windowHeight: windowSize.height,
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
      onResize: (width, height) => {
        setWindowSize({ width, height });
      },
    });

    return () => {
      closeDraggableWindow();
    };
  }, [openDraggableWindow, closeDraggableWindow, onClose, terminalContent, hideLoading, windowSize]);

  return null;
}

export default Terminal;
