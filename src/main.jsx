import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import LoadingScreen from './components/LoadingScreen/LoadingScreen.jsx';
import Wallpaper from './components/Wallpaper/Wallpaper.jsx';
import DeviceInfoProvider from './services/DeviceInfoProvider/DeviceInfoProvider.jsx';
import Notification, { notify } from './components/Notification/Notification.jsx';
import MenuBar from './components/MenuBar/MenuBar.jsx';
import { FocusProvider } from './interactions/FocusControl/FocusControl.jsx';
import { UIStateProvider } from './services/UIStateStorage/UIStateStorage.jsx';
import { MiniWindowProvider } from './components/MiniWindow/MiniWindowProvider.jsx';
import { DraggableWindowProvider } from './components/DraggableWindow/DraggableWindowProvider.jsx';
import { MusicServiceProvider } from './services/MusicService/MusicService.jsx';
import DisplayController from './services/DisplayController/DisplayController.jsx';
import { TerminalSettingsProvider } from './contexts/TerminalSettingsContext/TerminalSettingsProvider.jsx';
import WelcomeWrap from './components/WelcomeWrap/WelcomeWrap.jsx';

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
      <WelcomeWrap />
      <DeviceInfoProvider>
        <TerminalSettingsProvider>
          <UIStateProvider>
            <MusicServiceProvider>
              <DisplayController>
                <FocusProvider>
                  <Wallpaper />
                  <MiniWindowProvider>
                    <DraggableWindowProvider>
                      <div>
                        <div className={`loading-screen${loading ? '' : ' fade-out'}`}>
                          <LoadingScreen />
                        </div>
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
