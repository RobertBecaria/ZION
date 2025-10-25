import React, { useState } from 'react';
import { Heart, MessageCircle, Trash2, User } from 'lucide-react';

const WorkPostCard = ({ post, currentUserId, isAdmin, onDelete, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [addingComment, setAddingComment] = useState(false);

  const isAuthor = post.author_id === currentUserId;
  const canDelete = isAuthor || isAdmin;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн назад`;

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const loadComments = async () => {
    if (comments.length > 0) {
      setShowComments(!showComments);
      return;
    }

    setLoadingComments(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${BACKEND_URL}/api/work/posts/${post.id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setShowComments(true);
      }
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setAddingComment(true);
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${BACKEND_URL}/api/work/posts/${post.id}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentText })
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        onComment && onComment(post.id, data.comments_count);
      }
    } catch (error) {
      console.error('Add comment error:', error);
    } finally {
      setAddingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{post.author_name}</h4>
              <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </div>

          {canDelete && (
            <button
              onClick={() => onDelete && onDelete(post.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Удалить пост"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => onLike && onLike(post.id)}
            className={`flex items-center gap-2 font-medium transition-all duration-200 ${
              post.user_has_liked
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-600 hover:text-red-500'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                post.user_has_liked ? 'fill-current' : ''
              }`}
            />
            <span>{post.likes_count || 0}</span>
          </button>

          <button
            onClick={loadComments}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors duration-200"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments_count || 0}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || addingComment}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {addingComment ? '...' : 'Отправить'}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                        <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-3">{formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkPostCard;