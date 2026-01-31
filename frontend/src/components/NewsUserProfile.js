/**
 * NewsUserProfile Component
 * Displays a user's profile in the News module context
 * Shows their posts, events, and allows social interactions
 */
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config/api';
import { 
  ArrowLeft, User, UserPlus, UserCheck, UserMinus, Bell, BellOff,
  MessageCircle, Calendar, FileText, Users, Heart, Loader2,
  MapPin, Briefcase, GraduationCap, Mail, Clock
} from 'lucide-react';

const NewsUserProfile = ({
  userId,
  user: currentUser,
  moduleColor = "#1D4ED8",
  onBack,
  onOpenChat
}) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [publicPosts, setPublicPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'public'

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserPosts();
      fetchPublicPosts();
      fetchUserEvents();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/users/${userId}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        setError('Не удалось загрузить профиль');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/news/posts/user/${userId}?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchPublicPosts = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/news/posts/user/${userId}/public?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setPublicPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching public posts:', err);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      // Get events created by this user
      const response = await fetch(`${BACKEND_URL}/api/news/events?creator_id=${userId}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('zion_token');
      const endpoint = profile.is_following 
        ? `${BACKEND_URL}/api/social/unfollow/${userId}`
        : `${BACKEND_URL}/api/social/follow/${userId}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          is_following: !prev.is_following,
          followers_count: prev.is_following ? prev.followers_count - 1 : prev.followers_count + 1
        }));
      }
    } catch (err) {
      console.error('Error following/unfollowing:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFriendRequest = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('zion_token');
      
      if (profile.is_friend) {
        // Remove friend
        const response = await fetch(`${BACKEND_URL}/api/social/friends/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setProfile(prev => ({ ...prev, is_friend: false }));
        }
      } else if (profile.pending_request_type === 'sent') {
        // Cancel request
        const response = await fetch(`${BACKEND_URL}/api/social/friend-requests/${profile.pending_request_id}/cancel`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setProfile(prev => ({ ...prev, pending_request_type: null, pending_request_id: null }));
        }
      } else if (profile.pending_request_type === 'received') {
        // Accept request
        const response = await fetch(`${BACKEND_URL}/api/social/friend-requests/${profile.pending_request_id}/accept`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setProfile(prev => ({ ...prev, is_friend: true, pending_request_type: null }));
        }
      } else {
        // Send friend request
        const response = await fetch(`${BACKEND_URL}/api/social/friend-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ receiver_id: userId })
        });
        if (response.ok) {
          const data = await response.json();
          setProfile(prev => ({ 
            ...prev, 
            pending_request_type: 'sent', 
            pending_request_id: data.request_id 
          }));
        }
      }
    } catch (err) {
      console.error('Error handling friend request:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="news-user-profile loading">
        <Loader2 className="spin" size={32} />
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="news-user-profile error">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Назад
        </button>
        <p>{error || 'Профиль не найден'}</p>
      </div>
    );
  }

  const getFriendButtonText = () => {
    if (profile.is_friend) return 'В друзьях';
    if (profile.pending_request_type === 'sent') return 'Заявка отправлена';
    if (profile.pending_request_type === 'received') return 'Принять заявку';
    return 'Добавить в друзья';
  };

  const getFriendButtonIcon = () => {
    if (profile.is_friend) return <UserCheck size={16} />;
    if (profile.pending_request_type) return <Clock size={16} />;
    return <UserPlus size={16} />;
  };

  return (
    <div className="news-user-profile">
      {/* Header with back button */}
      <div className="profile-header-nav">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Назад
        </button>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          {profile.profile_picture ? (
            <img 
              src={profile.profile_picture} 
              alt={`${profile.first_name} ${profile.last_name}`}
              className="profile-avatar-large"
            />
          ) : (
            <div className="profile-avatar-large placeholder" style={{ background: moduleColor }}>
              <User size={48} />
            </div>
          )}
          
          {!profile.is_self && (
            <div className="profile-actions">
              <button 
                className={`profile-action-btn friend-btn ${profile.is_friend ? 'active' : ''}`}
                onClick={handleFriendRequest}
                disabled={actionLoading}
                style={profile.is_friend ? { backgroundColor: moduleColor, color: 'white' } : {}}
              >
                {getFriendButtonIcon()}
                {getFriendButtonText()}
              </button>
              
              <button 
                className={`profile-action-btn follow-btn ${profile.is_following ? 'active' : ''}`}
                onClick={handleFollow}
                disabled={actionLoading}
                style={profile.is_following ? { backgroundColor: moduleColor, color: 'white' } : {}}
              >
                {profile.is_following ? <BellOff size={16} /> : <Bell size={16} />}
                {profile.is_following ? 'Отписаться' : 'Подписаться'}
              </button>

              {onOpenChat && (
                <button 
                  className="profile-action-btn message-btn"
                  onClick={() => onOpenChat(profile)}
                >
                  <MessageCircle size={16} />
                  Написать
                </button>
              )}
            </div>
          )}
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            {profile.first_name} {profile.last_name}
          </h1>
          
          {profile.bio && (
            <p className="profile-bio">{profile.bio}</p>
          )}

          <div className="profile-stats">
            <div className="stat">
              <Users size={16} />
              <span><strong>{profile.friends_count || 0}</strong> друзей</span>
            </div>
            <div className="stat">
              <Heart size={16} />
              <span><strong>{profile.followers_count || 0}</strong> подписчиков</span>
            </div>
            <div className="stat">
              <span><strong>{profile.following_count || 0}</strong> подписок</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="profile-details">
            {profile.address_city && (
              <div className="detail-item">
                <MapPin size={14} />
                <span>{profile.address_city}{profile.address_country ? `, ${profile.address_country}` : ''}</span>
              </div>
            )}
            {profile.email && profile.public_show_email && (
              <div className="detail-item">
                <Mail size={14} />
                <span>{profile.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User's Events */}
      {events.length > 0 && (
        <div className="profile-section">
          <h3>
            <Calendar size={18} />
            События
          </h3>
          <div className="profile-events-list">
            {events.map(event => (
              <div key={event.id} className="profile-event-item">
                <div className="event-date">{formatDate(event.event_date)}</div>
                <div className="event-title">{event.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User's Posts Section with Tabs */}
      <div className="profile-section">
        <div className="posts-header">
          <h3>
            <FileText size={18} />
            Публикации
          </h3>
          <div className="posts-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              style={activeTab === 'all' ? { backgroundColor: moduleColor, color: 'white' } : {}}
            >
              Все ({posts.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`}
              onClick={() => setActiveTab('public')}
              style={activeTab === 'public' ? { backgroundColor: moduleColor, color: 'white' } : {}}
            >
              🌐 Публичные ({publicPosts.length})
            </button>
          </div>
        </div>

        {activeTab === 'all' && posts.length > 0 && (
          <div className="profile-posts-list">
            {posts.map(post => (
              <div key={post.id} className="profile-post-item">
                <div className="post-visibility-badge" style={{ color: post.visibility === 'PUBLIC' ? '#10B981' : '#6B7280' }}>
                  {post.visibility === 'PUBLIC' ? '🌐 Публичный' : post.visibility === 'FRIENDS_ONLY' ? '👥 Для друзей' : '👤 Для подписчиков'}
                </div>
                <p className="post-content">{post.content?.substring(0, 150)}{post.content?.length > 150 ? '...' : ''}</p>
                <div className="post-meta">
                  <span>{formatDate(post.created_at)}</span>
                  <span>❤️ {post.likes_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'public' && publicPosts.length > 0 && (
          <div className="profile-posts-list">
            <p className="public-posts-note" style={{ color: '#6B7280', fontSize: '13px', marginBottom: '12px' }}>
              Эти записи видны всем посетителям вашего профиля
            </p>
            {publicPosts.map(post => (
              <div key={post.id} className="profile-post-item">
                <p className="post-content">{post.content?.substring(0, 150)}{post.content?.length > 150 ? '...' : ''}</p>
                <div className="post-meta">
                  <span>{formatDate(post.created_at)}</span>
                  <span>❤️ {post.likes_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'public' && publicPosts.length === 0 && (
          <div className="profile-empty-posts">
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
              Нет публичных записей. Публичные записи видны всем посетителям профиля.
            </p>
          </div>
        )}

        {activeTab === 'all' && posts.length === 0 && (
          <div className="profile-empty-posts">
            <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
              Пока нет записей
            </p>
          </div>
        )}
      </div>

      {/* Empty State */}
      {posts.length === 0 && publicPosts.length === 0 && events.length === 0 && (
        <div className="profile-empty">
          <FileText size={32} />
          <p>Пока нет публикаций</p>
        </div>
      )}
    </div>
  );
};

export default NewsUserProfile;
