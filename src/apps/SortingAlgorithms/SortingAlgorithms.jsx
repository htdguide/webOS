import React, { useEffect, useRef, useState, useCallback } from 'react';
import './SortingAlgorithms.css';
import { notify } from '../../components/Notification/Notification';
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../services/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowProvider';

function SortingAlgorithms({ onClose }) {
  const [isWindowMounted, setIsWindowMounted] = useState(false);
  const [wasmScriptLoaded, setWasmScriptLoaded] = useState(false);
  const canvasRef = useRef(null);
  const script = useRef(null);
  const notificationSent = useRef(false);

  const deviceInfo = useDeviceInfo();
  const { openDraggableWindow, closeDraggableWindow, hideLoading } = useDraggableWindow();

  // Attempt to load the WASM script if not already loaded
  const loadWasmScript = useCallback(() => {
    if (wasmScriptLoaded) return;

    console.log('Creating <script> for sorting_algorithms.js...');
    script.current = document.createElement('script');
    script.current.src = '/WebintoshHD/Applications/wasm/sorting_algorithms.js';
    script.current.async = false;

    script.current.onload = () => {
      console.log('WASM script loaded successfully.');
      setWasmScriptLoaded(true);
    };

    document.body.appendChild(script.current);
  }, [wasmScriptLoaded]);

  // Load the WASM script once the window is mounted
  useEffect(() => {
    if (isWindowMounted && !notificationSent.current) {
      console.log('Window is mounted => loadWasmScript()');
      loadWasmScript();
      if (deviceInfo.deviceType === 'desktop') {
        notify(
          'App is in early stage of porting, in case if it doesnt respond to the mouse clicks, reopen the window',
          6000,
          defaultIcon
        );
      }
      notificationSent.current = true;
    }
  }, [isWindowMounted, loadWasmScript, deviceInfo.deviceType]);

  // Initialize WASM when the script is loaded and the canvas is ready
  useEffect(() => {
    if (wasmScriptLoaded && canvasRef.current) {
      console.log('WASM is loaded and canvasRef is valid => initialize WASM...');
      console.log('Hiding loading overlay now...');
      if (hideLoading) {
        hideLoading();
      }
      setTimeout(() => {
        if (window.Module) {
          const canvas = canvasRef.current;
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          console.log('Canvas ready for WASM:', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight,
          });
          window.Module.canvas = canvas;
          if (window.Module._initializeWindow) {
            console.log('Calling window.Module._initializeWindow()...');
            window.Module._initializeWindow();
          }
        } else {
          console.warn('window.Module is not defined yet.');
        }
      }, 100);
    }
  }, [wasmScriptLoaded, hideLoading]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('SortingAlgorithms unmounting...');
      if (window.Module && window.Module._cancelLoop) {
        console.log('Cancelling WASM loop on window close.');
        window.Module._cancelLoop();
      }
      if (script.current) {
        console.log('Removing script from DOM:', script.current);
        document.body.removeChild(script.current);
      }
    };
  }, []);

  // Open the draggable window via the provider when this component mounts,
  // and close it on unmount.
  useEffect(() => {
    openDraggableWindow({
      title: 'Sorting Algorithms',
      windowWidth: 400,
      windowHeight: 530,
      content: (
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
      ),
      onClose: onClose,
      onMount: () => {
        console.log('DraggableWindow onMount => setIsWindowMounted(true)');
        setIsWindowMounted(true);
      },
      onUnmount: () => {
        console.log('DraggableWindow onUnmount => setIsWindowMounted(false)');
        setIsWindowMounted(false);
        notificationSent.current = false;
      },
    });

    return () => {
      closeDraggableWindow();
    };
  }, [openDraggableWindow, closeDraggableWindow, onClose]);

  return null;
}

export default SortingAlgorithms;
