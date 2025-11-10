import React from 'react';

const SchoolDashboard = ({ onViewChildren, onFindSchool, onEnrollmentRequest, onViewMySchools }) => {
  return (
    <div className="work-dashboard">
      <div className="dashboard-header">
        <h1>Моя Школа</h1>
        <p className="dashboard-subtitle">Управление школьной информацией</p>
      </div>

      <div className="dashboard-cards">
        {/* My Children Card */}
        <div className="dashboard-card" onClick={onViewChildren}>
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            👨‍👩‍👧‍👦
          </div>
          <div className="card-content">
            <h3>Мои Дети</h3>
            <p>Просмотр информации о ваших детях</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        {/* My Schools Card */}
        <div className="dashboard-card" onClick={onViewMySchools}>
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            🏫
          </div>
          <div className="card-content">
            <h3>Мои Школы</h3>
            <p>Школы, в которых учатся ваши дети</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        {/* Find School Card */}
        <div className="dashboard-card" onClick={onFindSchool}>
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            🔍
          </div>
          <div className="card-content">
            <h3>Найти Школу</h3>
            <p>Поиск подходящей школы для вашего ребёнка</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        {/* Enrollment Request Card */}
        <div className="dashboard-card" onClick={onEnrollmentRequest}>
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            📝
          </div>
          <div className="card-content">
            <h3>Подать Заявку</h3>
            <p>Подача заявки на зачисление в школу</p>
          </div>
          <div className="card-arrow">→</div>
        </div>
      </div>

      <div className="dashboard-info">
        <div className="info-card">
          <h4>Добро пожаловать в школьный модуль</h4>
          <p>
            Здесь вы можете управлять информацией о ваших детях, находить подходящие школы, 
            и подавать заявки на зачисление. Выберите действие выше для начала работы.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
