// System.jsx
import React from 'react';
import { StateManagerProvider } from '../../stores/StateManager/StateManager.jsx';
import DeviceInfoProvider from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { MusicServiceProvider } from '../../drivers/MusicService/MusicService.jsx';
import DisplayController from '../../drivers/DisplayController/DisplayController.jsx';
import { NotificationProvider } from '../../components/Notification/NotificationProvider.jsx';

const System = ({ children }) => {
  return (
    <StateManagerProvider>
      <DeviceInfoProvider>
        <MusicServiceProvider>
          <DisplayController>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </DisplayController>
        </MusicServiceProvider>
      </DeviceInfoProvider>
    </StateManagerProvider>
  );
};

export default System;
