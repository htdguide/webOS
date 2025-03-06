import React, { useState } from 'react';
import './App.css';
import Desktop from './components/Desktop/Desktop.jsx';
import { AppsContext } from './services/AppsContext/AppsContext.jsx';
import { AppsProvider } from './services/AppsContext/AppsContext.jsx';
import Dock from './components/Dock/Dock.jsx';

function App() {
  const [openApps, setOpenApps] = useState([]);

  const handleOpenApp = (appId) => {
    const appConfig = AppsContext.find((app) => app.id === appId);

    // If the app configuration has a link, open it in a new tab and do not add to openApps.
    if (appConfig?.link) {
      window.open(appConfig.link, '_blank');
      return;
    }

    // Otherwise, if the app is not already open, add it to the open apps list.
    if (!openApps.includes(appId)) {
      setOpenApps([...openApps, appId]);
    }
  };

  const handleCloseApp = (appId) => {
    setOpenApps(openApps.filter((id) => id !== appId));
  };

  return (
    <AppsProvider>
      <Dock />
      <div className="App">
        <Desktop onOpenApp={handleOpenApp} />
        {openApps.map((appId) => {
          const appConfig = DesktopAppsList.find((app) => app.id === appId);
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
      </AppsProvider>
  );
}

export default App;
