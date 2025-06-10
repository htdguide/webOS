// src/webOS/apps/Quake3.jsx
import React, { useEffect, useRef } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import { useDraggableWindow } from '../../components/DraggableWindow/DraggableWindowWrap';

function Quake3({ onClose: parentOnClose }) {
  const { openDraggableWindow } = useDraggableWindow();
  const deviceInfo = useDeviceInfo();
  const windowIdRef = useRef(null);

  useEffect(() => {
    const iframeUrl =
      '/WebintoshHD/Applications/Quake3/Quake3.htm?cb=' + Date.now();

    // open _once_
    const windowId = openDraggableWindow({
      id: 'Quake3',            // stable ID to dedupe StrictMode
      title: 'Quake3',
      windowWidth: 800,
      windowHeight: 600,
      minWindowWidth: 600,
      minWindowHeight: 400,
      iframeSrc: iframeUrl,
      onClose: () => {
        // called when the user clicks the X
        parentOnClose?.();
        // DraggableWindowWrap will handle the actual close by windowId
      },
    });

    windowIdRef.current = windowId;

    // — no cleanup here —
  }, [openDraggableWindow, parentOnClose, deviceInfo.deviceType]);

  return null;
}

Quake3.connectorInfo = {
  name: 'Quake3',
  icon: defaultIcon,
  priority: 4,
};

export default Quake3;
