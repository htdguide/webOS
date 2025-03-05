import defaultIcon from '../media/icons/defaultapp.png'; // Example icon
import folderIcon from '../media/icons/folder.webp';
import SortingAlgorithms from '../apps/SortingAlgorithms/SortingAlgorithms.jsx';
import linkedinIcon from '../media/icons/linkedin.png';
import githubIcon from '../media/icons/github.png';
import awaiIcon from '../media/icons/awai.png';

/**
 * Each icon now has a `priority` which determines its order on the desktop grid.
 * Additionally, apps that are only links have a `link` property.
 */
const DesktopAppsList = [
  {
    id: 'sorting-algorithms',
    name: 'Sorting Algorithms',
    icon: defaultIcon,
    component: SortingAlgorithms,
    priority: 4,
  },

  {
    id: 'untitled-folder',
    name: 'untitled folder',
    icon: folderIcon,
    component: null,
    priority: 5,
  },

  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: linkedinIcon,
    link: 'http://linkedin.com/in/htdguide/',
    component: null,
    priority: 2,
  },

  {
    id: 'github',
    name: 'Github',
    icon: githubIcon,
    link: 'https://github.com/htdguide',
    component: null,
    priority: 1,
  },

  {
    id: 'awai',
    name: 'ApplyWithAI',
    icon: awaiIcon,
    link: 'https://applywithai.com',
    component: null,
    priority: 3,
  },

  // Add more apps here as needed, with increasing `priority`
];

export default DesktopAppsList;
