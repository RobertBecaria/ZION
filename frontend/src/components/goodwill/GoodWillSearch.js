import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, X, ChevronDown } from 'lucide-react';
import GoodWillEventCard from './GoodWillEventCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GoodWillSearch = ({ 
  token, 
  moduleColor = '#8B5CF6',
  onSelectEvent 
}) => {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFreeOnly, setIsFreeOnly] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchEvents();
    if (token) fetchFavorites();
  }, [token]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedCategory, selectedCity, isFreeOnly]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/goodwill/events?limit=50`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;
      if (isFreeOnly) url += `&is_free=true`;

      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
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

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.events?.map(e => e.id) || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (eventId) => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/favorites/${eventId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.is_favorite) {
          setFavorites([...favorites, eventId]);
        } else {
          setFavorites(favorites.filter(id => id !== eventId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    setIsFreeOnly(false);
  };

  const hasFilters = searchQuery || selectedCategory || selectedCity || isFreeOnly;

  return (
    <div className="goodwill-search" style={{ padding: '0' }}>
      {/* Header */}
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
          <span style={{ fontSize: '28px' }}>🎯</span>
          Поиск мероприятий
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          Найдите интересные события в вашем городе
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ 
          flex: 1, 
          minWidth: '250px',
          position: 'relative' 
        }}>
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '14px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#94a3b8'
          }} />
          <input
            type="text"
            placeholder="Поиск мероприятий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: showFilters ? moduleColor : 'white',
            color: showFilters ? 'white' : '#64748b',
            border: `2px solid ${showFilters ? moduleColor : '#e2e8f0'}`,
            borderRadius: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <Filter size={18} />
          Фильтры
          {hasFilters && (
            <span style={{
              background: showFilters ? 'white' : moduleColor,
              color: showFilters ? moduleColor : 'white',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              !
            </span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Фильтры</h4>
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: moduleColor,
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <X size={14} />
                Сбросить
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                Категория
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white'
                }}
              >
                <option value="">Все категории</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#64748b' }}>
                Город
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Все города"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '2px solid #e2e8f0',
                    borderRadius: '10px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            {/* Free Only */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
              <input
                type="checkbox"
                id="freeOnly"
                checked={isFreeOnly}
                onChange={(e) => setIsFreeOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: moduleColor }}
              />
              <label htmlFor="freeOnly" style={{ fontSize: '14px', cursor: 'pointer' }}>
                Только бесплатные
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setSelectedCategory('')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            background: !selectedCategory ? moduleColor : '#f1f5f9',
            color: !selectedCategory ? 'white' : '#64748b',
            fontWeight: '500',
            fontSize: '13px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s'
          }}
        >
          Все
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              background: selectedCategory === cat.id ? cat.color : '#f1f5f9',
              color: selectedCategory === cat.id ? 'white' : '#64748b',
              fontWeight: '500',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
          <p style={{ color: '#64748b', marginTop: '16px' }}>Загружаем мероприятия...</p>
        </div>
      ) : events.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: '#f8fafc',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Мероприятия не найдены</h3>
          <p style={{ color: '#64748b', margin: 0 }}>
            Попробуйте изменить параметры поиска
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
            Найдено: {events.length} мероприятий
          </p>
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
                onToggleFavorite={toggleFavorite}
                isFavorite={favorites.includes(event.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GoodWillSearch;
