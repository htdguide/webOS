// src/webOS/apps/Quake3.jsx

// --- Area 1: Imports ---
// 1.1: React, hooks
import React, { useEffect, useRef } from 'react';
// 1.2: Icons & providers
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowWrap';

// --- Area 2: Component definition ---
// 2.1: Quake3 component
function Quake3({ onClose: parentOnClose }) {
  const { openDraggableWindow } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();
  const windowIdRef = useRef(null);

  useEffect(() => {
    // 2.1.1: Set default window dimensions
    let windowWidth = 350;
    let windowHeight = 250;
    const minWindowWidth = 300;
    const minWindowHeight = 200;

    // 2.1.2: Detect vertical orientation and narrow screen
    const isVertical = window.innerHeight > window.innerWidth;
    const isNarrow  = window.innerWidth  < 600;

    // 2.1.3: Override size & position if vertical + narrow
    let initialX;
    if (isVertical && isNarrow) {
      windowWidth  = window.innerWidth - 16;            // full width minus 16px
      windowHeight = window.innerHeight / 2 - 113;      // half height minus 113px
      initialX     = 8;                                 // shift right by 8px
    }

    // 2.1.4: Build iframe URL with cache-buster
    const iframeUrl =
      '/WebintoshHD/Applications/Quake3/Quake3.htm?cb=' +
      Date.now();

    // 2.1.5: Open draggable window once
    const windowId = openDraggableWindow({
      id: 'Quake3',             // stable ID to dedupe in StrictMode
      title: 'Quake3',
      windowWidth,
      windowHeight,
      minWindowWidth,
      minWindowHeight,
      iframeSrc: iframeUrl,
      // include custom X offset if set
      ...(initialX !== undefined ? { initialX } : {}),
      onClose: () => {
        parentOnClose?.();     // notify parent on close
      },
    });

    windowIdRef.current = windowId;

    // 2.1.6: No cleanup here—DraggableWindowWrap handles closure
  }, [openDraggableWindow, parentOnClose, deviceInfo.deviceType]);

  return null;
}

// 2.2: connectorInfo metadata
Quake3.connectorInfo = {
  name: 'Quake3',
  icon: defaultIcon,
  priority: 4,
};

// --- Area 3: Export ---
// 3.1: default export
export default Quake3;
