import React, { useState } from 'react';
import { Users, Plus, Crown, Settings, MoreHorizontal, Hash, Heart } from 'lucide-react';

function ChatGroupList({ 
  chatGroups, 
  activeGroup, 
  onGroupSelect, 
  onCreateGroup,
  moduleColor = "#059669",
  user 
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    group_type: 'CUSTOM',
    color_code: moduleColor,
    member_ids: []
  });

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;

    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      if (response.ok) {
        setCreateForm({
          name: '',
          description: '',
          group_type: 'CUSTOM',
          color_code: moduleColor,
          member_ids: []
        });
        setShowCreateForm(false);
        if (onCreateGroup) onCreateGroup(); // Refresh groups
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const getGroupIcon = (groupType) => {
    switch (groupType) {
      case 'FAMILY':
        return <Heart size={20} />;
      case 'RELATIVES':
        return <Users size={20} />;
      default:
        return <Hash size={20} />;
    }
  };

  const formatLastMessage = (message) => {
    if (!message) return 'Нет сообщений';
    
    const content = message.content.length > 30 
      ? message.content.substring(0, 30) + '...' 
      : message.content;
    
    return content;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // If less than a day, show time
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    // If less than a week, show day
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' });
    }
    
    // Otherwise show date
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="chat-group-list">
      <div className="group-list-header">
        <h3>Группы чатов</h3>
        <button 
          className="create-group-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ color: moduleColor }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Create Group Form */}
      {showCreateForm && (
        <div className="create-group-form">
          <form onSubmit={handleCreateGroup}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Название группы"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <textarea
                placeholder="Описание (необязательно)"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="form-group">
              <select
                value={createForm.group_type}
                onChange={(e) => setCreateForm({ ...createForm, group_type: e.target.value })}
              >
                <option value="CUSTOM">Обычная группа</option>
                <option value="FAMILY">Семейная группа</option>
                <option value="RELATIVES">Группа родственников</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-cancel">
                Отмена
              </button>
              <button 
                type="submit" 
                className="btn-create"
                style={{ backgroundColor: moduleColor }}
              >
                Создать
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Groups List */}
      <div className="groups-list">
        {chatGroups.length === 0 ? (
          <div className="empty-groups">
            <Users size={48} color="#9ca3af" />
            <p>Нет групп</p>
            <small>Создайте первую группу</small>
          </div>
        ) : (
          chatGroups.map((groupData) => (
            <div
              key={groupData.group.id}
              className={`group-item ${activeGroup?.group.id === groupData.group.id ? 'active' : ''}`}
              onClick={() => onGroupSelect(groupData)}
            >
              <div className="group-avatar" style={{ backgroundColor: groupData.group.color_code }}>
                {getGroupIcon(groupData.group.group_type)}
              </div>
              <div className="group-info">
                <div className="group-name-row">
                  <h4>{groupData.group.name}</h4>
                  {groupData.user_role === 'ADMIN' && (
                    <Crown size={14} color="#fbbf24" />
                  )}
                </div>
                <div className="group-preview">
                  <span className="last-message">
                    {formatLastMessage(groupData.latest_message)}
                  </span>
                  <div className="group-meta">
                    <span className="member-count">{groupData.member_count}</span>
                    {groupData.latest_message && (
                      <span className="last-time">
                        {formatTime(groupData.latest_message.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatGroupList;