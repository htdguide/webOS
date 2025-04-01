import React, { useRef, useEffect } from 'react';
import './SortingAlgorithms.css';
import { notify } from '../../components/Notification/Notification';
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';

function SortingAlgorithms({ onClose }) {
  const canvasRef = useRef(null);
  const scriptRef = useRef(null);
  const { openDraggableWindow, closeDraggableWindow, hideLoading } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();

  // Function to load the WASM script and initialize the module.
  const loadWasmScript = () => {
    const script = document.createElement('script');
    scriptRef.current = script;
    script.src = '/WebintoshHD/Applications/wasm/sorting_algorithms.js';
    script.async = false;
    script.onload = () => {
      console.log('WASM script loaded successfully.');
      if (hideLoading) {
        hideLoading();
      }
      if (window.Module) {
        const canvas = canvasRef.current;
        if (canvas) {
          // Ensure canvas dimensions match its display size.
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          window.Module.canvas = canvas;
          if (window.Module._initializeWindow) {
            console.log('Calling window.Module._initializeWindow()...');
            window.Module._initializeWindow();
          }
        }
      }
    };
    document.body.appendChild(script);
  };

  // The content that will be displayed inside the draggable window.
  const content = (
    <canvas
      ref={canvasRef}
      id="canvas"
      className="emscripten"
      tabIndex="-1"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        display: 'block',
      }}
    />
  );

  // Open the draggable window on mount and clean up on unmount.
  useEffect(() => {
    // Load the WASM script immediately.
    loadWasmScript();

    // Use the provider to open the draggable window with one call.
    openDraggableWindow({
      title: 'Sorting Algorithms',
      windowWidth: 400,
      windowHeight: 530,
      minWindowWidth: 400,
      minWindowHeight: 530,
      maxWindowWidth: 400,
      maxWindowHeight: 530,
      content,
      onClose,
      onMount: () => {
        console.log('Draggable window mounted.');
      },
      onUnmount: () => {
        console.log('Draggable window unmounted.');
      },
    });

    return () => {
      // Cancel the WASM loop if it exists.
      if (window.Module && window.Module._cancelLoop) {
        console.log('Cancelling WASM loop on window close.');
        window.Module._cancelLoop();
      }
      // Close the draggable window.
      closeDraggableWindow();

      // Remove the WASM script from the DOM.
      if (scriptRef.current) {
        console.log('Removing script from DOM:', scriptRef.current);
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [openDraggableWindow, closeDraggableWindow, onClose, content, deviceInfo.deviceType, hideLoading]);

  return null;
}

// Attach connectorInfo
SortingAlgorithms.connectorInfo = {
  name: 'Sorting Algorithms',
  icon: defaultIcon,
  priority: 4,
}

export default SortingAlgorithms;
