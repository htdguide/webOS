// src/components/MiniWindow/MiniWindow.jsx

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { useLogger } from '../Logger/Logger.jsx';

function MiniWindow({ anchorPos, onClose, children, className = '', visible = true }) {
  const { log, enabled } = useLogger('MiniWindow');
  const miniWindowRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Log mount/unmount
  useEffect(() => {
    if (enabled) log('lifecycle', 'MiniWindow mounted');
    return () => {
      if (enabled) log('lifecycle', 'MiniWindow unmounted');
    };
  }, [enabled]);

  // Log anchorPos changes
  useEffect(() => {
    if (enabled) {
      const x = anchorPos?.x ?? 'null';
      const y = anchorPos?.y ?? 'null';
      log('state', `anchorPos changed to x=${x}, y=${y}`);
    }
  }, [anchorPos, enabled]);

  useLayoutEffect(() => {
    if (enabled) log('layout', 'useLayoutEffect triggered for anchorPos');
    if (anchorPos && miniWindowRef.current) {
      const container = miniWindowRef.current.parentNode;
      const containerRect = container.getBoundingClientRect();
      const rect = miniWindowRef.current.getBoundingClientRect();
      if (enabled) {
        log('layout', `ContainerRect width=${containerRect.width}, height=${containerRect.height}`);
        log('layout', `MiniWindow rect width=${rect.width}, height=${rect.height}`);
      }

      let top = anchorPos.y;
      let left = anchorPos.x;

      // Adjust if overflow on right
      if (left + rect.width > containerRect.width) {
        left = containerRect.width - rect.width - 5;
        if (enabled) log('layout', `Adjusted left overflow to ${left}`);
      }
      // Adjust if overflow on bottom
      if (top + rect.height > containerRect.height) {
        top = containerRect.height - rect.height - 5;
        if (enabled) log('layout', `Adjusted top overflow to ${top}`);
      }
      // Ensure not too close to edges
      top = Math.max(10, top);
      left = Math.max(10, left);
      if (enabled) log('layout', `Final computed position top=${top}, left=${left}`);

      setPosition({ top, left });
    }
  }, [anchorPos, enabled]);

  if (enabled) {
    log('render', `Rendering MiniWindow at top=${position.top}, left=${position.left}, visible=${visible}`);
  }

  return (
    <div
      ref={miniWindowRef}
      className={className}
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        opacity: visible ? 1 : 0,
        zIndex: 410,
        transition: 'opacity 300ms ease-in-out, backdrop-filter 300ms ease-in-out'
      }}
    >
      {children}
    </div>
  );
}

export default MiniWindow;
