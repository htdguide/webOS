// NotificationProvider.jsx
import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Notification.css';

const NotificationContext = createContext();

/**
 * NotificationProvider wraps your application and renders notifications.
 * It also provides an imperative notify() function via context.
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = (message, duration = 3000, icon = '') => {
    const id = Date.now();
    setNotifications((prev) => {
      // Prevent duplicate notifications within a short time span.
      if (prev.some((n) => n.message === message && Math.abs(n.id - id) < 1000)) {
        return prev;
      }
      const iconSrc = typeof icon === 'string' ? icon : icon?.default;
      return [...prev, { id, message, icon: iconSrc }];
    });

    // Remove the notification after the specified duration.
    setTimeout(() => {
      handleSwipe(id);
    }, duration);
  };

  const handleSwipe = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, closing: true } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 500);
  };

  const contextValue = { notify };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <div className="notification-container">
        <AnimatePresence>
          {notifications.map(({ id, message, icon, closing }) => (
            <motion.div
              key={id}
              className="notification"
              initial={{ x: 300, opacity: 0 }}
              animate={closing ? { x: 300, opacity: 0 } : { x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 300 }}
              onDragEnd={(event, info) => {
                if (info.offset.x > 150) {
                  handleSwipe(id);
                }
              }}
              transition={{ duration: 0.5 }}
            >
              {icon && <img src={icon} alt="icon" className="notification-icon" />}
              <span className="notification-message">{message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

/**
 * Hook to use the notification context.
 */
export const useNotification = () => {
  return useContext(NotificationContext);
};
