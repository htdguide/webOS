// App.jsx
import React, { useState, useContext } from 'react';
import './App.css';
import Desktop from '../../components/Desktop/Desktop.jsx';
import { AppsContext, AppsProvider } from '../../contexts/AppsContext/AppsContext.jsx';
import Dock from '../../components/Dock/Dock.jsx';

// Component that uses the AppsContext and manages opened apps.
function AppContent() {
  const { apps } = useContext(AppsContext);
  const [openApps, setOpenApps] = useState([]);

  const handleOpenApp = (appId) => {
    const appConfig = apps.find((app) => app.id === appId);

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
    <>
      <Dock />
      <div className="App">
        <Desktop onOpenApp={handleOpenApp} />
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
      <div className="version">
        v0.2.4 alpha
      </div>
    </>
  );
}

function App() {
  return (
    <AppsProvider>
      <AppContent />
    </AppsProvider>
  );
}

export default App;
