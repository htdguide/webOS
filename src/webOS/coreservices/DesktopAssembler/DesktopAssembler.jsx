// src/components/DesktopAssembler/DesktopAssembler.jsx

import React, { useContext, useEffect } from 'react';
import './DesktopAssembler.css';
import { AppsContext } from '../../contexts/AppsContext/AppsContext.jsx';
import { useNotification } from '../../components/Notification/NotificationProvider.jsx';
import MenuBar from '../../components/MenuBar/MenuBar.jsx';
import Wallpaper from '../../components/Wallpaper/Wallpaper.jsx';
import WelcomeWrap from '../../components/WelcomeWrap/WelcomeWrap.jsx';
import IconGrid from '../../components/IconGrid/IconGrid.jsx';
import icon from '../../media/icons/finder.png';

/**
 * desktopId: unique string for this instance
 */
function DesktopAssembler({ desktopId = 'default' }) {
  const { apps, getOpenApps, openApp, closeApp } = useContext(AppsContext);
  const openApps = getOpenApps(desktopId);
  const { notify } = useNotification();

  useEffect(() => {
    //notify('Test Notification: App has loaded!', 3000, icon);
  }, [notify]);

  const handleOpenApp = (appId) => {
    openApp(desktopId, appId);
  };

  const handleCloseApp = (appId) => {
    closeApp(desktopId, appId);
  };

  return (
    <>
      <WelcomeWrap />
      <Wallpaper />
      <MenuBar />
      <div className="App">
        <IconGrid onOpenApp={handleOpenApp} />
        {openApps.map((appId) => {
          const appConfig = apps.find((app) => app.id === appId);
          const AppComponent = appConfig?.component;
          return (
            AppComponent && (
              <AppComponent
                key={appId}
                onClose={() => handleCloseApp(appId)}
              />
            )
          );
        })}
      </div>
    </>
  );
}

export default DesktopAssembler;
