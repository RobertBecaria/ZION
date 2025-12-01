/**
 * UniversalChatLayout Component
 * Main chat view that handles both direct messages and group chats
 */
import React, { useState, useEffect } from 'react';
import { Users, Plus } from 'lucide-react';
import { ChatConversation } from './chat';

function UniversalChatLayout({ 
  activeGroup, 
  activeDirectChat,
  chatGroups, 
  onGroupSelect, 
  moduleColor = "#059669",
  onCreateGroup,
  user 
}) {
  // Determine which chat to show
  const hasActiveChat = activeGroup || activeDirectChat;
  const chatType = activeDirectChat ? 'direct' : 'group';
  const activeChat = activeDirectChat || activeGroup;

  const handleBack = () => {
    if (activeDirectChat) {
      // Handle clearing direct chat selection
    } else if (onGroupSelect) {
      onGroupSelect(null);
    }
  };

  if (!hasActiveChat) {
    return (
      <div className="universal-chat-layout">
        <div className="chat-welcome">
          <div className="welcome-content">
            <Users size={64} color={moduleColor} />
            <h3>Выберите чат для общения</h3>
            <p>Выберите чат или группу из списка справа</p>
            <button 
              className="btn-primary"
              onClick={onCreateGroup}
              style={{ backgroundColor: moduleColor }}
            >
              <Plus size={20} />
              Создать группу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="universal-chat-layout-full">
      <ChatConversation
        chat={activeChat}
        chatType={chatType}
        onBack={handleBack}
        moduleColor={moduleColor}
        user={user}
      />
    </div>
  );
}

export default UniversalChatLayout;
