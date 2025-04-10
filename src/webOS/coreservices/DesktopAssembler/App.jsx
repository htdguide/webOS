// App.jsx
import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import Desktop from '../../components/Desktop/Desktop.jsx';
import { AppsContext, AppsProvider } from '../../contexts/AppsContext/AppsContext.jsx';
import Dock from '../../components/Dock/Dock.jsx';
// Import the notification hook from the NotificationProvider wrapper.
import { useNotification } from '../../components/Notification/NotificationProvider.jsx';

function AppContent() {
  const { apps } = useContext(AppsContext);
  const [openApps, setOpenApps] = useState([]);
  // Get the notify function from our NotificationProvider context.
  const { notify } = useNotification();

  useEffect(() => {
    // Send a test notification when AppContent loads.
    notify("Test Notification: App has loaded!", 3000, '');
  }, [notify]);

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
