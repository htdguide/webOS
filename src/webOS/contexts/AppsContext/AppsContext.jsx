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
/**
 * The initial list of apps.
 * The `indock` field determines if the icon should be rendered on the desktop.
 */
const initialAppsList = [
  {
    id: 'interminal',
    name: 'Terminal',
    icon: terminalIcon,
    component: Noterminal,
    priority: 4,
    indock: false,
  },
  {
    id: 'mario',
    name: 'Mario64',
    icon: marioIcon,
    component: Mario64,
    priority: 5,
    indock: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: linkedinIcon,
    link: 'http://linkedin.com/in/htdguide/',
    component: null,
    priority: 2,
    indock: false,
  },
  {
    id: 'github',
    name: 'Github',
    icon: githubIcon,
    link: 'https://github.com/htdguide',
    component: null,
    priority: 1,
    indock: false,
  },
  {
    id: 'awai',
    name: 'ApplyWithAI',
    icon: awaiIcon,
    link: 'https://applywithai.com',
    component: null,
    priority: 3,
    indock: false,
  },
  {
    id: 'finder',
    name: 'Finder',
    icon: finderIcon,
    component: null,
    priority: 1,
    indock: true,
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    icon: launchpadIcon,
    component: null,
    priority: 2,
    indock: true,
  },
  {
    id: 'safari',
    name: 'Safari',
    icon: safariIcon,
    component: null,
    priority: 3,
    indock: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: settingsIcon,
    component: null,
    priority: 5,
    indock: true,
  },
  {
    id: 'psx',
    name: 'PSX',
    icon: psxIcon,
    component: null,
    priority: 6,
    indock: true,
  },
  {
    id: 'testapp2',
    name: 'TestApp2',
    icon: defaultIcon,
    component: null,
    priority: 7,
    indock: true,
  },
  {
    id: 'testapp3',
    name: 'TestApp3',
    icon: defaultIcon,
    component: null,
    priority: 8,
    indock: true,
  },
  {
    id: 'testapp4',
    name: 'TestApp4',
    icon: defaultIcon,
    component: null,
    priority: 9,
    indock: true,
  },
];

export const AppsContext = createContext({
  apps: initialAppsList,
  setApps: () => {},
  openedApps: [],
  setOpenedApps: () => {},
  addApp: () => {},
});

export const AppsProvider = ({ children }) => {
  const [apps, setApps] = useState(initialAppsList);
  const [openedApps, setOpenedApps] = useState([]);

  /**
   * Adds a new app to the apps list if it doesn't already exist.
   * Optionally, if open is true, also adds the app to the openedApps list.
   *
   * @param {Object} app - The app object to add.
   * @param {boolean} [open=false] - Whether to add the app to the openedApps list.
   */
  const addApp = (app, open = false) => {
    setApps((prevApps) => {
      // Only add the app if it doesn't exist yet.
      if (!prevApps.find((a) => a.id === app.id)) {
        return [...prevApps, app];
      }
      return prevApps;
    });

    if (open) {
      setOpenedApps((prevOpened) => {
        // Only add the app if it's not already opened.
        if (!prevOpened.find((a) => a.id === app.id)) {
          return [...prevOpened, app];
        }
        return prevOpened;
      });
    }
  };

  return (
    <AppsContext.Provider value={{ apps, setApps, openedApps, setOpenedApps, addApp }}>
      {children}
    </AppsContext.Provider>
  );
};
