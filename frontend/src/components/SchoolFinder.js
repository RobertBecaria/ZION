import React, { useState, useEffect } from 'react';

const SchoolFinder = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      const response = await fetch(`${backendUrl}/api/work/organizations?type=EDUCATIONAL`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchools(data.organizations || []);
      }
    } catch (err) {
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.school_address && school.school_address.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGrade = !filterGrade || 
                        (school.grades_offered && school.grades_offered.includes(parseInt(filterGrade)));
    
    return matchesSearch && matchesGrade;
  });

  const grades = Array.from({ length: 11 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="school-finder">
        <div className="finder-header">
          <h1>Поиск Школы</h1>
        </div>
        <div className="loading-state">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="school-finder">
      <div className="finder-header">
        <h1>Поиск Школы</h1>
        <p className="header-subtitle">Найдите подходящую школу для вашего ребёнка</p>
      </div>

      <div className="search-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="">Все классы</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade} класс</option>
            ))}
          </select>
        </div>
      </div>

      <div className="results-summary">
        <p>Найдено школ: {filteredSchools.length}</p>
      </div>

      {filteredSchools.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <h2>Школы не найдены</h2>
          <p>Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="schools-grid">
          {filteredSchools.map((school) => (
            <div key={school.id} className="school-card">
              <div className="school-card-header">
                <div className="school-icon">🏫</div>
                <div>
                  <h3>{school.name}</h3>
                  {school.school_type && (
                    <span className="school-type-badge">{school.school_type}</span>
                  )}
                </div>
              </div>

              <div className="school-card-body">
                {school.description && (
                  <p className="school-description">{school.description}</p>
                )}

                <div className="school-details">
                  {school.school_address && (
                    <div className="detail-row">
                      <span className="detail-icon">📍</span>
                      <span className="detail-text">{school.school_address}</span>
                    </div>
                  )}

                  {school.grades_offered && school.grades_offered.length > 0 && (
                    <div className="detail-row">
                      <span className="detail-icon">📚</span>
                      <span className="detail-text">
                        Классы: {Math.min(...school.grades_offered)}-{Math.max(...school.grades_offered)}
                      </span>
                    </div>
                  )}

                  {school.principal_name && (
                    <div className="detail-row">
                      <span className="detail-icon">👤</span>
                      <span className="detail-text">Директор: {school.principal_name}</span>
                    </div>
                  )}

                  {school.school_region && (
                    <div className="detail-row">
                      <span className="detail-icon">🗺️</span>
                      <span className="detail-text">Регион: {school.school_region}</span>
                    </div>
                  )}
                </div>

                {school.school_levels && school.school_levels.length > 0 && (
                  <div className="school-levels">
                    {school.school_levels.map((level, idx) => (
                      <span key={idx} className="level-badge">
                        {level === 'PRIMARY' ? 'Начальная' :
                         level === 'BASIC' ? 'Основная' :
                         level === 'SECONDARY' ? 'Средняя' : level}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="school-card-footer">
                <button className="btn-secondary btn-small">
                  Подробнее
                </button>
                <button className="btn-primary btn-small">
                  Подать Заявку
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolFinder;
