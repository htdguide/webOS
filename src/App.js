import React, { useState } from 'react';
import './App.css';
import MenuBar from './components/MenuBar/MenuBar';
import Wallpaper from './components/Wallpaper/Wallpaper';
import Desktop from './components/Desktop/Desktop';
import DesktopIconsController from './controllers/DesktopIcons';

function App() {
  const [openApps, setOpenApps] = useState([]);

  const handleOpenApp = (appId) => {
    if (!openApps.includes(appId)) {
      setOpenApps([...openApps, appId]);
    }
  };

  const handleCloseApp = (appId) => {
    setOpenApps(openApps.filter((id) => id !== appId));
  };

  return (
    <div className="App">
      <MenuBar />
      <Wallpaper />
      <Desktop onOpenApp={handleOpenApp} />
      {openApps.map((appId) => {
        const appConfig = DesktopIconsController.find((app) => app.id === appId);
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
  );
}

export default App;

//s