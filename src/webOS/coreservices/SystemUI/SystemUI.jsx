// SystemUI.jsx
import React from 'react';
import { FocusProvider } from '../../contexts/FocusControl/FocusControl.jsx';
import Wallpaper from '../../components/Wallpaper/Wallpaper.jsx';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import { DraggableWindowProvider } from '../../components/DraggableWindow/DraggableWindowProvider.jsx';
import { NotificationProvider } from '../../components/Notification/NotificationProvider.jsx';
import App from '../DesktopAssembler/App.jsx';
import MenuBar from '../../components/MenuBar/MenuBar.jsx';

const SystemUI = () => {
  return (
    <div className="desktop-container">
      <div className="desktop-monitor">
        <FocusProvider>
          <Wallpaper />
          <MiniWindowProvider>
            <DraggableWindowProvider>
              <NotificationProvider>
                <App />
                <MenuBar />
              </NotificationProvider>
            </DraggableWindowProvider>
          </MiniWindowProvider>
        </FocusProvider>
      </div>
    </div>
  );
};

export default SystemUI;
