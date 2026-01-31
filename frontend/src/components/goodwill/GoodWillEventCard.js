import React, { memo } from 'react';
import { BACKEND_URL } from '../../config/api';
import { MapPin, Calendar, Users, Clock, Coins, Heart } from 'lucide-react';


const GoodWillEventCard = memo(({ 
  event, 
  moduleColor = '#8B5CF6',
  onSelect,
  onToggleFavorite,
  isFavorite = false
}) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMinPrice = () => {
    if (event.is_free) return null;
    const prices = event.ticket_types?.map(t => t.altyn_price || t.price).filter(p => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  const minPrice = getMinPrice();

  return (
    <div 
      className="goodwill-event-card"
      onClick={() => onSelect?.(event)}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Cover Image */}
      <div style={{ 
        height: '140px', 
        background: event.cover_image 
          ? `url(${event.cover_image}) center/cover`
          : `linear-gradient(135deg, ${event.category?.color || moduleColor}40 0%, ${event.category?.color || moduleColor}20 100%)`,
        position: 'relative'
      }}>
        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          background: 'white',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <span>{event.category?.icon}</span>
          <span style={{ color: event.category?.color }}>{event.category?.name}</span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(event.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Heart size={16} fill={isFavorite ? '#EF4444' : 'none'} color={isFavorite ? '#EF4444' : '#64748b'} />
        </button>

        {/* Price Badge */}
        {!event.is_free && minPrice && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Coins size={12} />
            от {minPrice} AC
          </div>
        )}

        {event.is_free && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: '#10B981',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            Бесплатно
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#1e293b',
          lineHeight: '1.3',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>{formatDate(event.start_date)}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.is_online ? 'Онлайн' : event.city}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} />
            <span>
              {event.attendees_count} участников
              {event.capacity > 0 && ` / ${event.capacity}`}
            </span>
          </div>
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div style={{ 
            marginTop: '12px', 
            paddingTop: '12px', 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {event.organizer.logo ? (
              <img 
                src={event.organizer.logo} 
                alt="" 
                style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: moduleColor + '20',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px'
              }}>
                {event.organizer.name?.[0]}
              </div>
            )}
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {event.organizer.name}
            </span>
          </div>
        )}

        {/* RSVP Status */}
        {event.my_rsvp && (
          <div style={{ 
            marginTop: '10px',
            padding: '6px 10px',
            background: event.my_rsvp === 'GOING' ? '#ECFDF5' : event.my_rsvp === 'MAYBE' ? '#FEF3C7' : '#F3F4F6',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '500',
            color: event.my_rsvp === 'GOING' ? '#059669' : event.my_rsvp === 'MAYBE' ? '#D97706' : '#6B7280',
            textAlign: 'center'
          }}>
            {event.my_rsvp === 'GOING' ? '✓ Вы идёте' : event.my_rsvp === 'MAYBE' ? '? Возможно' : event.my_rsvp === 'WAITLIST' ? '⏳ В листе ожидания' : ''}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Re-render only when event data or favorite status changes
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.my_rsvp === nextProps.event.my_rsvp &&
    prevProps.event.attendee_count === nextProps.event.attendee_count &&
    prevProps.isFavorite === nextProps.isFavorite
  );
});

export default GoodWillEventCard;
