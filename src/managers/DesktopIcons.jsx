import defaultIcon from '../media/icons/defaultapp.png'; // Example icon
import SortingAlgorithms from '../apps/SortingAlgorithms/SortingAlgorithms.jsx';

const DesktopIconsController = [
  {
    id: 'sorting-algorithms',
    name: 'Sorting Algorithms',
    icon: defaultIcon,
    component: SortingAlgorithms,
    position: { x: 100, y: 100 }, // Initial position
  },
  
  // Add more apps here as needed
];

export default DesktopIconsController;
