// src/DesktopAssembler.jsx
import React, { useContext, useEffect } from 'react';
import './DesktopAssembler.css';
import Desktop from '../../components/Desktop/Desktop.jsx';
import { AppsContext, AppsProvider } from '../../contexts/AppsContext/AppsContext.jsx';
// Import the TaskManagerProvider and hook
import { TaskManagerProvider, useTaskManager } from '../../components/TaskManager/TaskManager.jsx';
import { useNotification } from '../../components/Notification/NotificationProvider.jsx';
import MenuBar from '../../components/MenuBar/MenuBar.jsx';
import Wallpaper from '../../components/Wallpaper/Wallpaper.jsx';
import WelcomeWrap from '../../components/WelcomeWrap/WelcomeWrap.jsx';

/**
 * AppContent is responsible for rendering the desktop and handling icon double-clicks.
 * When a desktop icon is double-clicked, it calls openTask unconditionally—even if the
 * same app is already open, this will create another window immediately.
 */
function AppContent() {
  const { apps } = useContext(AppsContext);
  const { notify } = useNotification();
  const { openTask } = useTaskManager();

  useEffect(() => {
    // Fire a test notification once when the desktop loads
    notify('Test Notification: App has loaded!', 3000, '');
  }, [notify]);

  /**
   * Called when an icon is double-clicked on the desktop.
   * If the app has a `link`, open in a new tab. Otherwise, call openTask
   * without any guard—this always spawns a new window, even if it's the
   * same app as an existing one.
   */
  const handleOpenApp = (appId) => {
    const appConfig = apps.find((app) => app.id === appId);
    if (!appConfig) return;

    if (appConfig.link) {
      window.open(appConfig.link, '_blank');
      return;
    }

    // ALWAYS open a new instance, regardless of whether one is already open
    openTask(appConfig);
  };

  return (
    <>
      <WelcomeWrap />
      <Wallpaper />
      <MenuBar />
      <div className="App">
        <Desktop onOpenApp={handleOpenApp} />
      </div>
    </>
  );
}

/**
 * The root App wraps everything in both AppsProvider and TaskManagerProvider.
 * TaskManagerProvider must wrap AppContent so that AppContent can call openTask().
 */
function App() {
  return (
    <AppsProvider>
      <TaskManagerProvider>
        <AppContent />
      </TaskManagerProvider>
    </AppsProvider>
  );
}

export default App;
