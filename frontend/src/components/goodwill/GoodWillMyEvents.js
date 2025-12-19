import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import GoodWillEventCard from './GoodWillEventCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GoodWillMyEvents = ({ 
  token, 
  moduleColor = '#8B5CF6',
  onSelectEvent,
  onCreateEvent,
  asOrganizer = false
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(asOrganizer ? 'organizing' : 'attending');

  useEffect(() => {
    fetchEvents();
  }, [token, activeTab]);

  const fetchEvents = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const isOrganizer = activeTab === 'organizing';
      const res = await fetch(`${BACKEND_URL}/api/goodwill/my-events?as_organizer=${isOrganizer}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'attending', label: 'Я участвую', icon: Users },
    { id: 'organizing', label: 'Я организую', icon: Calendar }
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: '#1e293b', 
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '28px' }}>📅</span>
              Мои мероприятия
            </h2>
            <p style={{ color: '#64748b', margin: 0 }}>
              Управляйте вашими событиями
            </p>
          </div>
          
          {activeTab === 'organizing' && (
            <button
              onClick={onCreateEvent}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: moduleColor,
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              Создать мероприятие
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        background: '#f1f5f9',
        padding: '4px',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#1e293b' : '#64748b',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
          <p style={{ color: '#64748b', marginTop: '16px' }}>Загрузка...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f8fafc',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {activeTab === 'organizing' ? '🎭' : '🎫'}
          </div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
            {activeTab === 'organizing' 
              ? 'У вас пока нет мероприятий'
              : 'Вы ещё не участвуете в мероприятиях'
            }
          </h3>
          <p style={{ color: '#64748b', margin: 0 }}>
            {activeTab === 'organizing'
              ? 'Создайте своё первое мероприятие!'
              : 'Найдите интересные события в поиске'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {events.map(event => (
            <GoodWillEventCard
              key={event.id}
              event={event}
              moduleColor={moduleColor}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GoodWillMyEvents;
