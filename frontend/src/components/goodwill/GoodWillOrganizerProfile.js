import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/api';
import { User, Mail, Phone, Globe, Save, Plus, CheckCircle } from 'lucide-react';


const GoodWillOrganizerProfile = ({ 
  token, 
  moduleColor = '#8B5CF6',
  onProfileCreated 
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    categories: []
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, [token]);

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/organizer-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
          setFormData({
            name: data.profile.name || '',
            description: data.profile.description || '',
            contact_email: data.profile.contact_email || '',
            contact_phone: data.profile.contact_phone || '',
            website: data.profile.website || '',
            categories: data.profile.categories || []
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const method = profile ? 'PUT' : 'POST';
      const res = await fetch(`${BACKEND_URL}/api/goodwill/organizer-profile`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setSuccess(true);
        if (!profile && onProfileCreated) {
          onProfileCreated(data.profile);
        }
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
        <p style={{ color: '#64748b', marginTop: '16px' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
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
          <span style={{ fontSize: '28px' }}>👤</span>
          {profile ? 'Профиль организатора' : 'Создать профиль организатора'}
        </h2>
        <p style={{ color: '#64748b', margin: 0 }}>
          {profile 
            ? 'Редактируйте ваш профиль организатора мероприятий'
            : 'Создайте профиль, чтобы начать организовывать мероприятия'
          }
        </p>
      </div>

      {success && (
        <div style={{
          background: '#ECFDF5',
          border: '1px solid #10B981',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#059669'
        }}>
          <CheckCircle size={20} />
          Профиль успешно сохранён!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e2e8f0'
        }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
              Название *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Например: Добрые дела"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о себе и ваших мероприятиях..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Contact Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
              Email для связи
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                placeholder="email@example.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
              Телефон
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="+7 (xxx) xxx-xx-xx"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          {/* Website */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1e293b' }}>
              Веб-сайт
            </label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 44px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1e293b' }}>
              Категории мероприятий
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: formData.categories.includes(cat.id) ? `2px solid ${cat.color}` : '2px solid #e2e8f0',
                    background: formData.categories.includes(cat.id) ? cat.color + '20' : 'white',
                    color: formData.categories.includes(cat.id) ? cat.color : '#64748b',
                    fontWeight: '500',
                    fontSize: '13px',
                    cursor: 'pointer',
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving || !formData.name}
            style={{
              width: '100%',
              padding: '14px',
              background: saving || !formData.name ? '#94a3b8' : moduleColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving || !formData.name ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {saving ? (
              <>Сохранение...</>
            ) : profile ? (
              <><Save size={18} /> Сохранить изменения</>
            ) : (
              <><Plus size={18} /> Создать профиль</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoodWillOrganizerProfile;
