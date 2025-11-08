import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Heart,
  Building2, Users, Award, Settings, Eye, EyeOff, Globe,
  Lock, Shield, ChevronRight, Cake, Gift, TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

function MyProfile({ user, activeModule, moduleColor }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  useEffect(() => {
    fetchProfileData();
    fetchPrivacySettings();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/users/me/profile/privacy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    }
  };

  const updatePrivacySetting = async (field, value) => {
    setSavingPrivacy(true);
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/users/me/profile/privacy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [field]: value })
      });

      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, [field]: value }));
      }
    } catch (error) {
      console.error('Error updating privacy:', error);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'PUBLIC':
        return <Globe size={14} />;
      case 'ORGANIZATION_ONLY':
        return <Building2 size={14} />;
      case 'PRIVATE':
        return <Lock size={14} />;
      default:
        return <Globe size={14} />;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'PUBLIC':
        return 'Публично';
      case 'ORGANIZATION_ONLY':
        return 'Организация';
      case 'PRIVATE':
        return 'Приватно';
      default:
        return 'Публично';
    }
  };

  const calculateWorkAnniversary = (startDate) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const today = new Date();
    const years = today.getFullYear() - start.getFullYear();
    const months = today.getMonth() - start.getMonth();
    
    if (years > 0) {
      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
    } else if (months > 0) {
      return `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`;
    }
    return 'Недавно';
  };

  const calculateDaysUntilBirthday = (birthday) => {
    if (!birthday) return null;
    const days = birthday.days_until;
    if (days === 0) return 'Сегодня!';
    if (days === 1) return 'Завтра';
    if (days <= 7) return `Через ${days} дней`;
    if (days <= 30) return `Через ${Math.floor(days / 7)} недель`;
    return `Через ${Math.floor(days / 30)} месяцев`;
  };

  if (loading) {
    return (
      <div className="my-profile-container">
        <div className="loading-spinner">Загрузка профиля...</div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="my-profile-container">
        <div className="error-message">Не удалось загрузить профиль</div>
      </div>
    );
  }

  return (
    <div className="my-profile-container">
      {/* Header */}
      <div className="profile-header" style={{ 
        background: `linear-gradient(135deg, ${moduleColor}15 0%, ${moduleColor}05 100%)`,
        borderBottom: `3px solid ${moduleColor}`
      }}>
        <div className="profile-header-content">
          <div className="profile-avatar-large">
            {profileData.avatar_url ? (
              <img src={profileData.avatar_url} alt="Profile" />
            ) : (
              <div className="avatar-placeholder" style={{ background: moduleColor }}>
                {profileData.first_name?.[0]}{profileData.last_name?.[0]}
              </div>
            )}
          </div>
          <div className="profile-header-info">
            <h1>{profileData.first_name} {profileData.last_name}</h1>
            {profileData.bio && <p className="profile-bio">{profileData.bio}</p>}
            <div className="profile-quick-stats">
              {profileData.organizations?.length > 0 && (
                <span className="quick-stat" style={{ color: moduleColor }}>
                  <Building2 size={16} />
                  {profileData.organizations.length} {profileData.organizations.length === 1 ? 'организация' : 'организации'}
                </span>
              )}
              {profileData.family_info && (
                <span className="quick-stat" style={{ color: moduleColor }}>
                  <Heart size={16} />
                  {profileData.family_info.member_count} {profileData.family_info.member_count === 1 ? 'член семьи' : 'члена семьи'}
                </span>
              )}
            </div>
          </div>
          <button 
            className="privacy-settings-btn"
            onClick={() => setShowPrivacySettings(!showPrivacySettings)}
            style={{ borderColor: moduleColor, color: moduleColor }}
          >
            <Settings size={20} />
            <span>Настройки приватности</span>
          </button>
        </div>
      </div>

      {/* Privacy Settings Modal */}
      {showPrivacySettings && privacySettings && (
        <div className="privacy-settings-modal">
          <div className="modal-overlay" onClick={() => setShowPrivacySettings(false)} />
          <div className="modal-content">
            <div className="modal-header">
              <h2><Shield size={20} /> Настройки приватности</h2>
              <button onClick={() => setShowPrivacySettings(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="privacy-section">
                <h3>Основная информация</h3>
                <PrivacyControl
                  label="Телефон"
                  value={privacySettings.phone_visibility}
                  onChange={(val) => updatePrivacySetting('phone_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Email"
                  value={privacySettings.email_visibility}
                  onChange={(val) => updatePrivacySetting('email_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Адрес"
                  value={privacySettings.address_visibility}
                  onChange={(val) => updatePrivacySetting('address_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Дата рождения"
                  value={privacySettings.birth_date_visibility}
                  onChange={(val) => updatePrivacySetting('birth_date_visibility', val)}
                  disabled={savingPrivacy}
                />
              </div>

              <div className="privacy-section">
                <h3>Информация об организации</h3>
                <PrivacyControl
                  label="Должность"
                  value={privacySettings.job_title_visibility}
                  onChange={(val) => updatePrivacySetting('job_title_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Отдел"
                  value={privacySettings.department_visibility}
                  onChange={(val) => updatePrivacySetting('department_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Команда"
                  value={privacySettings.team_visibility}
                  onChange={(val) => updatePrivacySetting('team_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Руководитель"
                  value={privacySettings.manager_visibility}
                  onChange={(val) => updatePrivacySetting('manager_visibility', val)}
                  disabled={savingPrivacy}
                />
                <PrivacyControl
                  label="Рабочий юбилей"
                  value={privacySettings.work_anniversary_visibility}
                  onChange={(val) => updatePrivacySetting('work_anniversary_visibility', val)}
                  disabled={savingPrivacy}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="profile-content">
        {/* Left Column */}
        <div className="profile-left-column">
          {/* Contact Information Card */}
          <div className="profile-card">
            <div className="card-header" style={{ borderLeftColor: moduleColor }}>
              <Mail size={20} />
              <h3>Контактная информация</h3>
            </div>
            <div className="card-body">
              {profileData.email && (
                <div className="info-row">
                  <Mail size={16} />
                  <div className="info-content">
                    <span className="info-label">Email</span>
                    <span className="info-value">{profileData.email}</span>
                  </div>
                  {privacySettings && (
                    <span className="visibility-badge">
                      {getVisibilityIcon(privacySettings.email_visibility)}
                    </span>
                  )}
                </div>
              )}
              {profileData.phone && (
                <div className="info-row">
                  <Phone size={16} />
                  <div className="info-content">
                    <span className="info-label">Телефон</span>
                    <span className="info-value">{profileData.phone}</span>
                  </div>
                  {privacySettings && (
                    <span className="visibility-badge">
                      {getVisibilityIcon(privacySettings.phone_visibility)}
                    </span>
                  )}
                </div>
              )}
              {profileData.business_email && (
                <div className="info-row">
                  <Mail size={16} />
                  <div className="info-content">
                    <span className="info-label">Рабочий email</span>
                    <span className="info-value">{profileData.business_email}</span>
                  </div>
                  {privacySettings && (
                    <span className="visibility-badge">
                      {getVisibilityIcon(privacySettings.business_email_visibility)}
                    </span>
                  )}
                </div>
              )}
              {profileData.business_phone && (
                <div className="info-row">
                  <Phone size={16} />
                  <div className="info-content">
                    <span className="info-label">Рабочий телефон</span>
                    <span className="info-value">{profileData.business_phone}</span>
                  </div>
                  {privacySettings && (
                    <span className="visibility-badge">
                      {getVisibilityIcon(privacySettings.business_phone_visibility)}
                    </span>
                  )}
                </div>
              )}
              {(profileData.address_city || profileData.address_country) && (
                <div className="info-row">
                  <MapPin size={16} />
                  <div className="info-content">
                    <span className="info-label">Местоположение</span>
                    <span className="info-value">
                      {profileData.address_city}{profileData.address_city && profileData.address_country && ', '}
                      {profileData.address_country}
                    </span>
                  </div>
                  {privacySettings && (
                    <span className="visibility-badge">
                      {getVisibilityIcon(privacySettings.address_visibility)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Family Info Card - Show only in Family module or if viewing own profile */}
          {(activeModule === 'family' || profileData.is_own_profile) && profileData.family_info && (
            <div className="profile-card">
              <div className="card-header" style={{ borderLeftColor: '#059669' }}>
                <Heart size={20} />
                <h3>Семейная информация</h3>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <Users size={16} />
                  <div className="info-content">
                    <span className="info-label">Семья</span>
                    <span className="info-value">
                      {profileData.family_info.family_name} {profileData.family_info.family_surname}
                    </span>
                  </div>
                </div>
                <div className="info-row">
                  <Users size={16} />
                  <div className="info-content">
                    <span className="info-label">Членов семьи</span>
                    <span className="info-value">{profileData.family_info.member_count}</span>
                  </div>
                </div>
                {profileData.family_info.address_city && (
                  <div className="info-row">
                    <MapPin size={16} />
                    <div className="info-content">
                      <span className="info-label">Семейный адрес</span>
                      <span className="info-value">
                        {profileData.family_info.address_city}, {profileData.family_info.address_country}
                      </span>
                    </div>
                  </div>
                )}
                {profileData.upcoming_family_birthday && (
                  <div className="highlight-box" style={{ background: '#05966915', borderColor: '#059669' }}>
                    <Cake size={18} style={{ color: '#059669' }} />
                    <div>
                      <strong>Предстоящий день рождения</strong>
                      <p>{profileData.upcoming_family_birthday.name} - {calculateDaysUntilBirthday(profileData.upcoming_family_birthday)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="profile-right-column">
          {/* Organizations Card - Show only if in Org module or viewing own profile */}
          {(activeModule === 'organizations' || profileData.is_own_profile) && profileData.organizations && profileData.organizations.length > 0 && (
            <div className="profile-card">
              <div className="card-header" style={{ borderLeftColor: '#ea580c' }}>
                <Building2 size={20} />
                <h3>Организации</h3>
              </div>
              <div className="card-body">
                {profileData.organizations.map((org, index) => (
                  <div key={org.id} className="org-card" style={{ borderLeftColor: '#ea580c' }}>
                    <div className="org-header">
                      <Building2 size={18} />
                      <h4>{org.name}</h4>
                      {org.is_admin && <span className="admin-badge">Администратор</span>}
                    </div>
                    {org.job_title && (
                      <div className="org-detail">
                        <Briefcase size={14} />
                        <span>{org.job_title}</span>
                      </div>
                    )}
                    {org.department && (
                      <div className="org-detail">
                        <Users size={14} />
                        <span>Отдел: {org.department}</span>
                      </div>
                    )}
                    {org.team && (
                      <div className="org-detail">
                        <Users size={14} />
                        <span>Команда: {org.team}</span>
                      </div>
                    )}
                    {org.manager && (
                      <div className="org-detail">
                        <User size={14} />
                        <span>Руководитель: {org.manager}</span>
                      </div>
                    )}
                    {org.work_anniversary && (
                      <div className="highlight-box" style={{ background: '#ea580c15', borderColor: '#ea580c', marginTop: '12px' }}>
                        <TrendingUp size={16} style={{ color: '#ea580c' }} />
                        <div>
                          <strong>Стаж работы</strong>
                          <p>{calculateWorkAnniversary(org.work_anniversary)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Interests */}
          {profileData.personal_interests && profileData.personal_interests.length > 0 && (
            <div className="profile-card">
              <div className="card-header" style={{ borderLeftColor: moduleColor }}>
                <Award size={20} />
                <h3>Интересы</h3>
              </div>
              <div className="card-body">
                <div className="interests-tags">
                  {profileData.personal_interests.map((interest, idx) => (
                    <span key={idx} className="interest-tag" style={{ borderColor: moduleColor, color: moduleColor }}>
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Education */}
          {profileData.education && (
            <div className="profile-card">
              <div className="card-header" style={{ borderLeftColor: moduleColor }}>
                <Award size={20} />
                <h3>Образование</h3>
              </div>
              <div className="card-body">
                <p>{profileData.education}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Privacy Control Component
function PrivacyControl({ label, value, onChange, disabled }) {
  const options = [
    { value: 'PUBLIC', label: 'Публично', icon: Globe },
    { value: 'ORGANIZATION_ONLY', label: 'Организация', icon: Building2 },
    { value: 'PRIVATE', label: 'Приватно', icon: Lock }
  ];

  return (
    <div className="privacy-control">
      <label>{label}</label>
      <div className="privacy-options">
        {options.map(option => {
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              className={`privacy-option ${value === option.value ? 'active' : ''}`}
              onClick={() => onChange(option.value)}
              disabled={disabled}
            >
              <Icon size={14} />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MyProfile;
