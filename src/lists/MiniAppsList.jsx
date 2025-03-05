import controlCentreIcon from '../media/assets/controlcentre.png';
import ControlCentreMiniApp from '../miniapps/ControlCentreMiniApp/ControlCentreMiniApp';
import BatteryMiniApp from '../miniapps/BatteryMiniApp/BatteryMiniApp';
import BatteryBarApp from '../miniapps/BatteryMiniApp/BatteryBarApp';
import UserBarApp from '../miniapps/UserMiniApp/UserBarApp';
import UserMiniApp from '../miniapps/UserMiniApp/UserMiniApp';
import DateTimeBarApp from '../miniapps/DateTimeMiniApp/DateTimeBarApp';

const MiniAppsList = [
  {
    id: 'control-centre',
    name: 'Control Centre',
    miniApp: ControlCentreMiniApp,
    barApp: null,
    icon: controlCentreIcon,
    iconSize: 16, // Custom size for Control Centre icon
    priority: 0,
    available: true, // Will not be rendered
  },
  {
    id: 'battery',
    name: 'Battery',
    miniApp: BatteryMiniApp,
    barApp: BatteryBarApp,
    iconSize: 24, // Custom size for Battery icon
    priority: 2,
    available: true, // Will not be rendered if no battery info
  },
  {
    id: 'user',
    name: 'User',
    miniApp: UserMiniApp,
    barApp: UserBarApp,
    priority: 1,
    available: true, // Will be rendered only in landscape orientation
  },
  {
    id: 'datetime',
    name: 'Date & Time',
    miniApp: null,
    barApp: DateTimeBarApp,
    priority: -1,
    available: true, // Will be rendered
  },
];

export default MiniAppsList;
