/**
 * PeopleDiscovery Component
 * Enhanced friend recommendation system with categories and filters
 */
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, MapPin, Briefcase, GraduationCap,
  Heart, X, ChevronRight, Loader2, RefreshCw, Filter
} from 'lucide-react';
import { BACKEND_URL } from '../config/api';

const PeopleDiscovery = ({ 
  user,
  moduleColor = '#1877F2',
  onNavigateToProfile,
  onClose 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'mutual', 'nearby', 'colleagues'
  const [sendingRequest, setSendingRequest] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/users/suggestions?limit=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${BACKEND_URL}/api/users/search?query=${encodeURIComponent(query)}&limit=10`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    if (sentRequests.has(userId)) return;
    
    try {
      setSendingRequest(userId);
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/friend-requests`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiver_id: userId })
      });

      if (response.ok) {
        setSentRequests(prev => new Set([...prev, userId]));
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setSendingRequest(null);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('zion_token');
      await fetch(`${BACKEND_URL}/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setSuggestions(prev => prev.map(s => 
        s.id === userId ? { ...s, is_following: true } : s
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleDismiss = (userId) => {
    setSuggestions(prev => prev.filter(s => s.id !== userId));
  };

  // Filter suggestions based on active filter
  const filteredSuggestions = suggestions.filter(s => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mutual') return s.mutual_friends_count > 0;
    if (activeFilter === 'nearby') return s.suggestion_reasons?.some(r => r.includes('Живёт') || r.includes('Из '));
    if (activeFilter === 'colleagues') return s.suggestion_reasons?.some(r => r.includes('Коллега') || r.includes('школы'));
    return true;
  });

  const filters = [
    { id: 'all', label: 'Все', icon: Users },
    { id: 'mutual', label: 'Общие друзья', icon: Heart },
    { id: 'nearby', label: 'Рядом', icon: MapPin },
    { id: 'colleagues', label: 'Коллеги', icon: Briefcase }
  ];

  const getReasonIcon = (reason) => {
    if (reason.includes('общи')) return <Heart size={12} />;
    if (reason.includes('Живёт') || reason.includes('Из ')) return <MapPin size={12} />;
    if (reason.includes('Коллега')) return <Briefcase size={12} />;
    if (reason.includes('школы')) return <GraduationCap size={12} />;
    if (reason.includes('Подписан')) return <UserPlus size={12} />;
    return null;
  };

  return (
    <div className="people-discovery">
      {/* Header */}
      <div className="discovery-header">
        <div className="header-title">
          <Users size={24} color={moduleColor} />
          <h2>Рекомендации</h2>
        </div>
        <div className="header-actions">
          <button 
            className="refresh-btn" 
            onClick={fetchSuggestions}
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </button>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="discovery-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Поиск людей по имени..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
        {searching && <Loader2 size={18} className="spin search-loader" />}
      </div>

      {/* Search Results */}
      {searchQuery.length >= 2 && searchResults.length > 0 && (
        <div className="search-results">
          <h4>Результаты поиска</h4>
          <div className="results-list">
            {searchResults.map(person => (
              <div key={person.id} className="person-card compact">
                <div 
                  className="person-avatar"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(person)}
                  style={{ cursor: 'pointer' }}
                >
                  {person.profile_picture ? (
                    <img src={person.profile_picture} alt="" />
                  ) : (
                    <div className="avatar-placeholder" style={{ backgroundColor: moduleColor }}>
                      {person.first_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                <div className="person-info">
                  <span 
                    className="person-name"
                    onClick={() => onNavigateToProfile && onNavigateToProfile(person)}
                    style={{ cursor: 'pointer' }}
                  >
                    {person.first_name} {person.last_name}
                  </span>
                  {person.username && (
                    <span className="person-username">@{person.username}</span>
                  )}
                </div>
                <button
                  className="btn-add"
                  onClick={() => handleSendRequest(person.id)}
                  disabled={sendingRequest === person.id || sentRequests.has(person.id)}
                  style={{ backgroundColor: sentRequests.has(person.id) ? '#9ca3af' : moduleColor }}
                >
                  {sentRequests.has(person.id) ? 'Отправлено' : <UserPlus size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="discovery-filters">
        {filters.map(filter => {
          const Icon = filter.icon;
          const count = filter.id === 'all' 
            ? suggestions.length 
            : suggestions.filter(s => {
                if (filter.id === 'mutual') return s.mutual_friends_count > 0;
                if (filter.id === 'nearby') return s.suggestion_reasons?.some(r => r.includes('Живёт') || r.includes('Из '));
                if (filter.id === 'colleagues') return s.suggestion_reasons?.some(r => r.includes('Коллега') || r.includes('школы'));
                return false;
              }).length;
          
          return (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
              style={activeFilter === filter.id ? { backgroundColor: moduleColor, color: 'white' } : {}}
            >
              <Icon size={14} />
              <span>{filter.label}</span>
              {count > 0 && <span className="filter-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Suggestions List */}
      <div className="discovery-content">
        {loading ? (
          <div className="loading-state">
            <Loader2 size={32} className="spin" color={moduleColor} />
            <p>Загрузка рекомендаций...</p>
          </div>
        ) : filteredSuggestions.length === 0 ? (
          <div className="empty-state">
            <Users size={48} color="#D1D5DB" />
            <p>Нет рекомендаций в этой категории</p>
            <button onClick={() => setActiveFilter('all')}>
              Показать все
            </button>
          </div>
        ) : (
          <div className="suggestions-grid">
            {filteredSuggestions.map(person => (
              <div key={person.id} className="person-card">
                <button 
                  className="dismiss-btn"
                  onClick={() => handleDismiss(person.id)}
                  title="Скрыть"
                >
                  <X size={14} />
                </button>
                
                <div 
                  className="person-avatar large"
                  onClick={() => onNavigateToProfile && onNavigateToProfile(person)}
                  style={{ cursor: 'pointer' }}
                >
                  {person.profile_picture ? (
                    <img src={person.profile_picture} alt="" />
                  ) : (
                    <div className="avatar-placeholder" style={{ backgroundColor: moduleColor }}>
                      {person.first_name?.[0] || '?'}
                    </div>
                  )}
                </div>
                
                <div className="person-info">
                  <span 
                    className="person-name"
                    onClick={() => onNavigateToProfile && onNavigateToProfile(person)}
                    style={{ cursor: 'pointer' }}
                  >
                    {person.first_name} {person.last_name}
                  </span>
                  
                  {/* Suggestion reasons */}
                  {person.suggestion_reasons && person.suggestion_reasons.length > 0 && (
                    <div className="suggestion-reasons">
                      {person.suggestion_reasons.map((reason, idx) => (
                        <span key={idx} className="reason-tag">
                          {getReasonIcon(reason)}
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="person-actions">
                  <button
                    className="btn-add-friend"
                    onClick={() => handleSendRequest(person.id)}
                    disabled={sendingRequest === person.id || sentRequests.has(person.id)}
                    style={{ backgroundColor: sentRequests.has(person.id) ? '#9ca3af' : moduleColor }}
                  >
                    {sendingRequest === person.id ? (
                      <Loader2 size={16} className="spin" />
                    ) : sentRequests.has(person.id) ? (
                      'Заявка отправлена'
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Добавить в друзья
                      </>
                    )}
                  </button>
                  {!person.is_following && (
                    <button
                      className="btn-follow"
                      onClick={() => handleFollow(person.id)}
                    >
                      Подписаться
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PeopleDiscovery;
