import SortingIcon from '../media/icons/macos-folder-icon.webp'; // Example icon
import SortingAlgorithms from '../apps/SortingAlgorithms/SortingAlgorithms';

const DesktopIconsController = [
  {
    id: 'sorting-algorithms',
    name: 'Sorting Algorithms',
    icon: SortingIcon,
    component: SortingAlgorithms,
    position: { x: 100, y: 100 }, // Initial position
  },
  
  // Add more apps here as needed
];

export default DesktopIconsController;
