import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

import { BACKEND_URL } from '../../config/api';

const EventChatTab = ({
  eventId,
  token,
  moduleColor
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (token) {
      fetchChat();
    } else {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchChat = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!token || sendingMessage || !newMessage.trim()) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });
      if (res.ok) {
        setNewMessage('');
        fetchChat();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const formatChatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
        <MessageCircle size={48} color="#e2e8f0" style={{ marginBottom: '12px' }} />
        <p>Войдите, чтобы участвовать в чате</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b' }}>Загрузка чата...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 20px 0' }}>
        Чат мероприятия
      </h2>

      <div style={{
        background: '#f8fafc',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '500px'
      }}>
        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>Начните общение!</p>
            </div>
          ) : (
            chatMessages.map(msg => (
              <div key={msg.id} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: moduleColor + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: moduleColor,
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {msg.user?.first_name?.[0] || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {msg.user?.first_name} {msg.user?.last_name}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {formatChatTime(msg.timestamp)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '10px',
          padding: '16px',
          background: 'white',
          borderTop: '1px solid #e2e8f0'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px'
            }}
          />
          <button
            type="submit"
            disabled={sendingMessage || !newMessage.trim()}
            style={{
              padding: '12px 20px',
              background: sendingMessage ? '#94a3b8' : moduleColor,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: sendingMessage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventChatTab;
