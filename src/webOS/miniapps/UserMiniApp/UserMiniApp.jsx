import React from 'react';
import './UserMiniApp.css';
import { useDeviceInfo } from '../../contexts/DeviceInfoProvider/DeviceInfoProvider';
import userPhoto from '../../media/assets/logo.png';

function UserMiniApp() {
  const deviceInfo = useDeviceInfo();

  // Example of pulling in a username from deviceInfo; adjust to your structure
  const userName = deviceInfo?.user?.name || 'Nikita';

  return (
    <div className="user-miniapp-wrapper">
      <div className="user-miniapp-container">
        {/* Top Row: "User" on the left, orange verify icon on the right */}

        {/* User details: photo + name */}
        <div className="user-details-section">
          <div className="user-details-item">
            <img src={userPhoto} alt="User Avatar" className="user-photo" />
            <span className="user-name">{userName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserMiniApp;
