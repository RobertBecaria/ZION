/**
 * CalendarGrid Component
 * Monthly calendar grid with event dots
 */
import React from 'react';
import { DAYS_OF_WEEK } from './constants';
import { getCalendarDays, getEventsForDate, getEventTypeInfo } from './utils';

const CalendarGrid = ({ 
  currentDate, 
  events, 
  onDayClick,
  moduleColor = '#6D28D9'
}) => {
  const calendarDays = getCalendarDays(currentDate);
  
  return (
    <div className="calendar-grid">
      {/* Day headers */}
      <div className="calendar-header-row">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}
      </div>
      
      {/* Calendar days */}
      <div className="calendar-days">
        {calendarDays.map((dayInfo, index) => {
          const dayEvents = getEventsForDate(events, dayInfo.date);
          const hasEvents = dayEvents.length > 0;
          
          return (
            <div
              key={index}
              className={`calendar-day ${!dayInfo.isCurrentMonth ? 'other-month' : ''} ${dayInfo.isToday ? 'today' : ''}`}
              onClick={() => hasEvents && onDayClick && onDayClick(dayEvents[0])}
              style={{ 
                cursor: hasEvents ? 'pointer' : 'default',
                position: 'relative'
              }}
            >
              <span className={`day-number ${dayInfo.isToday ? 'today-number' : ''}`}>
                {dayInfo.day}
              </span>
              
              {/* Event dots */}
              {hasEvents && (
                <div className="event-dots">
                  {dayEvents.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="event-dot"
                      style={{ 
                        backgroundColor: event.role_color || getEventTypeInfo(event.event_type).color 
                      }}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="more-events">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
              
              {/* Event preview on hover */}
              {hasEvents && (
                <div className="day-events-preview">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div 
                      key={idx} 
                      className="event-preview-item"
                      style={{ 
                        borderLeft: `3px solid ${event.role_color || getEventTypeInfo(event.event_type).color}` 
                      }}
                    >
                      <span className="event-preview-icon">
                        {getEventTypeInfo(event.event_type).icon}
                      </span>
                      <span className="event-preview-title">
                        {event.title.length > 15 ? event.title.slice(0, 15) + '...' : event.title}
                      </span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="event-preview-more">
                      +{dayEvents.length - 2} ещё
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
