/**
 * TypingIndicator Component
 * Shows when someone is typing in the chat with animated dots
 */
import React from 'react';

const TypingIndicator = ({ typingUsers = [], moduleColor = '#059669' }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user_name || 'Кто-то'} печатает`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user_name} и ${typingUsers[1].user_name} печатают`;
    } else {
      return 'Несколько человек печатают';
    }
  };

  return (
    <div className="typing-indicator">
      <div className="typing-indicator-dots">
        <div className="typing-indicator-dot" style={{ backgroundColor: moduleColor }}></div>
        <div className="typing-indicator-dot" style={{ backgroundColor: moduleColor }}></div>
        <div className="typing-indicator-dot" style={{ backgroundColor: moduleColor }}></div>
      </div>
      <span className="typing-indicator-text">{getTypingText()}...</span>
    </div>
  );
};

export default TypingIndicator;
