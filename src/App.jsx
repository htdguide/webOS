import React, { useState } from 'react';
import './App.css';
import Desktop from './components/Desktop/Desktop.jsx';
import DesktopAppsList from './lists/DesktopAppsList.jsx';

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
  );
}

export default App;

//s