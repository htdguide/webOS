// NotificationProvider.jsx
import React, { createContext, useContext, useState } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

/**
 * Wrap your app in <NotificationProvider>.
 * Call `useNotification().notify(...)` anywhere below to fire.
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = (message, duration = 3000, icon = '') => {
    const id = Date.now();
    setNotifications((prev) => {
      if (
        prev.some(
          (n) => n.message === message && Math.abs(n.id - id) < 1000
        )
      ) {
        return prev;
      }
      const iconSrc = typeof icon === 'string' ? icon : icon?.default;
      return [...prev, { id, message, icon: iconSrc }];
    });

    setTimeout(() => handleSwipe(id), duration);
  };

  const handleSwipe = (id) => {
    // mark closing → triggers slide-out only
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, closing: true } : n))
    );
    // remove after animation
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      500
    );
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Notification
        notifications={notifications}
        handleSwipe={handleSwipe}
      />
    </NotificationContext.Provider>
  );
};

/** Hook to fire notifications: */
export const useNotification = () => useContext(NotificationContext);
