import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a Context for device info
const DeviceInfoContext = createContext(null);

// Custom hook to use the DeviceInfo context
export const useDeviceInfo = () => {
  return useContext(DeviceInfoContext);
};

const DeviceInfoProvider = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState({
    ip: '',
    deviceType: '',
    orientation: '',
    browserModel: '',
    operatingSystem: '', // Added operatingSystem field
    battery: {
      level: null, // Battery level from 0.0 to 1.0
      charging: null, // Boolean indicating if the battery is charging
    },
  });

  // Fetch IP address from an external service (ipify)
  const fetchIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error fetching IP address:', error);
      return '';
    }
  };

  // Determine if the device is mobile or desktop
  const getDeviceType = () => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    return /Mobi|Android/i.test(ua) ? 'mobile' : 'desktop';
  };

  // Check current orientation based on viewport dimensions
  const getOrientation = () => {
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  };

  // Determine the browser model based on the user agent
  const getBrowserModel = () => {
    const ua = navigator.userAgent;
    let browser = 'unknown';
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (ua.indexOf('SamsungBrowser') > -1) {
      browser = 'Samsung Browser';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'Opera';
    } else if (ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
    }
    return browser;
  };

  // Determine the operating system (macOS, Windows, or Linux)
  const getOperatingSystem = () => {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      return 'macOS';
    } else if (platform.includes('win')) {
      return 'Windows';
    } else if (platform.includes('linux')) {
      return 'Linux';
    } else {
      return 'unknown';
    }
  };

  useEffect(() => {
    let batteryManager;
    // Placeholder for the battery status update function.
    let updateBatteryStatus = () => {};

    const updateDeviceInfo = async () => {
      const ip = await fetchIP();
      const info = {
        ip,
        deviceType: getDeviceType(),
        orientation: getOrientation(),
        browserModel: getBrowserModel(),
        operatingSystem: getOperatingSystem(),
        battery: {
          level: null,
          charging: null,
        },
      };
      setDeviceInfo(info);
      localStorage.setItem('deviceInfo', JSON.stringify(info));

      // Check if the Battery Status API is supported
      if (navigator.getBattery) {
        try {
          batteryManager = await navigator.getBattery();
          updateBatteryStatus = () => {
            setDeviceInfo(prev => {
              const newInfo = {
                ...prev,
                battery: {
                  level: batteryManager.level,
                  charging: batteryManager.charging,
                },
              };
              localStorage.setItem('deviceInfo', JSON.stringify(newInfo));
              return newInfo;
            });
          };

          // Set initial battery status
          updateBatteryStatus();

          // Attach event listeners to update battery info on change
          batteryManager.addEventListener('levelchange', updateBatteryStatus);
          batteryManager.addEventListener('chargingchange', updateBatteryStatus);
        } catch (error) {
          console.error('Error getting battery info:', error);
        }
      }
    };

    updateDeviceInfo();

    // Update orientation on window resize and store the new orientation
    const handleResize = () => {
      const orientation = getOrientation();
      setDeviceInfo(prev => {
        const newInfo = { ...prev, orientation };
        localStorage.setItem('deviceInfo', JSON.stringify(newInfo));
        return newInfo;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBatteryStatus);
        batteryManager.removeEventListener('chargingchange', updateBatteryStatus);
      }
    };
  }, []);

  return (
    <DeviceInfoContext.Provider value={deviceInfo}>
      {children}
    </DeviceInfoContext.Provider>
  );
};

export default DeviceInfoProvider;
