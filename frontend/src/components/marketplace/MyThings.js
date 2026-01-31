/**
 * MyThings Component
 * Personal inventory management - main dashboard
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
import { BACKEND_URL } from '../../config/api';
  Plus, Search, Grid, List, Filter, AlertCircle, 
  Smartphone, Shirt, Car, Home, Laptop, Palette,
  ChevronRight, ShoppingCart, Calendar
} from 'lucide-react';

const CATEGORY_ICONS = {
  smart_things: Smartphone,
  wardrobe: Shirt,
  garage: Car,
  home: Home,
  electronics: Laptop,
  collection: Palette
};

const CATEGORY_CONFIG = {
  smart_things: { name: 'Умные Вещи', icon: '🔌', color: '#3B82F6' },
  wardrobe: { name: 'Мой Гардероб', icon: '👔', color: '#EC4899' },
  garage: { name: 'Мой Гараж', icon: '🚗', color: '#F59E0B' },
  home: { name: 'Мой Дом', icon: '🏠', color: '#10B981' },
  electronics: { name: 'Моя Электроника', icon: '💻', color: '#8B5CF6' },
  collection: { name: 'Моя Коллекция', icon: '🎨', color: '#F97316' }
};

const MyThings = ({
  user,
  token,
  moduleColor = '#BE185D',
  onAddItem,
  onViewItem,
  onEditItem,
  onListForSale,
  selectedCategory = null,
  onCategoryChange
}) => {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [expiringWarranties, setExpiringWarranties] = useState([]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${BACKEND_URL}/api/inventory/items?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
        setSummary(data.summary || []);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, searchQuery]);

  // Fetch expiring warranties
  const fetchExpiringWarranties = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/expiring-warranties?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExpiringWarranties(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching expiring warranties:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchExpiringWarranties();
  }, [fetchExpiringWarranties]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Удалить эту вещь?')) return;
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/inventory/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const formatPrice = (price) => {
    if (!price) return '—';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getCategorySummary = (categoryKey) => {
    const cat = summary.find(s => s._id === categoryKey);
    return {
      count: cat?.count || 0,
      value: cat?.total_value || 0
    };
  };

  const totalItems = summary.reduce((acc, s) => acc + s.count, 0);
  const totalValue = summary.reduce((acc, s) => acc + (s.total_value || 0), 0);

  return (
    <div className="my-things">
      {/* Header */}
      <div className="my-things-header">
        <div className="header-title">
          <h1>Мои Вещи</h1>
          <span className="items-count">{totalItems} предметов</span>
        </div>
        <button
          className="add-item-btn"
          style={{ backgroundColor: moduleColor }}
          onClick={onAddItem}
        >
          <Plus size={18} />
          Добавить вещь
        </button>
      </div>

      {/* Categories Overview */}
      {!selectedCategory && (
        <div className="categories-overview">
          <div className="overview-header">
            <h2>Категории</h2>
            {totalValue > 0 && (
              <span className="total-value">Общая стоимость: {formatPrice(totalValue)}</span>
            )}
          </div>
          
          <div className="categories-grid">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const stats = getCategorySummary(key);
              const IconComponent = CATEGORY_ICONS[key];
              
              return (
                <div
                  key={key}
                  className="category-card"
                  onClick={() => onCategoryChange?.(key)}
                  style={{ '--accent-color': config.color }}
                >
                  <div className="category-icon" style={{ backgroundColor: `${config.color}20` }}>
                    {IconComponent && <IconComponent size={28} color={config.color} />}
                  </div>
                  <div className="category-info">
                    <h3>{config.name}</h3>
                    <p>{stats.count} предметов</p>
                    {stats.value > 0 && (
                      <span className="category-value">{formatPrice(stats.value)}</span>
                    )}
                  </div>
                  <ChevronRight size={20} className="chevron" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expiring Warranties Alert */}
      {expiringWarranties.length > 0 && !selectedCategory && (
        <div className="warranties-alert">
          <AlertCircle size={20} color="#F59E0B" />
          <div className="alert-content">
            <strong>Гарантия истекает</strong>
            <p>{expiringWarranties.length} вещей с истекающей гарантией в ближайшие 30 дней</p>
          </div>
        </div>
      )}

      {/* Category View */}
      {selectedCategory && (
        <>
          {/* Category Header */}
          <div className="category-header">
            <button className="back-btn" onClick={() => onCategoryChange?.(null)}>
              ← Все категории
            </button>
            <div className="category-title">
              <span className="category-icon-large">{CATEGORY_CONFIG[selectedCategory]?.icon}</span>
              <h2>{CATEGORY_CONFIG[selectedCategory]?.name}</h2>
            </div>
          </div>

          {/* Search & View Controls */}
          <div className="items-controls">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Items Grid/List */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <span>{CATEGORY_CONFIG[selectedCategory]?.icon}</span>
              <h3>Пусто</h3>
              <p>Добавьте свои вещи в эту категорию</p>
              <button
                className="add-first-btn"
                style={{ backgroundColor: moduleColor }}
                onClick={onAddItem}
              >
                <Plus size={18} />
                Добавить
              </button>
            </div>
          ) : (
            <div className={`items-grid ${viewMode}`}>
              {items.map(item => (
                <div key={item.id} className="inventory-item-card">
                  <div className="item-image" onClick={() => onViewItem?.(item)}>
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt="" />
                    ) : (
                      <span>{CATEGORY_CONFIG[item.category]?.icon || '📦'}</span>
                    )}
                    {item.is_for_sale && (
                      <div className="for-sale-badge">
                        <ShoppingCart size={12} />
                        Продаётся
                      </div>
                    )}
                  </div>
                  
                  <div className="item-content">
                    <h3 onClick={() => onViewItem?.(item)}>{item.name}</h3>
                    
                    {item.brand && <p className="item-brand">{item.brand} {item.model}</p>}
                    
                    <div className="item-details">
                      {item.purchase_price && (
                        <span className="detail">
                          {formatPrice(item.purchase_price)}
                        </span>
                      )}
                      {item.purchase_date && (
                        <span className="detail">
                          <Calendar size={12} />
                          {formatDate(item.purchase_date)}
                        </span>
                      )}
                    </div>
                    
                    {item.warranty_expires && (
                      <div className="warranty-info">
                        Гарантия до: {formatDate(item.warranty_expires)}
                      </div>
                    )}
                  </div>
                  
                  <div className="item-actions">
                    <button onClick={() => onEditItem?.(item)} title="Редактировать">
                      ✏️
                    </button>
                    {!item.is_for_sale && (
                      <button
                        onClick={() => onListForSale?.(item)}
                        title="Выставить на продажу"
                        className="sell-btn"
                      >
                        💰
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      title="Удалить"
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyThings;
