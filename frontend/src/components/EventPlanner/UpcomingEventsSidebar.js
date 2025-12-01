/**
 * UpcomingEventsSidebar Component
 * Sidebar showing upcoming events with countdown
 */
import React from 'react';
import { getEventTypeInfo, getCountdown } from './utils';

const UpcomingEventsSidebar = ({ 
  events, 
  onEventClick,
  flashingInvitations = [],
  limit = 5 
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingEvents = events
    .filter(event => event.start_date >= today)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, limit);
  
  if (upcomingEvents.length === 0) {
    return (
      <div className="upcoming-events-sidebar">
        <h4>Ближайшие события</h4>
        <div className="no-upcoming-events">
          <p>Нет предстоящих событий</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="upcoming-events-sidebar">
      <h4>Ближайшие события</h4>
      <div className="upcoming-events-list">
        {upcomingEvents.map(event => {
          const eventTypeInfo = getEventTypeInfo(event.event_type);
          const countdown = getCountdown(event.start_date, event.start_time);
          const isFlashing = flashingInvitations.includes(event.id) && event.event_type === 'BIRTHDAY';
          
          return (
            <div
              key={event.id}
              className={`upcoming-event-item ${isFlashing ? 'flash-animation' : ''}`}
              onClick={() => onEventClick && onEventClick(event)}
              style={{ 
                borderLeft: `4px solid ${event.role_color || eventTypeInfo.color}`,
                cursor: 'pointer'
              }}
            >
              <div className="upcoming-event-icon">
                {eventTypeInfo.icon}
              </div>
              <div className="upcoming-event-details">
                <div className="upcoming-event-title">
                  {event.title.length > 20 ? event.title.slice(0, 20) + '...' : event.title}
                </div>
                <div className="upcoming-event-date">
                  {new Date(event.start_date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </div>
              </div>
              <div className="upcoming-event-countdown">
                {countdown.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEventsSidebar;
