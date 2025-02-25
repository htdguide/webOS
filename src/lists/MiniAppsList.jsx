import batteryIcon from '../media/icons/battery.png'; // Replace with your battery icon file
import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';

/**
 * List of miniapps for the menubar.
 * Lower priority numbers appear at the right (i.e. newer icons added from right to left).
 */
const MiniAppsList = [
  {
    id: 'battery',
    name: 'Battery',
    icon: batteryIcon,
    component: BatteryMiniApp,
    priority: 1,
  },
  // Add more icons/apps here as needed
];

export default MiniAppsList;