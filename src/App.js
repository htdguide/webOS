import React, { useState } from 'react';
import './App.css';
import MenuBar from './components/MenuBar/MenuBar';
import Wallpaper from './components/Wallpaper/Wallpaper';
import Desktop from './components/Desktop/Desktop';
import SortingAlgorithms from './apps/SortingAlgorithms/SortingAlgorithms';

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
      <Desktop onOpenSortingWindow={() => handleOpenApp('sorting-algorithms')} />
      {openApps.includes('sorting-algorithms') && (
        <SortingAlgorithms onClose={() => handleCloseApp('sorting-algorithms')} />
      )}
    </div>
  );
}

export default App;
