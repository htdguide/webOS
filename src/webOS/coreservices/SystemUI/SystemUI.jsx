// SystemUI.jsx
import React from 'react';
import { FocusProvider } from '../../contexts/FocusControl/FocusControl.jsx';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import { DraggableWindowProvider } from '../../components/DraggableWindow/DraggableWindowProvider.jsx';
import DesktopAssembler from '../DesktopAssembler/DesktopAssembler.jsx';

const SystemUI = () => {
  return (
    <div className="desktop-container">
      <div className="desktop-monitor">
        <FocusProvider>
          <MiniWindowProvider>
            <DraggableWindowProvider>
              <DesktopAssembler />
            </DraggableWindowProvider>
          </MiniWindowProvider>
        </FocusProvider>
      </div>
    </div>
  );
};

export default SystemUI;
