import React, { useState, useEffect } from 'react';

const ParentChildrenDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
      
      const response = await fetch(`${backendUrl}/api/users/me/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChildren(data);
      } else {
        setError('Не удалось загрузить данные о детях');
      }
    } catch (err) {
      console.error('Error loading children:', err);
      setError('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const getAgeText = (age) => {
    if (!age) return '';
    const lastDigit = age % 10;
    const lastTwoDigits = age % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${age} лет`;
    }
    if (lastDigit === 1) {
      return `${age} год`;
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return `${age} года`;
    }
    return `${age} лет`;
  };

  const getGradeText = (grade) => {
    return `${grade} класс`;
  };

  if (loading) {
    return (
      <div className="parent-children-dashboard">
        <div className="dashboard-header">
          <h1>Мои Дети</h1>
        </div>
        <div className="loading-state">
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parent-children-dashboard">
      <div className="dashboard-header">
        <h1>Мои Дети</h1>
        <p className="header-subtitle">
          {children.length === 0 ? 'У вас пока нет детей в системе' : 
           children.length === 1 ? '1 ребенок' : 
           `${children.length} ${children.length > 4 ? 'детей' : 'ребёнка'}`}
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {children.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍👩‍👧‍👦</div>
          <h2>Нет детей в системе</h2>
          <p>Подайте заявку на зачисление в школу, чтобы добавить своих детей</p>
          <button className="btn-primary">
            Подать Заявку
          </button>
        </div>
      ) : (
        <div className="children-grid">
          {children.map((child) => (
            <div key={child.student_id} className="child-card">
              <div className="child-card-header">
                <div className="child-avatar">
                  {child.student_first_name[0]}{child.student_last_name[0]}
                </div>
                <div className="child-info">
                  <h3>
                    {child.student_last_name} {child.student_first_name} 
                    {child.student_middle_name && ` ${child.student_middle_name}`}
                  </h3>
                  <p className="child-meta">
                    {getAgeText(child.age)} • {getGradeText(child.grade)}
                    {child.assigned_class && ` ${child.assigned_class}`}
                  </p>
                </div>
              </div>

              <div className="child-card-body">
                <div className="info-row">
                  <span className="info-label">Дата рождения:</span>
                  <span className="info-value">
                    {new Date(child.date_of_birth).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <div className="info-row">
                  <span className="info-label">Статус:</span>
                  <span className={`status-badge status-${child.academic_status.toLowerCase()}`}>
                    {child.academic_status === 'ACTIVE' ? 'Учится' :
                     child.academic_status === 'GRADUATED' ? 'Выпускник' :
                     child.academic_status === 'TRANSFERRED' ? 'Переведён' : 'Отчислен'}
                  </span>
                </div>

                {child.student_number && (
                  <div className="info-row">
                    <span className="info-label">Номер студента:</span>
                    <span className="info-value">{child.student_number}</span>
                  </div>
                )}

                {child.enrolled_subjects && child.enrolled_subjects.length > 0 && (
                  <div className="info-section">
                    <span className="info-label">Предметы:</span>
                    <div className="subjects-tags">
                      {child.enrolled_subjects.slice(0, 3).map((subject, idx) => (
                        <span key={idx} className="subject-tag">{subject}</span>
                      ))}
                      {child.enrolled_subjects.length > 3 && (
                        <span className="subject-tag more">+{child.enrolled_subjects.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {child.parent_names && child.parent_names.length > 1 && (
                  <div className="info-section">
                    <span className="info-label">Другие родители:</span>
                    <div className="parent-names">
                      {child.parent_names.filter((name, idx, self) => self.indexOf(name) === idx).map((name, idx) => (
                        <span key={idx} className="parent-name">{name}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="child-card-footer">
                <button className="btn-secondary btn-small">
                  Просмотр профиля
                </button>
                <button className="btn-secondary btn-small">
                  Успеваемость
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentChildrenDashboard;
