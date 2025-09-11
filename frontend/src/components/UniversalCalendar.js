import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

function UniversalCalendar({ 
  user, 
  activeModule = 'family', 
  moduleColor = '#059669',
  onClose 
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledActions, setScheduledActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    fetchScheduledActions();
  }, [currentDate, activeModule]);

  const fetchScheduledActions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zion_token');
      
      // First get all chat groups for the current module
      const groupsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat-groups`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const chatGroups = groupsData.chat_groups || [];
        
        // Filter groups based on active module (for now, show all for family)
        const relevantGroups = chatGroups.filter(g => {
          if (activeModule === 'family') {
            return g.group.group_type === 'FAMILY' || g.group.group_type === 'RELATIVES' || g.group.group_type === 'CUSTOM';
          }
          // Later we can add filtering for other modules
          return true;
        });

        // Fetch scheduled actions for all relevant groups
        const allActions = [];
        for (const groupData of relevantGroups) {
          try {
            const actionsResponse = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/api/chat-groups/${groupData.group.id}/scheduled-actions`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );

            if (actionsResponse.ok) {
              const actionsData = await actionsResponse.json();
              const actions = actionsData.scheduled_actions || [];
              
              // Add group info and module color to each action
              actions.forEach(action => {
                action.group = groupData.group;
                action.moduleColor = moduleColor;
              });
              
              allActions.push(...actions);
            }
          } catch (error) {
            console.error(`Error fetching actions for group ${groupData.group.id}:`, error);
          }
        }

        setScheduledActions(allActions);
      }
    } catch (error) {
      console.error('Error fetching scheduled actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Convert to Monday = 0

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getActionsForDate = (date) => {
    if (!date) return [];
    
    return scheduledActions.filter(action => {
      const actionDate = new Date(action.scheduled_date);
      return (
        actionDate.getDate() === date.getDate() &&
        actionDate.getMonth() === date.getMonth() &&
        actionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.slice(0, 5); // HH:MM format
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'REMINDER':
        return <AlertCircle size={14} />;
      case 'BIRTHDAY':
        return <User size={14} />;
      case 'APPOINTMENT':
        return <Clock size={14} />;
      case 'EVENT':
        return <Calendar size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectedDateActions = getActionsForDate(selectedDate);

  return (
    <div className="universal-calendar">
      {/* Calendar Header */}
      <div className="calendar-header" style={{ borderBottomColor: moduleColor }}>
        <div className="calendar-title">
          <Calendar size={24} style={{ color: moduleColor }} />
          <h2>Календарь {activeModule === 'family' ? 'семьи' : 'модуля'}</h2>
        </div>
        <button className="close-calendar-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="calendar-content">
        {/* Calendar Navigation */}
        <div className="calendar-nav">
          <button onClick={() => navigateMonth(-1)} className="nav-btn">
            <ChevronLeft size={20} />
          </button>
          <h3 className="current-month">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <button onClick={() => navigateMonth(1)} className="nav-btn">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-main">
          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Weekday Headers */}
            <div className="weekdays">
              {weekdays.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="calendar-days">
              {getDaysInMonth(currentDate).map((date, index) => {
                const actions = getActionsForDate(date);
                return (
                  <div
                    key={index}
                    className={`calendar-day ${!date ? 'empty' : ''} ${isToday(date) ? 'today' : ''} ${isSelectedDate(date) ? 'selected' : ''}`}
                    onClick={() => date && setSelectedDate(date)}
                  >
                    {date && (
                      <>
                        <span className="day-number">{date.getDate()}</span>
                        {actions.length > 0 && (
                          <div className="day-indicators">
                            {actions.slice(0, 3).map((action, i) => (
                              <div
                                key={i}
                                className="action-indicator"
                                style={{ backgroundColor: action.moduleColor }}
                              />
                            ))}
                            {actions.length > 3 && (
                              <div className="more-indicator">+{actions.length - 3}</div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details */}
          <div className="selected-date-panel">
            <div className="selected-date-header">
              <h4>
                {selectedDate.toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h4>
              <span className="actions-count">
                {selectedDateActions.length} событий
              </span>
            </div>

            <div className="date-actions">
              {loading ? (
                <div className="loading-actions">
                  <div className="loading-spinner"></div>
                  <span>Загрузка событий...</span>
                </div>
              ) : selectedDateActions.length === 0 ? (
                <div className="no-actions">
                  <Calendar size={32} color="#9ca3af" />
                  <p>Нет событий на эту дату</p>
                </div>
              ) : (
                selectedDateActions
                  .sort((a, b) => {
                    if (!a.scheduled_time && !b.scheduled_time) return 0;
                    if (!a.scheduled_time) return 1;
                    if (!b.scheduled_time) return -1;
                    return a.scheduled_time.localeCompare(b.scheduled_time);
                  })
                  .map((action) => (
                    <div
                      key={action.id}
                      className={`calendar-action-item ${action.is_completed ? 'completed' : ''}`}
                      style={{ borderLeftColor: action.moduleColor }}
                    >
                      <div className="action-header">
                        <div className="action-icon" style={{ color: action.moduleColor }}>
                          {getActionIcon(action.action_type)}
                        </div>
                        <div className="action-details">
                          <h5>{action.title}</h5>
                          <div className="action-meta">
                            {action.scheduled_time && (
                              <span className="action-time">
                                <Clock size={12} />
                                {formatTime(action.scheduled_time)}
                              </span>
                            )}
                            {action.location && (
                              <span className="action-location">
                                <MapPin size={12} />
                                {action.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {action.is_completed && (
                          <CheckCircle size={16} color="#10b981" />
                        )}
                      </div>
                      {action.description && (
                        <p className="action-description">{action.description}</p>
                      )}
                      <div className="action-group">
                        Группа: {action.group?.name || 'Неизвестная группа'}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UniversalCalendar;