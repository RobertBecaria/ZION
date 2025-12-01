/**
 * ChatWorldZone Component
 * Right sidebar widgets for Chat view - WhatsApp style with tabs
 */
import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Users, Settings, User, Plus } from 'lucide-react';
import { ChatTabs, DirectChatList } from './chat';
import ChatGroupList from './ChatGroupList';

const ChatWorldZone = ({
  moduleColor = '#059669',
  chatGroups = [],
  activeGroup,
  handleGroupSelect,
  handleCreateGroup,
  user,
  activeDirectChat,
  setActiveDirectChat,
  onRefreshGroups
}) => {
  const [activeTab, setActiveTab] = useState('chats');
  const [directChats, setDirectChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Calculate unread counts
  const unreadChats = directChats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
  const unreadGroups = chatGroups.reduce((sum, group) => sum + (group.unread_count || 0), 0);

  const fetchDirectChats = useCallback(async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/direct-chats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setDirectChats(data.direct_chats || []);
      }
    } catch (error) {
      console.error('Error fetching direct chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectChats();
    // Poll for new chats every 5 seconds
    const interval = setInterval(fetchDirectChats, 5000);
    return () => clearInterval(interval);
  }, [fetchDirectChats]);

  const handleDirectChatSelect = (chatData) => {
    if (setActiveDirectChat) {
      setActiveDirectChat(chatData);
    }
    // Clear group selection when selecting direct chat
    if (handleGroupSelect) handleGroupSelect(null);
  };

  const handleGroupSelectWrapper = (groupData) => {
    if (setActiveDirectChat) {
      setActiveDirectChat(null); // Clear direct chat selection
    }
    if (handleGroupSelect) handleGroupSelect(groupData);
  };

  return (
    <div className="chat-world-zone">
      {/* Tabs Widget */}
      <div className="widget chat-tabs-widget" style={{ padding: 0 }}>
        <ChatTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          unreadChats={unreadChats}
          unreadGroups={unreadGroups}
          moduleColor={moduleColor}
        />
      </div>

      {/* Chat List Widget */}
      <div className="widget chat-list-widget" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'chats' ? (
          <DirectChatList
            directChats={directChats}
            activeChat={activeDirectChat}
            onChatSelect={handleDirectChatSelect}
            onRefresh={fetchDirectChats}
            moduleColor={moduleColor}
            user={user}
          />
        ) : (
          <ChatGroupList
            chatGroups={chatGroups}
            activeGroup={activeGroup}
            onGroupSelect={handleGroupSelectWrapper}
            onCreateGroup={handleCreateGroup}
            moduleColor={moduleColor}
            user={user}
          />
        )}
      </div>

      {/* Chat Settings Widget */}
      <div className="widget chat-settings-widget">
        <div className="widget-header">
          <Settings size={16} />
          <span>Настройки чата</span>
        </div>
        <div className="chat-settings-list">
          <div className="setting-item">
            <span>Уведомления</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <span>Звук сообщений</span>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Chat Stats Widget */}
      <div className="widget chat-activity-widget">
        <div className="widget-header">
          <MessageCircle size={16} />
          <span>Активность</span>
        </div>
        <div className="activity-stats">
          <div className="stat-item">
            <span className="stat-number">{directChats.length}</span>
            <span className="stat-label">Чатов</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{chatGroups.length}</span>
            <span className="stat-label">Групп</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{unreadChats + unreadGroups}</span>
            <span className="stat-label">Непрочитано</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWorldZone;
