// Notification.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 300px maxWidth + 20px container right offset + 50px extra
const OFFSCREEN_X = 370;

const containerStyle = {
  position: 'absolute',
  top: 40,
  right: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  zIndex: 300,
  pointerEvents: 'none',
};

const notificationStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
  padding: '16px 20px',
  maxWidth: '300px',
  display: 'flex',
  alignItems: 'center',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  pointerEvents: 'auto',
  cursor: 'pointer',
  userSelect: 'none',
};

const iconStyle = {
  width: '40px',
  height: '40px',
  marginRight: '20px',
  borderRadius: '8px',
  objectFit: 'cover',
};

const messageStyle = {
  fontSize: '14px',
  color: '#333',
};

const Notification = ({ notifications, handleSwipe }) => (
  <div style={containerStyle}>
    <AnimatePresence>
      {notifications.map(({ id, message, icon, closing }) => (
        <motion.div
          key={id}
          style={notificationStyle}
          initial={{ x: OFFSCREEN_X, opacity: 0 }}
          animate={
            closing
              ? { x: OFFSCREEN_X, opacity: 1 } // slide out fully
              : { x: 0, opacity: 1 }           // slide in
          }
          exit={{ x: OFFSCREEN_X, opacity: 1 }} // keep full opacity
          drag="x"
          dragConstraints={{ left: 0, right: OFFSCREEN_X }}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            // if dragged at all to the right, trigger full swipe
            if (info.offset.x > 0) {
              handleSwipe(id);
            }
          }}
          transition={{ duration: 0.5 }}
        >
          {icon && <img src={icon} alt="icon" style={iconStyle} />}
          <span style={messageStyle}>{message}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default Notification;
