import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

import { BACKEND_URL } from '../../config/api';

const GoodWillCalendar = ({ 
  token, 
  moduleColor = '#8B5CF6',
  onSelectEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchCalendarEvents();
  }, [currentDate]);

  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const res = await fetch(`${BACKEND_URL}/api/goodwill/calendar?month=${month}&year=${year}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data.calendar || {});
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday start
    
    return { daysInMonth, startingDay };
  };

  const formatDateKey = (day) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
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
          Календарь мероприятий
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          Планируйте своё участие
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Calendar Grid */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={20} />
            </button>
            
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                cursor: 'pointer'
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
            {dayNames.map(day => (
              <div key={day} style={{ 
                textAlign: 'center', 
                padding: '8px', 
                fontWeight: '500', 
                color: '#64748b',
                fontSize: '13px'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {/* Empty cells for days before month starts */}
            {Array.from({ length: startingDay }).map((_, i) => (
              <div key={`empty-${i}`} style={{ padding: '8px' }}></div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = formatDateKey(day);
              const events = calendarData[dateKey] || [];
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = selectedDate === dateKey;
              
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(events.length > 0 ? dateKey : null)}
                  style={{
                    padding: '8px',
                    minHeight: '60px',
                    borderRadius: '10px',
                    background: isSelected ? moduleColor + '20' : isToday ? '#FEF3C7' : '#f8fafc',
                    border: isSelected ? `2px solid ${moduleColor}` : isToday ? '2px solid #F59E0B' : '2px solid transparent',
                    cursor: events.length > 0 ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    fontWeight: isToday ? '700' : '500', 
                    color: isToday ? '#D97706' : '#1e293b',
                    marginBottom: '4px'
                  }}>
                    {day}
                  </div>
                  {events.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {events.slice(0, 2).map((event, idx) => (
                        <div 
                          key={idx}
                          style={{
                            fontSize: '10px',
                            padding: '2px 4px',
                            background: event.category?.color || moduleColor,
                            color: 'white',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.category?.icon} {event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          +{events.length - 2} ещё
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Events */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0',
          height: 'fit-content'
        }}>
          <h4 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} color={moduleColor} />
            {selectedDate 
              ? new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
              : 'Выберите день'
            }
          </h4>

          {selectedDate && calendarData[selectedDate] ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {calendarData[selectedDate].map((event, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectEvent?.({ id: event.id })}
                  style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    borderLeft: `4px solid ${event.category?.color || moduleColor}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span>{event.category?.icon}</span>
                    <span style={{ fontSize: '12px', color: event.category?.color }}>
                      {event.category?.name}
                    </span>
                  </div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{event.title}</h5>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    {formatTime(event.start_date)} • {event.city}
                  </p>
                  {event.is_free ? (
                    <span style={{ fontSize: '11px', color: '#059669' }}>Бесплатно</span>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#F59E0B' }}>Платно</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>
              {selectedDate ? 'Нет мероприятий' : 'Кликните на день с событиями'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoodWillCalendar;
