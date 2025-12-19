/**
 * MarketplaceProductCard Component
 * Displays a product card in the marketplace
 */
import React from 'react';
import { Heart, MapPin, Eye, Clock, Building2, User } from 'lucide-react';

const CONDITION_LABELS = {
  new: 'Новый',
  like_new: 'Как новый',
  good: 'Хорошее',
  fair: 'Удовлетворительное',
  poor: 'Требует ремонта'
};

const MarketplaceProductCard = ({
  product,
  onSelect,
  onToggleFavorite,
  isFavorite = false,
  moduleColor = '#BE185D'
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Сегодня';
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="marketplace-product-card" onClick={() => onSelect(product)}>
      {/* Image */}
      <div className="product-image-container">
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} className="product-image" />
        ) : (
          <div className="product-image-placeholder">
            <span>📦</span>
          </div>
        )}
        
        {/* Favorite Button */}
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          style={{ color: isFavorite ? moduleColor : undefined }}
        >
          <Heart size={20} fill={isFavorite ? moduleColor : 'none'} />
        </button>
        
        {/* Condition Badge */}
        <div className="condition-badge" data-condition={product.condition}>
          {CONDITION_LABELS[product.condition] || product.condition}
        </div>
      </div>
      
      {/* Content */}
      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        
        <div className="product-price" style={{ color: moduleColor }}>
          {formatPrice(product.price)}
          {product.negotiable && <span className="negotiable-tag">Торг</span>}
        </div>
        
        <div className="product-meta">
          {product.city && (
            <span className="meta-item">
              <MapPin size={14} />
              {product.city}
            </span>
          )}
          <span className="meta-item">
            <Clock size={14} />
            {formatDate(product.created_at)}
          </span>
        </div>
        
        {/* Seller Info */}
        <div className="product-seller">
          {product.seller_type === 'organization' ? (
            <>
              <Building2 size={14} />
              <span>{product.organization_name || 'Организация'}</span>
            </>
          ) : (
            <>
              {product.seller_avatar ? (
                <img src={product.seller_avatar} alt="" className="seller-avatar-small" />
              ) : (
                <User size={14} />
              )}
              <span>{product.seller_name || 'Частное лицо'}</span>
            </>
          )}
        </div>
        
        {/* Stats */}
        <div className="product-stats">
          <span><Eye size={12} /> {product.view_count || 0}</span>
          <span><Heart size={12} /> {product.favorite_count || 0}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductCard;
