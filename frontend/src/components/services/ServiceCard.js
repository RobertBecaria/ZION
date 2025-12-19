/**
 * ServiceCard Component
 * Displays a service listing card
 */
import React from 'react';
import { Star, MapPin, Clock, Eye, Calendar } from 'lucide-react';

const ServiceCard = ({ 
  listing, 
  onClick,
  moduleColor = '#B91C1C'
}) => {
  const formatPrice = () => {
    if (!listing.price_from && !listing.price_to) return 'Цена по запросу';
    if (listing.price_type === 'from') return `от ${listing.price_from?.toLocaleString()} ₽`;
    if (listing.price_from && listing.price_to) {
      return `${listing.price_from?.toLocaleString()} - ${listing.price_to?.toLocaleString()} ₽`;
    }
    return `${(listing.price_from || listing.price_to)?.toLocaleString()} ₽`;
  };

  return (
    <div className="service-card" onClick={onClick}>
      {/* Image */}
      <div className="service-card-image">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.name} />
        ) : listing.logo ? (
          <img src={listing.logo} alt={listing.name} />
        ) : (
          <div 
            className="service-card-placeholder"
            style={{ backgroundColor: `${moduleColor}20` }}
          >
            <span style={{ color: moduleColor, fontSize: '2rem' }}>
              {listing.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        {listing.accepts_online_booking && (
          <div className="booking-badge" style={{ backgroundColor: moduleColor }}>
            <Calendar size={12} />
            <span>Онлайн запись</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="service-card-content">
        <div className="service-card-header">
          <h3>{listing.name}</h3>
          {listing.organization_name && (
            <span className="org-name">{listing.organization_name}</span>
          )}
        </div>
        
        <p className="service-description">
          {listing.short_description || listing.description?.substring(0, 100)}...
        </p>
        
        {/* Rating */}
        <div className="service-rating">
          <Star size={16} fill="#FFC107" color="#FFC107" />
          <span className="rating-value">{listing.rating?.toFixed(1) || '0.0'}</span>
          <span className="review-count">({listing.review_count || 0} отзывов)</span>
        </div>
        
        {/* Location */}
        {listing.city && (
          <div className="service-location">
            <MapPin size={14} />
            <span>{listing.address || listing.city}</span>
          </div>
        )}
        
        {/* Footer */}
        <div className="service-card-footer">
          <div className="service-price" style={{ color: moduleColor }}>
            {formatPrice()}
          </div>
          <div className="service-stats">
            <span><Eye size={12} /> {listing.view_count || 0}</span>
          </div>
        </div>
        
        {/* ALTYN Price Badge */}
        {listing.accept_altyn && listing.altyn_price && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
            borderRadius: '0 0 12px 12px',
            borderTop: '1px solid #F59E0B'
          }}>
            <span style={{ fontSize: '14px' }}>💰</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400E' }}>
              {listing.altyn_price?.toLocaleString('ru-RU')} AC
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
