import React, { useState } from 'react';
import { User, Heart, CornerDownRight, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import { formatTime } from './utils/postUtils';

function CommentItem({ 
  comment, 
  postId, 
  level = 0, 
  moduleColor, 
  user,
  onCommentLike,
  onCommentEdit,
  onCommentDelete,
  onCommentSubmit
}) {
  const [editingComment, setEditingComment] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveEdit = () => {
    onCommentEdit(comment.id, editContent);
    setEditingComment(false);
  };

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onCommentSubmit(postId, replyContent, comment.id);
      setReplyContent('');
      setReplyingTo(false);
    }
  };

  const isOwner = comment.author.id === user?.id;

  return (
    <div 
      className={`enhanced-comment-item ${level > 0 ? 'is-reply' : ''}`}
      style={{ marginLeft: level > 0 ? '44px' : '0' }}
    >
      <div className="comment-main">
        {/* Avatar */}
        {comment.author.profile_picture ? (
          <img 
            src={comment.author.profile_picture} 
            alt=""
            className="comment-avatar-img"
          />
        ) : (
          <div className="comment-avatar-placeholder" style={{ background: moduleColor }}>
            <User size={level > 0 ? 12 : 14} color="white" />
          </div>
        )}

        {/* Comment Bubble */}
        <div className="comment-bubble-container">
          <div className="comment-bubble">
            <div className="comment-bubble-header">
              <span className="comment-author-name">
                {comment.author.first_name} {comment.author.last_name}
              </span>
              {isOwner && (
                <div className="comment-menu-wrapper">
                  <button 
                    className="comment-menu-btn"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreHorizontal size={14} />
                  </button>
                  {showMenu && (
                    <div className="comment-menu-dropdown">
                      <button onClick={() => { setEditingComment(true); setShowMenu(false); }}>
                        <Edit3 size={14} /> Редактировать
                      </button>
                      <button onClick={() => { onCommentDelete(comment.id); setShowMenu(false); }} className="delete-btn">
                        <Trash2 size={14} /> Удалить
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {editingComment ? (
              <div className="comment-edit-form">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="comment-edit-textarea"
                  autoFocus
                />
                <div className="comment-edit-buttons">
                  <button 
                    className="edit-save-btn" 
                    onClick={handleSaveEdit}
                    style={{ background: moduleColor }}
                  >
                    Сохранить
                  </button>
                  <button className="edit-cancel-btn" onClick={() => setEditingComment(false)}>
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <p className="comment-text">{comment.content}</p>
            )}

            {/* Like badge on bubble */}
            {comment.likes_count > 0 && (
              <div className="comment-like-badge" style={{ background: moduleColor }}>
                <Heart size={10} color="white" fill="white" />
                <span>{comment.likes_count}</span>
              </div>
            )}
          </div>

          {/* Comment Actions */}
          <div className="comment-actions-row">
            <span className="comment-time">{formatTime(comment.created_at)}</span>
            {comment.is_edited && <span className="edited-tag">изменено</span>}
            <button 
              className={`comment-action-link ${comment.user_liked ? 'liked' : ''}`}
              onClick={() => onCommentLike(comment.id)}
              style={{ color: comment.user_liked ? moduleColor : undefined }}
            >
              Нравится
            </button>
            <button 
              className="comment-action-link"
              onClick={() => setReplyingTo(!replyingTo)}
            >
              Ответить
            </button>
          </div>

          {/* Reply Form */}
          {replyingTo && (
            <div className="reply-form">
              <div className="reply-input-wrapper">
                <CornerDownRight size={16} color="#65676b" />
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitReply()}
                  placeholder={`Ответить ${comment.author.first_name}...`}
                  className="reply-input"
                  autoFocus
                />
              </div>
              <div className="reply-buttons">
                <button 
                  className="reply-submit-btn"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim()}
                  style={{ background: replyContent.trim() ? moduleColor : '#e4e6e9' }}
                >
                  Ответить
                </button>
                <button className="reply-cancel-btn" onClick={() => setReplyingTo(false)}>
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="nested-replies">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              level={level + 1}
              moduleColor={moduleColor}
              user={user}
              onCommentLike={onCommentLike}
              onCommentEdit={onCommentEdit}
              onCommentDelete={onCommentDelete}
              onCommentSubmit={onCommentSubmit}
            />
          ))}
        </div>
      )}

      <style jsx="true">{`
        .enhanced-comment-item {
          margin-bottom: 8px;
        }

        .enhanced-comment-item.is-reply {
          margin-top: 8px;
        }

        .comment-main {
          display: flex;
          gap: 8px;
        }

        .comment-avatar-img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
        }

        .comment-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .is-reply .comment-avatar-img,
        .is-reply .comment-avatar-placeholder {
          width: 28px;
          height: 28px;
        }

        .comment-bubble-container {
          flex: 1;
          min-width: 0;
        }

        .comment-bubble {
          background: #f0f2f5;
          border-radius: 18px;
          padding: 8px 12px;
          display: inline-block;
          max-width: 100%;
          position: relative;
        }

        .comment-bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }

        .comment-author-name {
          font-size: 13px;
          font-weight: 600;
          color: #1c1e21;
          cursor: pointer;
        }

        .comment-author-name:hover {
          text-decoration: underline;
        }

        .comment-menu-wrapper {
          position: relative;
        }

        .comment-menu-btn {
          background: none;
          border: none;
          padding: 4px;
          border-radius: 50%;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s, background 0.2s;
        }

        .comment-bubble:hover .comment-menu-btn {
          opacity: 1;
        }

        .comment-menu-btn:hover {
          background: #e4e6e9;
        }

        .comment-menu-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
          padding: 4px;
          min-width: 150px;
          z-index: 10;
        }

        .comment-menu-dropdown button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          color: #1c1e21;
        }

        .comment-menu-dropdown button:hover {
          background: #f0f2f5;
        }

        .comment-menu-dropdown button.delete-btn {
          color: #dc2626;
        }

        .comment-text {
          font-size: 14px;
          line-height: 1.4;
          color: #1c1e21;
          margin: 2px 0 0 0;
          word-wrap: break-word;
        }

        .comment-like-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 11px;
          color: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .comment-actions-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 4px 12px 0;
          font-size: 12px;
        }

        .comment-time {
          color: #65676b;
        }

        .edited-tag {
          color: #65676b;
          font-style: italic;
        }

        .comment-action-link {
          background: none;
          border: none;
          color: #65676b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }

        .comment-action-link:hover {
          text-decoration: underline;
        }

        .comment-action-link.liked {
          font-weight: 700;
        }

        .comment-edit-form {
          margin-top: 4px;
        }

        .comment-edit-textarea {
          width: 100%;
          padding: 8px;
          border: none;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          resize: none;
          outline: none;
        }

        .comment-edit-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .edit-save-btn {
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }

        .edit-cancel-btn {
          padding: 6px 12px;
          background: #e4e6e9;
          border: none;
          border-radius: 6px;
          color: #1c1e21;
          font-size: 13px;
          cursor: pointer;
        }

        .reply-form {
          margin-top: 8px;
          padding-left: 12px;
        }

        .reply-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f0f2f5;
          border-radius: 20px;
          padding: 8px 12px;
        }

        .reply-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          outline: none;
        }

        .reply-buttons {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .reply-submit-btn {
          padding: 6px 16px;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .reply-submit-btn:disabled {
          color: #65676b;
          cursor: not-allowed;
        }

        .reply-cancel-btn {
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: #65676b;
          font-size: 13px;
          cursor: pointer;
        }

        .reply-cancel-btn:hover {
          text-decoration: underline;
        }

        .nested-replies {
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

export default CommentItem;
