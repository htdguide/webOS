// src/contexts/AppsContext/AppsContext.jsx

import React, { createContext, useState } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png';
import folderIcon from '../../media/icons/folder.png';
import linkedinIcon from '../../media/icons/linkedin.png';
import githubIcon from '../../media/icons/github.png';
import awaiIcon from '../../media/icons/awai.png';
import finderIcon from '../../media/icons/finder.png';
import launchpadIcon from '../../media/icons/launchpad.png';
import settingsIcon from '../../media/icons/settings.png';
import safariIcon from '../../media/icons/safari.png';
import psxIcon from '../../media/icons/PSX.png';
import Noterminal from '../../initialapps/Noterminal/Noterminal.jsx';
import terminalIcon from '../../media/icons/terminal.png';
import Mario64 from '../../initialapps/Mario64/Mario64.jsx';
import marioIcon from '../../media/icons/mario64.png';
import quakeIcon from '../../media/icons/quake3.png';
import Quake3 from '../../initialapps/Quake3/Quake3.jsx';
import missionControlIcon from '../../media/icons/missioncontrol.png';

/**
 * The initial list of apps.
 * `indock` → should show on dock by default.
 * `available` → whether the app can be opened.
 */
const initialAppsList = [
  {
    id: 'interminal',
    name: 'Terminal',
    icon: terminalIcon,
    component: Noterminal,
    priority: 4,
    indock: false,
    available: true,
  },
  {
    id: 'mario',
    name: 'Mario64',
    icon: marioIcon,
    component: Mario64,
    priority: 5,
    indock: false,
    available: true,
  },
  {
    id: 'quake3',
    name: 'Quake3',
    icon: quakeIcon,
    component: Quake3,
    priority: 6,
    indock: false,
    available: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: linkedinIcon,
    link: 'http://linkedin.com/in/htdguide/',
    component: null,
    priority: 2,
    indock: false,
    available: true,
  },
  {
    id: 'github',
    name: 'Github',
    icon: githubIcon,
    link: 'https://github.com/htdguide',
    component: null,
    priority: 1,
    indock: false,
    available: true,
  },
  {
    id: 'awai',
    name: 'ApplyWithAI',
    icon: awaiIcon,
    link: 'https://applywithai.com',
    component: null,
    priority: 3,
    indock: false,
    available: true,
  },
  {
    id: 'finder',
    name: 'Finder',
    icon: finderIcon,
    component: null,
    priority: 1,
    indock: true,
    available: false,
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    icon: launchpadIcon,
    component: null,
    priority: 2,
    indock: true,
    available: false,
  },
  {
    id: 'missioncontrol',
    name: 'Mission Control',
    icon: missionControlIcon,
    component: null,
    priority: 3,
    indock: true,
    available: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: settingsIcon,
    component: null,
    priority: 5,
    indock: true,
    available: false,
  },
  {
    id: 'psx',
    name: 'PSX',
    icon: psxIcon,
    component: null,
    priority: 6,
    indock: true,
    available: false,
  },
];

export const AppsContext = createContext({
  apps: [],
  setApps: () => {},
  addApp: () => {},
  getOpenApps: (desktopId) => [],
  openApp: (desktopId, appId) => {},
  closeApp: (desktopId, appId) => {},
});

export const AppsProvider = ({ children, initialApps = initialAppsList }) => {
  // Static list of all available apps
  const [apps, setApps] = useState(initialApps);

  // Map from desktopId → array of open app IDs
  const [openAppsByDesktop, setOpenAppsByDesktop] = useState({});

  /**
   * Add a new app to the global apps list.
   * Does nothing if the app ID already exists.
   */
  const addApp = (app) => {
    setApps((prev) =>
      prev.some((a) => a.id === app.id) ? prev : [...prev, app]
    );
  };

  /**
   * Get the list of open app IDs for a given desktop.
   */
  const getOpenApps = (desktopId) => {
    return openAppsByDesktop[desktopId] || [];
  };

  /**
   * Open an app on the specified desktop.
   * If the app has a `link`, opens in new tab and does not track in state.
   * Otherwise adds the app ID to that desktop's openApps array.
   */
  const openApp = (desktopId, appId) => {
    const app = apps.find((a) => a.id === appId);
    if (!app) return;

    if (app.link) {
      window.open(app.link, '_blank', 'noopener,noreferrer');
      return;
    }

    setOpenAppsByDesktop((prev) => {
      const current = prev[desktopId] || [];
      if (current.includes(appId)) return prev;
      return {
        ...prev,
        [desktopId]: [...current, appId],
      };
    });
  };

  /**
   * Close an open app on the specified desktop.
   */
  const closeApp = (desktopId, appId) => {
    setOpenAppsByDesktop((prev) => {
      const current = prev[desktopId] || [];
      return {
        ...prev,
        [desktopId]: current.filter((id) => id !== appId),
      };
    });
  };

  return (
    <AppsContext.Provider
      value={{
        apps,
        setApps,
        addApp,
        getOpenApps,
        openApp,
        closeApp,
      }}
    >
      {children}
    </AppsContext.Provider>
  );
};
