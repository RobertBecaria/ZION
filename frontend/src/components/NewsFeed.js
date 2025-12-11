/**
 * NewsFeed Component
 * News feed with post creation and visibility options
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Globe, Lock, UserCheck, Image, Video, Link2, 
  Heart, MessageCircle, Share2, MoreHorizontal, Send,
  Trash2, ChevronDown
} from 'lucide-react';

const VISIBILITY_OPTIONS = [
  { 
    id: 'PUBLIC', 
    label: 'Публичный', 
    icon: Globe, 
    description: 'Все могут видеть'
  },
  { 
    id: 'FRIENDS_AND_FOLLOWERS', 
    label: 'Друзья и подписчики', 
    icon: UserCheck, 
    description: 'Друзья и те, кто подписан на вас'
  },
  { 
    id: 'FRIENDS_ONLY', 
    label: 'Только друзья', 
    icon: Users, 
    description: 'Только ваши друзья'
  }
];

const NewsFeed = ({ 
  user, 
  moduleColor = '#1D4ED8',
  channelId = null,
  channelName = null
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [postVisibility, setPostVisibility] = useState('PUBLIC');
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [posting, setPosting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const LIMIT = 20;

  const loadPosts = useCallback(async (reset = false) => {
    try {
      const token = localStorage.getItem('zion_token');
      const currentOffset = reset ? 0 : offset;
      
      const endpoint = channelId 
        ? `${BACKEND_URL}/api/news/posts/channel/${channelId}?limit=${LIMIT}&offset=${currentOffset}`
        : `${BACKEND_URL}/api/news/posts/feed?limit=${LIMIT}&offset=${currentOffset}`;
      
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setPosts(data.posts || []);
          setOffset(LIMIT);
        } else {
          setPosts(prev => [...prev, ...(data.posts || [])]);
          setOffset(prev => prev + LIMIT);
        }
        setHasMore(data.has_more || false);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, channelId, offset]);

  useEffect(() => {
    loadPosts(true);
  }, [channelId]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    setPosting(true);
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/news/posts`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newPostContent,
          visibility: postVisibility,
          channel_id: channelId,
          media_files: [],
          youtube_urls: []
        })
      });

      if (response.ok) {
        setNewPostContent('');
        loadPosts(true); // Refresh feed
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const token = localStorage.getItem('zion_token');
      const method = isLiked ? 'DELETE' : 'POST';
      
      await fetch(`${BACKEND_URL}/api/news/posts/${postId}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Удалить этот пост?')) return;
    
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/news/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const getVisibilityOption = (id) => {
    return VISIBILITY_OPTIONS.find(v => v.id === id) || VISIBILITY_OPTIONS[0];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU');
  };

  const selectedVisibility = getVisibilityOption(postVisibility);

  return (
    <div className="news-feed">
      {/* Post Composer */}
      <div className="post-composer">
        <div className="composer-header">
          <div className="composer-avatar">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" />
            ) : (
              <div 
                className="avatar-placeholder"
                style={{ backgroundColor: moduleColor }}
              >
                {user?.first_name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="composer-input-wrapper">
            <textarea
              placeholder={channelId ? `Написать в ${channelName || 'канал'}...` : "Что нового?"}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="composer-footer">
          <div className="composer-attachments">
            <button className="attachment-btn" title="Добавить фото">
              <Image size={20} />
            </button>
            <button className="attachment-btn" title="Добавить видео">
              <Video size={20} />
            </button>
            <button className="attachment-btn" title="Добавить ссылку">
              <Link2 size={20} />
            </button>
          </div>

          <div className="composer-actions">
            {/* Visibility Selector - Only for personal posts */}
            {!channelId && (
              <div className="visibility-selector">
                <button 
                  className="visibility-btn"
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                >
                  <selectedVisibility.icon size={16} />
                  <span>{selectedVisibility.label}</span>
                  <ChevronDown size={14} />
                </button>
                
                {showVisibilityMenu && (
                  <div className="visibility-menu">
                    {VISIBILITY_OPTIONS.map(option => (
                      <button
                        key={option.id}
                        className={`visibility-option ${postVisibility === option.id ? 'selected' : ''}`}
                        onClick={() => {
                          setPostVisibility(option.id);
                          setShowVisibilityMenu(false);
                        }}
                      >
                        <option.icon size={18} />
                        <div className="option-text">
                          <span className="option-label">{option.label}</span>
                          <span className="option-desc">{option.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button 
              className="post-btn"
              onClick={handleCreatePost}
              disabled={!newPostContent.trim() || posting}
              style={{ backgroundColor: moduleColor }}
            >
              {posting ? 'Публикация...' : 'Опубликовать'}
            </button>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="posts-list">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Загрузка ленты...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <MessageCircle size={48} color="#9CA3AF" />
            <h3>Пока нет публикаций</h3>
            <p>{channelId ? 'В этом канале пока нет записей' : 'Будьте первым, кто что-то напишет!'}</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                moduleColor={moduleColor}
                onLike={handleLike}
                onDelete={handleDelete}
                formatDate={formatDate}
                getVisibilityOption={getVisibilityOption}
              />
            ))}
            
            {hasMore && (
              <button 
                className="load-more-btn"
                onClick={() => loadPosts()}
              >
                Загрузить ещё
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Post Card Component
const PostCard = ({ 
  post, 
  currentUserId, 
  moduleColor, 
  onLike, 
  onDelete,
  formatDate,
  getVisibilityOption
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = post.user_id === currentUserId;
  const visibility = getVisibilityOption(post.visibility);

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.author?.profile_picture ? (
              <img src={post.author.profile_picture} alt="" />
            ) : (
              <div 
                className="avatar-placeholder"
                style={{ backgroundColor: moduleColor }}
              >
                {post.author?.first_name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="author-info">
            <div className="author-name-row">
              <span className="author-name">
                {post.author?.first_name} {post.author?.last_name}
              </span>
              {post.channel && (
                <span className="channel-badge">
                  → {post.channel.name}
                </span>
              )}
            </div>
            <div className="post-meta">
              <span className="post-date">{formatDate(post.created_at)}</span>
              <span className="visibility-badge" title={visibility.description}>
                <visibility.icon size={12} />
              </span>
            </div>
          </div>
        </div>

        {isAuthor && (
          <div className="post-menu-wrapper">
            <button 
              className="menu-btn"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="post-menu">
                <button 
                  className="menu-item delete"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(post.id);
                  }}
                >
                  <Trash2 size={16} />
                  Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="post-content">
        <p>{post.content}</p>
      </div>

      {/* Media would go here */}

      <div className="post-actions">
        <button 
          className={`action-btn like-btn ${post.is_liked ? 'liked' : ''}`}
          onClick={() => onLike(post.id, post.is_liked)}
          style={post.is_liked ? { color: '#ef4444' } : {}}
        >
          <Heart size={18} fill={post.is_liked ? '#ef4444' : 'none'} />
          <span>{post.likes_count || 0}</span>
        </button>
        
        <button className="action-btn comment-btn">
          <MessageCircle size={18} />
          <span>{post.comments_count || 0}</span>
        </button>
        
        <button className="action-btn share-btn">
          <Share2 size={18} />
          <span>{post.shares_count || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default NewsFeed;
