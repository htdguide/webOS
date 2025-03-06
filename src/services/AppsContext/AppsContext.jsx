import React, { createContext, useState } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png'; // Example icon
import folderIcon from '../../media/icons/folder.webp';
import SortingAlgorithms from '../../apps/SortingAlgorithms/SortingAlgorithms.jsx';
import linkedinIcon from '../../media/icons/linkedin.png';
import githubIcon from '../../media/icons/github.png';
import awaiIcon from '../../media/icons/awai.png';

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
    indock: true, // Initially in the dock, so not on desktop
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
    indock: false, // Initially in the dock, so not on desktop
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
