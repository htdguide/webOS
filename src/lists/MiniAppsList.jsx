import controlCentreIcon from '../media/assets/controlcentre.png';
import ControlCentreMiniApp from '../miniapps/ControlCentreMiniApp/ControlCentreMiniApp';
import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';
import BatteryBarApp from '../miniapps/BatteryMiniApp/BatteryBarApp';
import UserMiniApp from '../miniapps/UserMiniApp/UserMiniApp';
import DateTimeMiniApp from '../miniapps/DateTimeMiniApp/DateTimeMiniApp';

const MiniAppsList = [
  {
    id: 'control-centre',
    name: 'Control Centre',
    miniApp: ControlCentreMiniApp,
    barApp: null,
    icon: controlCentreIcon,
    priority: 0,
  },
  {
    id: 'battery',
    name: 'Battery',
    miniApp: BatteryMiniApp,
    barApp: BatteryBarApp,
    priority: 2,
  },
  {
    id: 'user',
    name: 'User',
    miniApp: null,
    barApp: UserMiniApp, // Display username inline in the menubar
    priority: 1, // Keep it in the same position
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    miniApp: null,
    barApp: DateTimeMiniApp, // Display date and time inline in the menubar
    priority: -1, // Keep it at the rightmost position
  },
];

export default MiniAppsList;
