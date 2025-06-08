// src/components/SystemUI/SystemUI.jsx
import React from 'react';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import DesktopAssembler from '../DesktopAssembler/DesktopAssembler.jsx';
import { DraggableWindowWrap } from '../../components/DraggableWindow/DraggableWindowWrap.jsx';

const SystemUI = ({ wrapId }) => {
  return (
    <div className="desktop-container">
      <div className="desktop-monitor">
        <MiniWindowProvider>
          <DraggableWindowWrap wrapId={wrapId}>
            <DesktopAssembler />
          </DraggableWindowWrap>
        </MiniWindowProvider>
      </div>
    </div>
  );
};

export default SystemUI;
