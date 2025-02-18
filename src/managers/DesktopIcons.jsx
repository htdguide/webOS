import defaultIcon from '../media/icons/defaultapp.png'; // Example icon
import folderIcon from '../media/icons/folder.webp';
import SortingAlgorithms from '../apps/SortingAlgorithms/SortingAlgorithms.jsx';

/**
 * Instead of x,y, each icon now has a `priority` which determines
 * its order on the desktop grid. 1 is placed first, 2 second, etc.
 */
const DesktopIconsController = [
  {
    id: 'sorting-algorithms',
    name: 'Sorting Algorithms',
    icon: folderIcon,
    component: SortingAlgorithms,
    priority: 1,
  },

  // Example second icon (with higher priority)
  {
    id: 'example-app',
    name: 'Example App',
    icon: defaultIcon,
    component: null,
    priority: 2,
  },

  // Add more apps here as needed, with increasing `priority`
];

export default DesktopIconsController;
