import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, Calendar, Clock, Users, Settings, Smile, 
  Paperclip, Image, MoreHorizontal, Reply, Edit, Trash2,
  UserPlus
} from 'lucide-react';

function UniversalChatLayout({ 
  activeGroup, 
  chatGroups, 
  onGroupSelect, 
  moduleColor = "#059669",
  onCreateGroup,
  user 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeGroup) {
      fetchMessages();
    }
  }, [activeGroup]);

  const fetchMessages = async () => {
    if (!activeGroup) return;

    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat-groups/${activeGroup.group.id}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeGroup || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/chat-groups/${activeGroup.group.id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            group_id: activeGroup.group.id,
            content: newMessage,
            message_type: 'TEXT'
          })
        }
      );

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!activeGroup) {
    return (
      <div className="universal-chat-layout">
        <div className="chat-welcome">
          <div className="welcome-content">
            <Users size={64} color={moduleColor} />
            <h3>Выберите группу для общения</h3>
            <p>Выберите группу из списка или создайте новую</p>
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
      {/* Chat Header */}
      <div className="chat-header" style={{ borderBottomColor: moduleColor }}>
        <div className="chat-group-info">
          <div className="group-avatar" style={{ backgroundColor: activeGroup.group.color_code }}>
            <Users size={24} color="white" />
          </div>
          <div className="group-details">
            <h3>{activeGroup.group.name}</h3>
            <p>{activeGroup.member_count} участник(ов) • {activeGroup.group.group_type}</p>
          </div>
        </div>
        <div className="chat-actions">
          <button className="chat-action-btn" title="Участники">
            <UserPlus size={20} />
          </button>
          <button className="chat-action-btn" title="Настройки">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-content">
              <Users size={48} color="#9ca3af" />
              <h4>Пока нет сообщений</h4>
              <p>Начните беседу, отправив первое сообщение</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.user_id === user.id ? 'own-message' : 'other-message'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">
                    {message.sender ? `${message.sender.first_name} ${message.sender.last_name}` : 'Unknown'}
                  </span>
                  <span className="message-time">{formatTime(message.created_at)}</span>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-area" onSubmit={sendMessage}>
        <div className="input-wrapper">
          <button type="button" className="attachment-btn" title="Прикрепить файл">
            <Paperclip size={20} />
          </button>
          <button type="button" className="emoji-btn" title="Эмодзи">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="message-input"
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-btn" 
            disabled={!newMessage.trim() || loading}
            style={{ backgroundColor: moduleColor }}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default UniversalChatLayout;