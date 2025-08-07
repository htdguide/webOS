// src/webOS/components/SystemUI/SystemUI.jsx

/**
 * SystemUI.jsx sets up a draggable-window wrap and fullscreen provider
 * around your desktop. When **any** window inside this wrap is fullscreen,
 * the `.desktop-monitor` slides (via the `slide-left` class).
 *
 * Areas:
 * 1: Imports & Hooks (1.1, 1.2)
 * 2: SystemUIContent (2.1 … 2.3)
 * 3: SystemUI (3.1)
 */

// ================================
// Area 1: Imports & Hooks
// ================================
// 1.1: React + styling + fullscreen context
import React, { useContext } from 'react';
import './SystemUI.css';
import { FullscreenSpace, FullscreenProvider } from '../../components/FullScreenSpace/FullScreenSpace.jsx';
// 1.2: Draggable-window context to inspect all windows in this wrap
import { useDraggableWindowContext } from '../../contexts/DraggableWindowProvider/DraggableWindowProvider.jsx';
import { DraggableWindowWrap } from '../../components/DraggableWindow/DraggableWindowWrap.jsx';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import DesktopAssembler from '../DesktopAssembler/DesktopAssembler.jsx';

// ====================================
// Area 2: SystemUIContent
// ====================================
const SystemUIContent = () => {
  // 2.1: Grab fullscreen flags + wrapId, plus global windows list
  const { isFullscreen, fullscreenWindowId, wrapId: contextWrapId } =
    useContext(FullscreenSpace);
  const { windows } = useDraggableWindowContext();

  // 2.2: Only slide if a window in *this* wrap is fullscreen
  const isThisFullscreen =
    isFullscreen &&
    windows.some(
      (w) =>
        w.wrapId === contextWrapId && w.windowId === fullscreenWindowId
    );

  // 2.3: Render with slide-left when appropriate
  return (
    <MiniWindowProvider>
      <DraggableWindowWrap wrapId={contextWrapId}>
        <div
          className={`desktop-monitor${
            isThisFullscreen ? ' slide-left' : ''
          }`}
        >
          <DesktopAssembler desktopId={contextWrapId} />
        </div>
      </DraggableWindowWrap>
    </MiniWindowProvider>
  );
};

// ================================
// Area 3: SystemUI
// ================================
// 3.1: Top-level component that provides fullscreen scope
const SystemUI = ({ wrapId }) => (
  <FullscreenProvider wrapId={wrapId}>
    <SystemUIContent />
  </FullscreenProvider>
);

export default SystemUI;
