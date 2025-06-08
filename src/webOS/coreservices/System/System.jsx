// System.jsx
import React from 'react';
import { StateManagerProvider } from '../../stores/StateManager/StateManager.jsx';
import DeviceInfoProvider from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { MusicServiceProvider } from '../../drivers/MusicService/MusicService.jsx';
import DisplayController from '../../drivers/DisplayController/DisplayController.jsx';
import { NotificationProvider } from '../../components/Notification/NotificationProvider.jsx';
import { WallpaperSrc } from '../../components/Wallpaper/WallpaperSrc.jsx';
import { DraggableWindowProvider } from '../../components/DraggableWindow/DraggableWindowProvider.jsx';
import { FocusProvider } from '../../contexts/FocusControl/FocusControl.jsx';

const System = ({ children }) => {
  return (
    <StateManagerProvider>
      <WallpaperSrc>
        <DeviceInfoProvider>
          <MusicServiceProvider>
            <DisplayController>
              <NotificationProvider>
                <FocusProvider>
                  <DraggableWindowProvider>
                    {children}
                  </DraggableWindowProvider>
                  </FocusProvider>
              </NotificationProvider>
            </DisplayController>
          </MusicServiceProvider>
        </DeviceInfoProvider>
      </WallpaperSrc>
    </StateManagerProvider>
  );
};

export default System;
