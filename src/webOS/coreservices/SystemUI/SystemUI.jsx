import React, { useContext } from 'react';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import DesktopAssembler from '../DesktopAssembler/DesktopAssembler.jsx';
import { DraggableWindowWrap } from '../../components/DraggableWindow/DraggableWindowWrap.jsx';
import {
  FullscreenProvider,
  FullscreenSpace
} from '../../components/FullScreenSpace/FullScreenSpace.jsx';
import './SystemUI.css';

const SystemUIContent = () => {
  // now grabs wrapId from context as well as fullscreen state
  const {
    isFullscreen,
    fullscreenWindowId,
    wrapId: contextWrapId
  } = useContext(FullscreenSpace);

  const isThisFullscreen =
    isFullscreen && fullscreenWindowId === contextWrapId;

  return (
    <DraggableWindowWrap wrapId={contextWrapId}>
      <div
        className={`desktop-monitor${
          isThisFullscreen ? ' slide-left' : ''
        }`}
      >
        <MiniWindowProvider>
          <DesktopAssembler />
        </MiniWindowProvider>
      </div>
    </DraggableWindowWrap>
  );
};

const SystemUI = ({ wrapId }) => (
  // pass wrapId into FullscreenProvider
  <FullscreenProvider wrapId={wrapId}>
    <SystemUIContent />
  </FullscreenProvider>
);

export default SystemUI;
