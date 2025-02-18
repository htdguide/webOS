import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { message, duration, icon } = event.detail;
      const id = Date.now();

      // Check if a notification with the same message and timestamp already exists
      setNotifications((prev) => {
        if (prev.some((n) => n.message === message && Math.abs(n.id - id) < 1000)) {
          return prev;
        }
        return [...prev, { id, message, icon }];
      });

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration || 3000);
    };

    // Register the event listener only once
    window.addEventListener('show-notification', handleNotification);

    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);

  const handleSwipe = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map(({ id, message, icon }) => (
        <motion.div
          key={id}
          className="notification"
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          drag="x"
          dragConstraints={{ left: 0, right: 300 }}
          onDragEnd={(event, info) => {
            if (info.offset.x > 150) {
              handleSwipe(id);
            }
          }}
        >
          {icon && <img src={icon} alt="icon" className="notification-icon" />}
          <span className="notification-message">{message}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default Notification;

export const notify = (message, duration = 3000, icon = '') => {
  const event = new CustomEvent('show-notification', {
    detail: { message, duration, icon }
  });
  window.dispatchEvent(event);
};
