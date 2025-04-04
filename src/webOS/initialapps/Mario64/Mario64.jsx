// Mario64.jsx
import React, { useRef, useEffect } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png'; // Adjust the icon path as needed.
import { useDeviceInfo } from '../../../../src/webOS/contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../../../src/webOS/components/DraggableWindow/DraggableWindowProvider';

/**
 * Mario64 Component:
 * -------------------
 * This component loads the Super Mario 64 WASM game into a canvas element.
 * It relies on the global `window.Module` object (set up by WasmModule in main.jsx)
 * to provide the configuration required by the WASM code.
 *
 * The component:
 *  - Opens a draggable window to display the game.
 *  - Waits one second after the window is mounted before dynamically loading the WASM script.
 *  - Attaches the canvas element to Module.canvas and calls an initialization function if available.
 *  - When closed, forcibly "kills" the module (if loaded) by calling abort and clearing the global Module,
 *    then removes the dynamically inserted script element.
 */
function Mario64({ onClose }) {
  // References for the canvas element, the dynamically loaded script, and a flag indicating load status.
  const canvasRef = useRef(null);
  const scriptRef = useRef(null);
  const moduleLoadedRef = useRef(false);
  
  // Get methods from your draggable window provider.
  const { openDraggableWindow, closeDraggableWindow, hideLoading } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();

  // Function to load the WASM script.
  const loadWasmScript = () => {
    const script = document.createElement('script');
    scriptRef.current = script;
    // Ensure the path is correct. The query parameter forces a fresh load.
    script.src = '/WebintoshHD/Applications/Mario64/wasm/sm64.us.f3dex2e.js?cb=' + new Date().getTime();
    // Set async to false to ensure proper load order.
    script.async = true;

    script.onload = () => {
      moduleLoadedRef.current = true;
      console.log('Mario64 WASM script loaded successfully.');
      if (hideLoading) hideLoading();

      if (window.Module) {
        const canvas = canvasRef.current;
        if (canvas) {
          // Set the canvas dimensions to match its displayed size.
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          // Attach the canvas element to the global Module.
          window.Module.canvas = canvas;

          // Call the initialization function if available.
          if (window.Module._initializeWindow) {
            console.log('Calling window.Module._initializeWindow()...');
            window.Module._initializeWindow();
          }
        }
      }
    };

    document.body.appendChild(script);
  };

  // Define the content for the draggable window.
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

  useEffect(() => {
    // Open the draggable window.
    openDraggableWindow({
      title: 'Super Mario 64',
      windowWidth: 800,
      windowHeight: 600,
      minWindowWidth: 600,
      minWindowHeight: 400,
      content,
      onClose,
      onMount: () => {
        console.log('Mario64 window mounted.');
        // Wait 1 second after the window mounts before loading the WASM script.
        
      },
      onUnmount: () => {
        console.log('Mario64 window unmounted.');
      },
    });
    
    return () => {
      loadWasmScript();
      // Cleanup when the component unmounts (i.e. the window is closed):
      // Only attempt to kill the module if it has been loaded.
      if (moduleLoadedRef.current && window.Module && window.Module.abort) {
        console.log('Killing Mario64 WASM module.');
        window.Module.abort('Killed by user');
      }
      // Clear the global Module.
      window.Module = undefined;
      // Close the draggable window.
      closeDraggableWindow();
      // Remove the dynamically added script element.
      if (scriptRef.current) {
        console.log('Removing Mario64 script from DOM:', scriptRef.current);
        document.body.removeChild(scriptRef.current);
      }
    };
  }, [
    openDraggableWindow,
    closeDraggableWindow,
    onClose,
    hideLoading,
    content,
    deviceInfo.deviceType,
  ]);

  return null; // The draggable window handles rendering.
}

// Optional connectorInfo for integration in your webOS system.
Mario64.connectorInfo = {
  name: 'Super Mario 64',
  icon: defaultIcon,
  priority: 4,
};

export default Mario64;
