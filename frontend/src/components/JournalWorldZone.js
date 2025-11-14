import React from 'react';
import { GraduationCap, Users, Calendar, BookOpen, MessageCircle, Home } from 'lucide-react';

const JournalWorldZone = ({ selectedSchool, role, onNavigate }) => {
  if (!selectedSchool) {
    return null;
  }

  const parentNavigationItems = [
    { 
      key: 'children', 
      icon: Users, 
      label: 'Мои Дети', 
      description: 'Информация о детях' 
    },
    { 
      key: 'schedule', 
      icon: Calendar, 
      label: 'Расписание', 
      description: 'Расписание уроков' 
    },
    { 
      key: 'journal', 
      icon: BookOpen, 
      label: 'Электронный Дневник', 
      description: 'Оценки и успеваемость' 
    },
    { 
      key: 'calendar', 
      icon: Calendar, 
      label: 'Календарь', 
      description: 'Академический календарь' 
    },
    { 
      key: 'messages', 
      icon: MessageCircle, 
      label: 'Сообщения', 
      description: 'Связь с учителями' 
    }
  ];

  const teacherNavigationItems = [
    { 
      key: 'classes', 
      icon: Users, 
      label: 'Мои Классы', 
      description: 'Список классов' 
    },
    { 
      key: 'schedule', 
      icon: Calendar, 
      label: 'Расписание', 
      description: 'Расписание уроков' 
    },
    { 
      key: 'gradebook', 
      icon: BookOpen, 
      label: 'Журнал Оценок', 
      description: 'Выставление оценок' 
    },
    { 
      key: 'students', 
      icon: Users, 
      label: 'Ученики', 
      description: 'Список учеников' 
    },
    { 
      key: 'calendar', 
      icon: Calendar, 
      label: 'Календарь', 
      description: 'Академический календарь' 
    }
  ];

  const navigationItems = role === 'parent' ? parentNavigationItems : teacherNavigationItems;

  return (
    <div className="journal-world-zone">
      {/* Selected School Card */}
      <div className="world-zone-card school-info-card">
        <div className="card-header">
          <GraduationCap size={20} />
          <h3>Выбранная Школа</h3>
        </div>
        <div className="school-info-content">
          <div className="school-name">{selectedSchool.organization_name}</div>
          {role === 'parent' && (
            <div className="school-meta">
              <Users size={16} />
              <span>{selectedSchool.children_count} {
                selectedSchool.children_count === 1 ? 'ребёнок' : 
                selectedSchool.children_count > 4 ? 'детей' : 'ребёнка'
              }</span>
            </div>
          )}
          {role === 'teacher' && selectedSchool.teaching_subjects && (
            <div className="school-meta">
              <BookOpen size={16} />
              <span>{selectedSchool.teaching_subjects.join(', ')}</span>
            </div>
          )}
        </div>
        <button 
          className="btn-link"
          onClick={() => onNavigate('school-list')}
        >
          <Home size={16} />
          Сменить школу
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="world-zone-card navigation-menu-card">
        <div className="card-header">
          <BookOpen size={20} />
          <h3>Навигация</h3>
        </div>
        <div className="navigation-menu">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.key}
                className="navigation-item"
                onClick={() => onNavigate(item.key)}
              >
                <div className="nav-item-icon">
                  <IconComponent size={18} />
                </div>
                <div className="nav-item-text">
                  <div className="nav-item-label">{item.label}</div>
                  <div className="nav-item-description">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Info Widget */}
      {role === 'parent' && selectedSchool.children_count > 0 && (
        <div className="world-zone-card quick-info-card">
          <div className="card-header">
            <Users size={20} />
            <h3>Дети в Этой Школе</h3>
          </div>
          <div className="children-quick-list">
            <p className="quick-info-text">
              У вас {selectedSchool.children_count} {
                selectedSchool.children_count === 1 ? 'ребёнок учится' : 
                selectedSchool.children_count > 4 ? 'детей учатся' : 'ребёнка учатся'
              } в этой школе
            </p>
          </div>
        </div>
      )}

      {role === 'teacher' && selectedSchool.is_class_supervisor && (
        <div className="world-zone-card quick-info-card">
          <div className="card-header">
            <Users size={20} />
            <h3>Классное Руководство</h3>
          </div>
          <div className="supervisor-info">
            <p className="quick-info-text">
              Вы классный руководитель класса <strong>{selectedSchool.supervised_class}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalWorldZone;
