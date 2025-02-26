import batteryIcon from '../media/icons/battery.png';
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
    displayType: 'div',  // <--- Tells MiniApps to render the component inline in the menubar
  },
  // Add more icons/apps here as needed...
];

export default MiniAppsList;
