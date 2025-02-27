import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';
import BatteryBarApp from '../miniapps/BatteryMiniApp/BatteryBarApp';
import ControlCentreMiniApp from '../miniapps/ControlCentreMiniApp/ControlCentreMiniApp';
import ControlCentreIcon from '../media/assets/controlcentre.png';

const MiniAppsList = [
  {
    id: 'battery',
    name: 'Battery',
    miniApp: BatteryMiniApp,  // Full app displayed in MiniWindow
    barApp: BatteryBarApp,    // Small inline app for the menubar
    priority: 2,
  },
  {
    id: 'control-centre',
    name: 'Control Centre',
    miniApp: ControlCentreMiniApp,  // Only the MiniApp, no BarApp needed
    barApp: null,
    icon: ControlCentreIcon, // Use the control centre icon
    priority: 1, // Adjust position as needed
  },
];

export default MiniAppsList;
