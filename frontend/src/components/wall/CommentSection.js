import React, { useState } from 'react';
import { User, Send, MessageCircle, Smile } from 'lucide-react';
import CommentItem from './CommentItem';

// Quick emojis for comment reactions
const quickEmojis = ['😀', '❤️', '👍', '😂', '🔥'];

function CommentSection({ 
  postId, 
  comments, 
  moduleColor, 
  user,
  newComment,
  onNewCommentChange,
  onCommentSubmit,
  onCommentLike,
  onCommentEdit,
  onCommentDelete,
  initiallyExpanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (newComment?.trim()) {
      onCommentSubmit(postId, newComment);
      setIsFocused(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const addEmoji = (emoji) => {
    const currentComment = newComment || '';
    onNewCommentChange(postId, currentComment + emoji);
    setShowEmojiPicker(false);
  };

  // Get visible comments (first 2 if not expanded)
  const visibleComments = comments ? (isExpanded ? comments : comments.slice(0, 2)) : [];
  const hiddenCommentsCount = comments ? Math.max(0, comments.length - 2) : 0;

  return (
    <div className="enhanced-comments-section">
      {/* Comment Input */}
      <div className={`comment-input-wrapper ${isFocused ? 'focused' : ''}`}>
        <div className="comment-avatar-wrapper">
          {user?.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt="" 
              className="comment-user-avatar"
            />
          ) : (
            <div className="comment-avatar-placeholder" style={{ background: moduleColor }}>
              <User size={14} color="white" />
            </div>
          )}
        </div>
        
        <div className="comment-input-container">
          <div className="comment-input-inner">
            <textarea
              value={newComment || ''}
              onChange={(e) => onNewCommentChange(postId, e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Напишите комментарий..."
              className="comment-textarea"
              rows="1"
            />
            
            <div className="comment-input-actions">
              <div className="emoji-picker-wrapper">
                <button 
                  className="emoji-trigger-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  type="button"
                >
                  <Smile size={18} color="#65676b" />
                </button>
                
                {showEmojiPicker && (
                  <div className="comment-emoji-picker">
                    {quickEmojis.map(emoji => (
                      <button
                        key={emoji}
                        className="comment-emoji-btn"
                        onClick={() => addEmoji(emoji)}
                        type="button"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {newComment?.trim() && (
                <button 
                  className="comment-send-btn"
                  onClick={handleSubmit}
                  style={{ color: moduleColor }}
                  type="button"
                >
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments === undefined ? (
          <div className="comments-loading">
            <div className="loading-spinner" style={{ borderTopColor: moduleColor }}></div>
            <span>Загружаем комментарии...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments-yet">
            <MessageCircle size={20} color="#9ca3af" />
            <span>Будьте первым, кто оставит комментарий</span>
          </div>
        ) : (
          <>
            {/* Show "View more" link if there are hidden comments */}
            {!isExpanded && hiddenCommentsCount > 0 && (
              <button 
                className="view-more-comments"
                onClick={() => setIsExpanded(true)}
              >
                Показать ещё {hiddenCommentsCount} {hiddenCommentsCount === 1 ? 'комментарий' : 
                  hiddenCommentsCount < 5 ? 'комментария' : 'комментариев'}
              </button>
            )}

            {/* Render visible comments */}
            {visibleComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                moduleColor={moduleColor}
                user={user}
                onCommentLike={onCommentLike}
                onCommentEdit={onCommentEdit}
                onCommentDelete={onCommentDelete}
                onCommentSubmit={onCommentSubmit}
              />
            ))}

            {/* Collapse link */}
            {isExpanded && comments.length > 2 && (
              <button 
                className="collapse-comments"
                onClick={() => setIsExpanded(false)}
              >
                Свернуть комментарии
              </button>
            )}
          </>
        )}
      </div>

      <style jsx="true">{`
        .enhanced-comments-section {
          padding: 12px 0 0 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 8px;
        }

        .comment-input-wrapper {
          display: flex;
          gap: 10px;
          padding: 0 4px;
          transition: all 0.2s ease;
        }

        .comment-input-wrapper.focused {
          padding-bottom: 8px;
        }

        .comment-avatar-wrapper {
          flex-shrink: 0;
        }

        .comment-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .comment-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .comment-input-container {
          flex: 1;
        }

        .comment-input-inner {
          display: flex;
          align-items: flex-end;
          background: #f0f2f5;
          border-radius: 20px;
          padding: 8px 12px;
          transition: all 0.2s ease;
        }

        .comment-input-wrapper.focused .comment-input-inner {
          background: #fff;
          box-shadow: 0 0 0 2px ${moduleColor}40;
        }

        .comment-textarea {
          flex: 1;
          border: none;
          background: transparent;
          resize: none;
          font-size: 14px;
          line-height: 1.4;
          max-height: 100px;
          outline: none;
          font-family: inherit;
        }

        .comment-textarea::placeholder {
          color: #65676b;
        }

        .comment-input-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: 8px;
        }

        .emoji-picker-wrapper {
          position: relative;
        }

        .emoji-trigger-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .emoji-trigger-btn:hover {
          background: #e4e6e9;
        }

        .comment-emoji-picker {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border-radius: 20px;
          padding: 6px 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          gap: 2px;
          margin-bottom: 4px;
          z-index: 10;
        }

        .comment-emoji-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .comment-emoji-btn:hover {
          background: #f0f2f5;
          transform: scale(1.15);
        }

        .comment-send-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .comment-send-btn:hover {
          transform: scale(1.1);
        }

        .comments-list {
          margin-top: 12px;
        }

        .comments-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          color: #65676b;
          font-size: 14px;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-top-width: 2px;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .no-comments-yet {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          color: #9ca3af;
          font-size: 14px;
        }

        .view-more-comments,
        .collapse-comments {
          background: none;
          border: none;
          color: #65676b;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 4px;
          display: block;
          width: 100%;
          text-align: left;
        }

        .view-more-comments:hover,
        .collapse-comments:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default CommentSection;
