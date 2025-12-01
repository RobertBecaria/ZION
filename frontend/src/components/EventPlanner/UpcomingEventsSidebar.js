/**
 * UpcomingEventsSidebar Component
 * Sidebar showing upcoming events with countdown timers
 */
import React from 'react';
import { Bell, Timer } from 'lucide-react';
import { getEventTypeInfo, getCreatorRoleInfo, getCountdown } from './utils';

const UpcomingEventsSidebar = ({ 
  upcomingEvents,
  moduleColor = '#6D28D9',
  onEventClick
}) => {
  return (
    <div className="upcoming-sidebar">
      <h3><Bell size={18} /> Ближайшие события</h3>
      
      {upcomingEvents.length === 0 ? (
        <div className="sidebar-empty">
          <p>Нет предстоящих событий</p>
        </div>
      ) : (
        <div className="upcoming-list">
          {upcomingEvents.map(event => {
            const typeInfo = getEventTypeInfo(event.event_type);
            const roleInfo = getCreatorRoleInfo(event.creator_role);
            const countdown = getCountdown(event.start_date, event.start_time);
            
            return (
              <div 
                key={event.id}
                className="upcoming-item"
                onClick={() => onEventClick && onEventClick(event)}
                style={{ borderLeftColor: event.role_color || roleInfo.color }}
              >
                <div className="upcoming-icon" style={{ backgroundColor: `${typeInfo.color}20` }}>
                  {typeInfo.icon}
                </div>
                <div className="upcoming-info">
                  <h4>{event.title}</h4>
                  <span className="date">
                    {new Date(event.start_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="countdown-timer" style={{ backgroundColor: `${moduleColor}15`, color: moduleColor }}>
                  <Timer size={14} />
                  <span>{countdown.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingEventsSidebar;
