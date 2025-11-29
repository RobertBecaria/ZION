/**
 * ChatWorldZone Component
 * Right sidebar widgets for Chat view
 */
import React from 'react';
import { MessageCircle, Users, Settings, User } from 'lucide-react';
import ChatGroupList from './ChatGroupList';

const ChatWorldZone = ({
  moduleColor,
  chatGroups = [],
  activeGroup,
  handleGroupSelect,
  handleCreateGroup,
  user
}) => {
  return (
    <div className="chat-world-zone">
      {/* Chat Groups Widget */}
      <div className="widget chat-groups-widget">
        <ChatGroupList
          chatGroups={chatGroups}
          activeGroup={activeGroup}
          onGroupSelect={handleGroupSelect}
          onCreateGroup={handleCreateGroup}
          moduleColor={moduleColor}
          user={user}
        />
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

      {/* Chat Participants Widget */}
      {activeGroup && (
        <div className="widget participants-widget">
          <div className="widget-header">
            <Users size={16} />
            <span>Участники ({activeGroup.member_count})</span>
          </div>
          <div className="participants-list">
            <div className="participant-item">
              <div className="participant-avatar" style={{ backgroundColor: moduleColor }}>
                <User size={16} color="white" />
              </div>
              <div className="participant-info">
                <span className="participant-name">{user?.first_name} {user?.last_name}</span>
                <span className="participant-role">Администратор</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Activity Widget */}
      <div className="widget chat-activity-widget">
        <div className="widget-header">
          <MessageCircle size={16} />
          <span>Активность чата</span>
        </div>
        <div className="activity-stats">
          <div className="stat-item">
            <span className="stat-number">25</span>
            <span className="stat-label">Сообщений сегодня</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{chatGroups.length}</span>
            <span className="stat-label">Активных групп</span>
          </div>
        </div>
      </div>

      {/* Online Friends Widget */}
      <div className="widget friends-widget">
        <div className="widget-header">
          <Users size={16} />
          <span>Друзья онлайн</span>
        </div>
        <div className="friends-list">
          <div className="friend-item">
            <div className="friend-avatar"></div>
            <div className="friend-info">
              <span className="friend-name">Анна Петрова</span>
              <span className="friend-status">В сети</span>
            </div>
            <div className="status-indicator online"></div>
          </div>
          <div className="friend-item">
            <div className="friend-avatar"></div>
            <div className="friend-info">
              <span className="friend-name">Максим Иванов</span>
              <span className="friend-status">В сети</span>
            </div>
            <div className="status-indicator online"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWorldZone;
