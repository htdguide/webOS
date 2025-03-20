import React, { useEffect, useContext } from 'react';
import { AppsContext } from './AppsContext';

const AppConnector = ({ componentApp, open = false }) => {
  const { setApps, setOpenedApps } = useContext(AppsContext);

  useEffect(() => {
    // Ensure the component has connectorInfo defined
    if (componentApp && componentApp.connectorInfo) {
      const { name, icon, priority } = componentApp.connectorInfo;
      // Generate a unique id from the name (e.g., "Sorting Algorithms" becomes "sorting-algorithms")
      const id = name.toLowerCase().replace(/\s+/g, '-');

      const app = {
        id,
        name,
        icon,
        component: componentApp,
        priority: priority || 10, // Use provided priority or default to 10
        indock: false, // Default: the app is not in the dock
      };

      // Remove any existing app with the same id and add the new app
      setApps((prevApps) => {
        const filteredApps = prevApps.filter((a) => a.id !== id);
        return [...filteredApps, app];
      });

      // If "open" is true, add the app to the opened apps list (removing any duplicate)
      if (open) {
        setOpenedApps((prevOpened) => {
          const filteredOpened = prevOpened.filter((a) => a.id !== id);
          return [...filteredOpened, app];
        });
      }
    }
  }, [componentApp, open, setApps, setOpenedApps]);

  // This component does not render any UI – it only connects the app.
  return null;
};

export default AppConnector;
