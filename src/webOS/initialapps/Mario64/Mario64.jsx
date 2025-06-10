// src/webOS/apps/Mario64.jsx
import React, { useEffect, useRef } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../../../src/webOS/contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../../../src/webOS/components/DraggableWindow/DraggableWindowWrap';

function Mario64({ onClose: parentOnClose }) {
  const { openDraggableWindow } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();
  const windowIdRef = useRef(null);

  useEffect(() => {
    const iframeUrl = 
      '/WebintoshHD/Applications/Mario64/wasm/index.html?cb=' +
      Date.now();

    // open _once_
    const windowId = openDraggableWindow({
      id: 'Mario64',            // stable id to dedupe StrictMode
      title: 'Super Mario 64',
      windowWidth: 800,
      windowHeight: 600,
      minWindowWidth: 600,
      minWindowHeight: 400,
      iframeSrc: iframeUrl,
      onClose: () => {
        // called when user clicks the X
        parentOnClose?.();     // tell your parent if you need to
        // DraggableWindowWrap will then call providerClose(windowId)
      },
    });

    windowIdRef.current = windowId;

    // — no cleanup closing the window here —
    // return () => { closeDraggableWindow(windowId) }
  }, [openDraggableWindow, parentOnClose, deviceInfo.deviceType]);

  return null;
}

Mario64.connectorInfo = {
  name: 'Super Mario 64',
  icon: defaultIcon,
  priority: 4,
};

export default Mario64;
