import React, { useEffect, useState } from 'react';
import messages from './messages';
import './WelcomeWrap.css';

const WelcomeWrap = () => {
  const totalDuration = 10; // Total duration of the welcome cover in seconds
  const initialDelay = 1;   // White screen delay before first message (in seconds)
  const messageCount = messages.length;
  // Each message is shown for an equal portion of the remaining time
  const messageDuration = (totalDuration - initialDelay) / messageCount;

  const [visible, setVisible] = useState(true);
  // Start with -1 to indicate that no message is shown yet (just the white cover)
  const [messageIndex, setMessageIndex] = useState(-1);

  // Start showing messages after the initial delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessageIndex(0);
    }, initialDelay * 1000);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  // Cycle through messages based on the computed duration
  useEffect(() => {
    if (messageIndex === -1) return; // Still in white screen phase
    if (messageIndex < messageCount) {
      const timer = setTimeout(() => {
        if (messageIndex < messageCount - 1) {
          setMessageIndex(messageIndex + 1);
        } else {
          // After the last message, hide the cover
          setVisible(false);
        }
      }, messageDuration * 1000);
      return () => clearTimeout(timer);
    }
  }, [messageIndex, messageCount, messageDuration]);

  if (!visible) return null;

  return (
    <div className="welcome-wrap">
      {messageIndex >= 0 && (
        // The key forces a re-mount so that the CSS animation replays for each message
        <div
          key={messageIndex}
          className="welcome-message"
          style={{ animationDuration: `${messageDuration}s` }}
        >
          {messages[messageIndex]}
        </div>
      )}
    </div>
  );
};

export default WelcomeWrap;
