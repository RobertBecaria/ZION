import React, { useState, useEffect } from 'react';
import { MessageSquare, Users, Home, Globe, Clock } from 'lucide-react';

const FamilyFeed = ({ familyUnitId, refreshTrigger }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [familyUnitId, refreshTrigger]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/family-units/${familyUnitId}/posts`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'FAMILY_ONLY':
        return <Users size={16} />;
      case 'HOUSEHOLD_ONLY':
        return <Home size={16} />;
      case 'PUBLIC':
        return <Globe size={16} />;
      default:
        return <Users size={16} />;
    }
  };

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'FAMILY_ONLY':
        return 'Только семья';
      case 'HOUSEHOLD_ONLY':
        return 'Домохозяйство';
      case 'PUBLIC':
        return 'Публичный';
      default:
        return 'Только семья';
    }
  };

  if (loading) {
    return (
      <div className="family-feed-loading">
        <div className="loading-spinner"></div>
        <p>Загрузка постов...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="family-feed-empty">
        <MessageSquare size={48} color="#94a3b8" />
        <h3>Пока нет постов</h3>
        <p>Будьте первым, кто поделится новостями семьи!</p>
      </div>
    );
  }

  return (
    <div className="family-feed">
      {posts.map(post => (
        <div key={post.id} className="family-post-card">
          <div className="post-header">
            <div className="post-author">
              <div className="author-avatar">
                {post.author_name?.charAt(0) || 'U'}
              </div>
              <div className="author-info">
                <h4>
                  {post.author_name}
                  <span className="family-badge">({post.family_name})</span>
                </h4>
                <div className="post-meta">
                  <span className="post-time">
                    <Clock size={14} />
                    {new Date(post.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="post-visibility">
                    {getVisibilityIcon(post.visibility)}
                    {getVisibilityLabel(post.visibility)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="post-content">
            <p>{post.content}</p>
          </div>

          <div className="post-footer">
            <span className="footer-note">
              -- {post.family_name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FamilyFeed;