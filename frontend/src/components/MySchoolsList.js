import React, { useState, useEffect } from 'react';

const MySchoolsList = ({ onBack, onSchoolClick }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      // Get children first
      const childrenResponse = await fetch(`${backendUrl}/api/users/me/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (childrenResponse.ok) {
        const children = await childrenResponse.json();
        
        // Get unique organization IDs
        const orgIds = [...new Set(children.map(child => child.organization_id))];
        
        // Fetch school details for each organization
        const schoolPromises = orgIds.map(async (orgId) => {
          const response = await fetch(`${backendUrl}/api/work/organizations/${orgId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const school = await response.json();
            // Count children in this school
            const childrenCount = children.filter(c => c.organization_id === orgId).length;
            return { ...school, childrenCount };
          }
          return null;
        });

        const schoolsData = await Promise.all(schoolPromises);
        setSchools(schoolsData.filter(s => s !== null));
      }
    } catch (err) {
      console.error('Error loading schools:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-schools-list">
        <div className="page-header">
          <button className="btn-back" onClick={onBack}>← Назад</button>
          <h1>Мои Школы</h1>
        </div>
        <div className="loading-state">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-schools-list">
      <div className="page-header">
        <button className="btn-back" onClick={onBack}>← Назад</button>
        <h1>Мои Школы</h1>
        <p className="header-subtitle">Школы, в которых учатся ваши дети</p>
      </div>

      {schools.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏫</div>
          <h2>Нет школ</h2>
          <p>У вас пока нет детей, зачисленных в школы</p>
          <button className="btn-primary" onClick={onBack}>
            Вернуться назад
          </button>
        </div>
      ) : (
        <div className="schools-grid">
          {schools.map((school) => (
            <div key={school.id} className="school-card" onClick={() => onSchoolClick && onSchoolClick(school.id)}>
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

                  <div className="detail-row">
                    <span className="detail-icon">👨‍👩‍👧‍👦</span>
                    <span className="detail-text">
                      {school.childrenCount} {school.childrenCount === 1 ? 'ребёнок' : 'детей'} в этой школе
                    </span>
                  </div>

                  {school.principal_name && (
                    <div className="detail-row">
                      <span className="detail-icon">👤</span>
                      <span className="detail-text">Директор: {school.principal_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="school-card-footer">
                <button className="btn-primary btn-small">
                  Подробнее
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySchoolsList;
