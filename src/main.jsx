import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './webOS/App.jsx';
import Wallpaper from './webOS/components/Wallpaper/Wallpaper.jsx';
import DeviceInfoProvider from './webOS/contexts/DeviceInfoProvider/DeviceInfoProvider.jsx';
import Notification, { notify } from './webOS/components/Notification/Notification.jsx';
import MenuBar from './webOS/components/MenuBar/MenuBar.jsx';
import { FocusProvider } from './webOS/contexts/FocusControl/FocusControl.jsx';
import { UIStateProvider } from './webOS/contexts/UIStateStorage/UIStateStorage.jsx';
import { MiniWindowProvider } from './webOS/components/MiniWindow/MiniWindowProvider.jsx';
import { DraggableWindowProvider } from './webOS/components/DraggableWindow/DraggableWindowProvider.jsx';
import { MusicServiceProvider } from './webOS/drivers/MusicService/MusicService.jsx';
import DisplayController from './webOS/drivers/DisplayController/DisplayController.jsx';
import { TerminalSettingsProvider } from './webOS/contexts/TerminalSettingsContext/TerminalSettingsProvider.jsx';
import WelcomeWrap from './webOS/components/WelcomeWrap/WelcomeWrap.jsx';

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
    return () =>
      window.removeEventListener('show-notification', handleNotification);
  }, []);

  return (
    <StrictMode>
      <DeviceInfoProvider>
        <TerminalSettingsProvider>
          <UIStateProvider>
            <WelcomeWrap />
            <MusicServiceProvider>
              <DisplayController>
                <FocusProvider>
                  <Wallpaper />
                  <MiniWindowProvider>
                    <DraggableWindowProvider>
                      <div>
                        <App />
                        <MenuBar />
                        <Notification />
                      </div>
                    </DraggableWindowProvider>
                  </MiniWindowProvider>
                </FocusProvider>
              </DisplayController>
            </MusicServiceProvider>
          </UIStateProvider>
        </TerminalSettingsProvider>
      </DeviceInfoProvider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<Main />);
