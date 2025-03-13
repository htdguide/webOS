import React, { createContext, useState } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png';
import folderIcon from '../../media/icons/folder.png';
import SortingAlgorithms from '../../apps/SortingAlgorithms/SortingAlgorithms.jsx';
import linkedinIcon from '../../media/icons/linkedin.png';
import githubIcon from '../../media/icons/github.png';
import awaiIcon from '../../media/icons/awai.png';
import finderIcon from '../../media/icons/finder.png';
import launchpadIcon from '../../media/icons/launchpad.png';
import settingsIcon from '../../media/icons/settings.png';
import safariIcon from '../../media/icons/safari.png';
import psxIcon from '../../media/icons/PSX.png';

/**
 * The initial list of apps.
 * The `indock` field determines if the icon should be rendered on the desktop.
 * If `indock` is true, the icon will not be rendered on the desktop.
 */
const initialAppsList = [
  {
    id: 'sorting-algorithms',
    name: 'Sorting Algorithms',
    icon: defaultIcon,
    component: SortingAlgorithms,
    priority: 4,
    indock: false,
  },
  {
    id: 'untitled-folder',
    name: 'untitled folder',
    icon: folderIcon,
    component: null,
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
});

export const AppsProvider = ({ children }) => {
  const [apps, setApps] = useState(initialAppsList);

  return (
    <AppsContext.Provider value={{ apps, setApps }}>
      {children}
    </AppsContext.Provider>
  );
};
