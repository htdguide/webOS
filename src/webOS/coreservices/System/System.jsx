// System.jsx
import React from 'react';
import { StateManagerProvider } from '../../stores/StateManager/StateManager.jsx';
import DeviceInfoProvider from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import { MusicServiceProvider } from '../../drivers/MusicService/MusicService.jsx';
import DisplayController from '../../drivers/DisplayController/DisplayController.jsx';

const System = ({ children }) => {
  return (
    <StateManagerProvider>
      <DeviceInfoProvider>
        <MusicServiceProvider>
          <DisplayController>
            {children}
          </DisplayController>
        </MusicServiceProvider>
      </DeviceInfoProvider>
    </StateManagerProvider>
  );
};

export default System;
