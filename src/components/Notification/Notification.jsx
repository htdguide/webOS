import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleNotification = (event) => {
      const { message, duration, icon } = event.detail;
      const id = Date.now();

      setNotifications((prev) => {
        if (prev.some((n) => n.message === message && Math.abs(n.id - id) < 1000)) {
          return prev;
        }
        return [...prev, { id, message, icon }];
      });

      setTimeout(() => {
        handleSwipe(id);
      }, duration || 3000);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);

  const handleSwipe = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, closing: true } : n)));

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 500);
  };

  return (
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
  );
};

export default Notification;

export const notify = (message, duration = 3000, icon = '') => {
  const event = new CustomEvent('show-notification', {
    detail: { message, duration, icon }
  });
  window.dispatchEvent(event);
};
