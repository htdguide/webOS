import batteryIcon from '../media/icons/battery.png';
import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';
import BatteryBarApp from '../miniapps/BatteryMiniApp/BatteryBarApp';

const MiniAppsList = [
  {
    id: 'battery',
    name: 'Battery',
    miniApp: BatteryMiniApp,  // Full app displayed in MiniWindow
    barApp: BatteryBarApp,    // Small inline app for the menubar
    priority: 1,
  },
];

export default MiniAppsList;
