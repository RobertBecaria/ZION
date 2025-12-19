import React, { useState, useEffect } from 'react';
import { Search, Users, Plus, Check } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GoodWillGroups = ({ 
  token, 
  moduleColor = '#8B5CF6'
}) => {
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', category_id: '', is_public: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchGroups();
    if (token) fetchMyGroups();
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGroups = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/goodwill/groups?limit=50`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/my-groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const joinGroup = async (groupId) => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGroups();
        fetchMyGroups();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createGroup = async () => {
    if (!token || !newGroup.name || !newGroup.category_id) return;
    setCreating(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setNewGroup({ name: '', description: '', category_id: '', is_public: true });
        fetchGroups();
        fetchMyGroups();
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCreating(false);
    }
  };

  const isMyGroup = (groupId) => myGroups.some(g => g.id === groupId);

  const displayGroups = activeTab === 'my' ? myGroups : groups;

  return (
    <div>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1e293b', 
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>👥</span>
            Группы по интересам
          </h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Найдите единомышленников
          </p>
        </div>
        
        {token && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: moduleColor,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            Создать группу
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'all' ? moduleColor : '#f1f5f9',
            color: activeTab === 'all' ? 'white' : '#64748b',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Все группы
        </button>
        {token && (
          <button
            onClick={() => setActiveTab('my')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'my' ? moduleColor : '#f1f5f9',
              color: activeTab === 'my' ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Мои группы ({myGroups.length})
          </button>
        )}
      </div>

      {/* Search */}
      {activeTab === 'all' && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Поиск групп..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '15px'
              }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              fontSize: '15px',
              background: 'white',
              minWidth: '180px'
            }}
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
        </div>
      ) : displayGroups.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ margin: '0 0 8px 0' }}>Группы не найдены</h3>
          <p style={{ color: '#64748b' }}>
            {activeTab === 'my' ? 'Вы ещё не состоите в группах' : 'Создайте первую группу!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {displayGroups.map(group => (
            <div
              key={group.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: group.category?.color + '20' || '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {group.category?.icon || '👥'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>{group.name}</h4>
                  <span style={{ fontSize: '12px', color: group.category?.color }}>
                    {group.category?.name}
                  </span>
                </div>
              </div>

              {group.description && (
                <p style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '14px', 
                  color: '#64748b',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {group.description}
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
                  <Users size={14} />
                  {group.members_count} участников
                </div>
                
                {token && (
                  isMyGroup(group.id) ? (
                    <span style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px',
                      color: '#059669',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      <Check size={14} />
                      Участник
                    </span>
                  ) : (
                    <button
                      onClick={() => joinGroup(group.id)}
                      style={{
                        padding: '6px 14px',
                        background: moduleColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Вступить
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setShowCreateModal(false)}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '450px',
            width: '90%'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0' }}>Создать группу</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Название *</label>
              <input
                type="text"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px' }}
              />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Категория *</label>
              <select
                value={newGroup.category_id}
                onChange={(e) => setNewGroup({...newGroup, category_id: e.target.value})}
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px' }}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Описание</label>
              <textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                rows={3}
                style={{ width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '10px', resize: 'vertical' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
              >
                Отмена
              </button>
              <button
                onClick={createGroup}
                disabled={creating || !newGroup.name || !newGroup.category_id}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: creating ? '#94a3b8' : moduleColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodWillGroups;
