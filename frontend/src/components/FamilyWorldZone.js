/**
 * FamilyWorldZone Component
 * Right sidebar widgets for the Family module
 */
import React from 'react';
import { Search, Filter, Users, Briefcase, Building } from 'lucide-react';
import { FAMILY_FILTER_OPTIONS } from '../config/moduleConfig';

const FamilyWorldZone = ({
  moduleColor = '#30A67E',
  activeFilters = [],
  setActiveFilters,
  user
}) => {
  return (
    <div className="family-world-zone">
      {/* Search Widget */}
      <div className="widget search-widget">
        <div className="widget-header">
          <Search size={16} />
          <span>Поиск записей</span>
        </div>
        <input type="text" placeholder="Поиск по записям..." className="search-input" />
      </div>

      {/* Unified Post Filter Widget - Stacked Filters */}
      <div className="widget unified-filter-widget">
        <div className="widget-header">
          <Filter size={16} />
          <span>Фильтр постов</span>
        </div>
        <div className="filter-list">
          {FAMILY_FILTER_OPTIONS.map((filter) => {
            const isActive = filter.id === 'all' 
              ? activeFilters.length === 0 
              : activeFilters.includes(filter.id);
            
            return (
              <div
                key={filter.id}
                className={`filter-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (filter.id === 'all') {
                    setActiveFilters([]);
                  } else {
                    setActiveFilters(prev => 
                      prev.includes(filter.id)
                        ? prev.filter(f => f !== filter.id)
                        : [...prev, filter.id]
                    );
                  }
                }}
                style={{
                  backgroundColor: isActive ? `${moduleColor}10` : 'transparent',
                  borderLeft: isActive ? `3px solid ${moduleColor}` : '3px solid transparent'
                }}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
                {isActive && filter.id !== 'all' && (
                  <span className="filter-check" style={{ color: moduleColor }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Filters Widget */}
      <div className="widget filters-widget">
        <div className="widget-header">
          <Filter size={16} />
          <span>Быстрые фильтры</span>
        </div>
        <div className="filter-row">
          <button 
            className="filter-btn active" 
            style={{ backgroundColor: moduleColor, borderColor: moduleColor }}
          >
            Все
          </button>
          <button className="filter-btn">Новости</button>
          <button className="filter-btn">События</button>
        </div>
      </div>

      {/* Online Friends Widget */}
      <div className="widget friends-widget">
        <div className="widget-header">
          <Users size={16} />
          <span>Друзья онлайн</span>
        </div>
        <div className="friends-list">
          <div className="friend-item">
            <div className="friend-avatar"></div>
            <div className="friend-name">Елена Иванова</div>
            <div className="online-indicator"></div>
          </div>
          <div className="friend-item">
            <div className="friend-avatar"></div>
            <div className="friend-name">Дмитрий Смирнов</div>
            <div className="online-indicator"></div>
          </div>
        </div>
      </div>

      {/* Popular Topics Widget */}
      <div className="widget topics-widget">
        <div className="widget-header">
          <span>Популярное</span>
        </div>
        <div className="hashtags-list">
          <span className="hashtag">#семья</span>
          <span className="hashtag">#новости</span>
          <span className="hashtag">#события</span>
          <span className="hashtag">#город</span>
          <span className="hashtag">#работа</span>
        </div>
      </div>

      {/* User Affiliations Widget */}
      {user?.affiliations && user.affiliations.length > 0 && (
        <div className="widget affiliations-widget">
          <div className="widget-header">
            <Briefcase size={16} />
            <span>Мои Роли</span>
          </div>
          <div className="affiliations-list">
            {user.affiliations.slice(0, 5).map((affiliation) => (
              <div key={affiliation.id} className="affiliation-item">
                <div className="affiliation-icon" style={{ backgroundColor: moduleColor }}>
                  <Building size={14} color="white" />
                </div>
                <div className="affiliation-info">
                  <span className="affiliation-name">{affiliation.affiliation.name}</span>
                  <span className="affiliation-role">{affiliation.user_role_in_org}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyWorldZone;
