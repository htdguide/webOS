import React, { useContext } from 'react';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import DesktopAssembler from '../DesktopAssembler/DesktopAssembler.jsx';
import { DraggableWindowWrap } from '../../components/DraggableWindow/DraggableWindowWrap.jsx';
import { FullscreenProvider, FullscreenContext } from '../../contexts/FullScreenContext/FullScreenContext.jsx';

const SystemUIContent = ({ wrapId }) => {
  const { isFullscreen } = useContext(FullscreenContext);

  return (
    <DraggableWindowWrap wrapId={wrapId}>
      <div className={`desktop-container${isFullscreen ? ' slide-left' : ''}`}>
        <div className="desktop-monitor">
          <MiniWindowProvider>
            <DesktopAssembler />
          </MiniWindowProvider>
        </div>
      </div>
    </DraggableWindowWrap>
  );
};

const SystemUI = ({ wrapId }) => (
  <FullscreenProvider>
    <SystemUIContent wrapId={wrapId} />
  </FullscreenProvider>
);

export default SystemUI;
