// main.jsx
import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from '../DesktopAssembler/App.jsx';
import Wallpaper from '../../components/Wallpaper/Wallpaper.jsx';
import DeviceInfoProvider from '../../contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import Notification, { notify } from '../../components/Notification/Notification.jsx';
import MenuBar from '../../components/MenuBar/MenuBar.jsx';
import { FocusProvider } from '../../contexts/FocusControl/FocusControl.jsx';
import { MiniWindowProvider } from '../../components/MiniWindow/MiniWindowProvider.jsx';
import { DraggableWindowProvider } from '../../components/DraggableWindow/DraggableWindowProvider.jsx';
import { MusicServiceProvider } from '../../drivers/MusicService/MusicService.jsx';
import DisplayController from '../../drivers/DisplayController/DisplayController.jsx';
import WelcomeWrap from '../../components/WelcomeWrap/WelcomeWrap.jsx';
import { StateManagerProvider } from '../../stores/StateManager/StateManager.jsx';
import WasmModule from '../wasmModule/wasmModule.jsx';

const Main = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!loading) {
      const loadingScreen = document.querySelector('.loading-screen');
      if (loadingScreen) {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 1000);
      }
    }
  }, [loading]);

  useEffect(() => {
    const handleNotification = (event) => {
      notify(event.detail.message, event.detail.duration, event.detail.icon);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);

  return (
    <StrictMode>
      <StateManagerProvider>
        <DeviceInfoProvider>
          <WelcomeWrap />
          <MusicServiceProvider>
            <DisplayController>
              {/* Full-window container with a black background */}
              <div className="desktop-container">
                {/* The monitor defines the overall "screen" size */}
                <div className="desktop-monitor">
                  <FocusProvider>
                    <Wallpaper />
                    <MiniWindowProvider>
                      <DraggableWindowProvider>
                        <App />
                        <MenuBar />
                        <Notification />
                      </DraggableWindowProvider>
                    </MiniWindowProvider>
                  </FocusProvider>
                </div>
              </div>
            </DisplayController>
          </MusicServiceProvider>
        </DeviceInfoProvider>
      </StateManagerProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
