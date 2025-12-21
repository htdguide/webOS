// Notification.jsx
// This file renders a stack of notifications with slide animations and drag-to-dismiss.
// Styles are moved to Notification.css. Each area is segmented below.

// ------------------------------------------------------------
// Part 1: Imports
// ------------------------------------------------------------
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Notification.css'; // external stylesheet

// ------------------------------------------------------------
// Part 2: Component Structure
// ------------------------------------------------------------

// 2.1: Constants for motion behavior
const OFFSCREEN_X = 370;

// 2.2: Notification Component
// Renders notifications list with AnimatePresence
const Notification = ({ notifications, handleSwipe }) => (
  <div className="notification-container">
    <AnimatePresence>
      {notifications.map(({ id, message, icon, closing }) => (
        <motion.div
          key={id}
          className="notification-item"
          // ------------------------------------------------------------
          // Part 2.3: Animation and Drag Behavior
          // ------------------------------------------------------------
          initial={{ x: OFFSCREEN_X, opacity: 0 }}
          animate={
            closing
              ? { x: OFFSCREEN_X, opacity: 1 }
              : { x: 0, opacity: 1 }
          }
          exit={{ x: OFFSCREEN_X, opacity: 1 }}
          drag="x"
          dragConstraints={{ left: 0, right: OFFSCREEN_X }}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            if (info.offset.x > 0) {
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

// ------------------------------------------------------------
// Part 3: Export
// ------------------------------------------------------------
export default Notification;
