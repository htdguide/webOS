// src/webOS/apps/ToggleMissionControl.jsx
import React, { useEffect } from 'react';
import defaultIcon from '../../media/icons/defaultapp.png';
import { useStateManager } from '../../stores/StateManager/StateManager';

function ToggleMissionControl({ onClose: parentOnClose }) {
  const { state, editStateValue } = useStateManager();

  useEffect(() => {
    // Read current as a string ("true"/"false"), convert to boolean
    const currentIsOpened = state.groups.missionControl?.isOpened === 'true';
    // Flip it and store back as a string
    const newIsOpened = (!currentIsOpened).toString();
    editStateValue('missionControl', 'isOpened', newIsOpened);

    // Notify parent (and let the app unmount itself)
    parentOnClose?.();
  }, [state.groups.missionControl, editStateValue, parentOnClose]);

  // No visible UI of its own
  return null;
}

ToggleMissionControl.connectorInfo = {
  name: 'Toggle Mission Control',
  icon: defaultIcon,
  priority: 5,    // adjust priority as needed
};

export default ToggleMissionControl;
