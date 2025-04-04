// Mario64.jsx
// This component loads the Super Mario 64 WASM game inside an iframe.
// The iframe loads a dedicated HTML file (e.g., Mario64Iframe.html) that sets up the WASM module and canvas.
// When the window is closed, the iframe is removed, terminating the WASM process.

import React, { useEffect } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png'; // Adjust the icon path as needed.
import { useDeviceInfo } from '../../../../src/webOS/contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../../../src/webOS/components/DraggableWindow/DraggableWindowProvider';

function Mario64({ onClose }) {
  // Get methods to open and close the draggable window from the provider.
  const { openDraggableWindow, closeDraggableWindow } = useDraggableWindow();
  const deviceInfo = useDeviceInfo(); // Can be used to adjust behavior based on device type if needed.

  useEffect(() => {
    // Construct the iframe URL.
    // The query parameter forces a fresh load and prevents caching.
    const iframeUrl =
      '/WebintoshHD/Applications/Mario64/wasm/index.html?cb=' + new Date().getTime();

    // Open the draggable window with the iframeSrc property.
    openDraggableWindow({
      title: 'Super Mario 64',
      windowWidth: 800,
      windowHeight: 600,
      minWindowWidth: 600,
      minWindowHeight: 400,
      onClose, // Callback executed when the window is closed.
      onMount: () => {
        console.log('Mario64 iframe window mounted.');
      },
      onUnmount: () => {
        console.log('Mario64 iframe window unmounted.');
      },
      // Pass the iframe URL to load the WASM game inside the iframe.
      iframeSrc: iframeUrl,
    });

    // Cleanup: Close the draggable window when the component unmounts.
    return () => {
      closeDraggableWindow();
    };
  }, [openDraggableWindow, closeDraggableWindow, onClose, deviceInfo.deviceType]);

  return null; // The draggable window component handles rendering the iframe.
}

// Optional connectorInfo for integration in your webOS system.
Mario64.connectorInfo = {
  name: 'Super Mario 64',
  icon: defaultIcon,
  priority: 4,
};

export default Mario64;
