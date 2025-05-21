// System.jsx
import React from 'react';
import { StateManagerProvider } from '../../stores/StateManager/StateManager.jsx';
import DeviceInfoProvider from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { MusicServiceProvider } from '../../drivers/MusicService/MusicService.jsx';
import DisplayController from '../../drivers/DisplayController/DisplayController.jsx';
import { NotificationProvider } from '../../components/Notification/NotificationProvider.jsx';
import { WallpaperSync } from '../../components/Wallpaper/WallpaperSync.jsx';

const System = ({ children }) => {
  return (
    <StateManagerProvider>
      <WallpaperSync>
        <DeviceInfoProvider>
          <MusicServiceProvider>
            <DisplayController>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </DisplayController>
          </MusicServiceProvider>
        </DeviceInfoProvider>
      </WallpaperSync>
    </StateManagerProvider>
  );
};

export default System;
