// src/webOS/apps/Mario64.jsx

// --- Area 1: Imports ---
// 1.1: React, hooks
import React, { useEffect, useRef } from 'react';
// 1.2: Icons & providers
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../../../src/webOS/contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../../../src/webOS/components/DraggableWindow/DraggableWindowWrap';

// --- Area 2: Component definition ---
// 2.1: Mario64 component
function Mario64({ onClose: parentOnClose }) {
  const { openDraggableWindow } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();
  const windowIdRef = useRef(null);

  useEffect(() => {
    // compute default dimensions
    let windowWidth = 372;
    let windowHeight = 300;
    const minWindowWidth = 300;
    const minWindowHeight = 200;

    // detect vertical orientation and narrow screen
    const isVertical = window.innerHeight > window.innerWidth;
    const isNarrow  = window.innerWidth  < 600;

    // override if vertical + narrow
    let initialX, initialY;
    if (isVertical && isNarrow) {
      windowWidth  = window.innerWidth - 16;                        // full width minus 16px
      windowHeight = window.innerHeight / 2 - 113;                  // half height minus 113px
      initialX     = 8;                                            // offset right by 8px
      // leave initialY undefined to use default top positioning
    }

    // build iframe URL with cache-buster
    const iframeUrl =
      '/WebintoshHD/Applications/Mario64/wasm/index.html?cb=' +
      Date.now();

    // open draggable window once
    const windowId = openDraggableWindow({
      id: 'Mario64',            // stable id to dedupe in StrictMode
      title: 'Super Mario 64',
      windowWidth,
      windowHeight,
      minWindowWidth,
      minWindowHeight,
      iframeSrc: iframeUrl,
      // only include position props if computed
      ...(initialX !== undefined ? { initialX } : {}),
      ...(initialY !== undefined ? { initialY } : {}),
      onClose: () => {
        parentOnClose?.();     // notify parent if needed
      },
    });

    windowIdRef.current = windowId;

    // no cleanup here—let DraggableWindowWrap handle closure
  }, [openDraggableWindow, parentOnClose, deviceInfo.deviceType]);

  return null;
}

// 2.2: connectorInfo metadata
Mario64.connectorInfo = {
  name: 'Super Mario 64',
  icon: defaultIcon,
  priority: 4,
};

// --- Area 3: Export ---
// 3.1: default export
export default Mario64;
