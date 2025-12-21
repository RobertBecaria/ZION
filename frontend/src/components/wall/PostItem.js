import React from 'react';
import { User, MoreHorizontal, Globe, Users, Lock } from 'lucide-react';
import { formatTime } from './utils/postUtils';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import CommentSection from './CommentSection';

function PostItem({ 
  post, 
  moduleColor, 
  user,
  backendUrl,
  showComments,
  comments,
  newComment,
  onLike,
  onReaction,
  onToggleComments,
  onNewCommentChange,
  onCommentSubmit,
  onCommentLike,
  onCommentEdit,
  onCommentDelete,
  onImageClick
}) {
  // Get visibility icon
  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'PUBLIC':
        return <Globe size={12} color="#65676b" />;
      case 'HOUSEHOLD_ONLY':
        return <Users size={12} color="#65676b" />;
      case 'PRIVATE':
        return <Lock size={12} color="#65676b" />;
      default:
        return <Globe size={12} color="#65676b" />;
    }
  };

  return (
    <div className="enhanced-post-item">
      {/* Post Header */}
      <div className="post-header">
        <div className="post-author-section">
          {post.author.profile_picture ? (
            <img 
              src={post.author.profile_picture} 
              alt={`${post.author.first_name} ${post.author.last_name}`}
              className="author-avatar-img"
            />
          ) : (
            <div className="author-avatar-placeholder" style={{ backgroundColor: moduleColor }}>
              <User size={24} color="white" />
            </div>
          )}
          <div className="author-details">
            <h5 className="author-name">{post.author.first_name} {post.author.last_name}</h5>
            <div className="post-meta">
              <span className="post-time">{formatTime(post.created_at)}</span>
              <span className="meta-dot">·</span>
              {getVisibilityIcon()}
            </div>
          </div>
        </div>
        <button className="post-menu-btn">
          <MoreHorizontal size={20} color="#65676b" />
        </button>
      </div>

      {/* Post Content */}
      <div className="post-content">
        {post.content && (
          <p className="post-text">{post.content}</p>
        )}
        
        <PostMedia 
          post={post} 
          backendUrl={backendUrl} 
          onImageClick={onImageClick}
        />
      </div>

      {/* Enhanced Post Actions */}
      <PostActions
        post={post}
        moduleColor={moduleColor}
        onLike={onLike}
        onReaction={onReaction}
        onToggleComments={onToggleComments}
      />

      {/* Comments Section - Always show input, expand for full list */}
      {showComments && (
        <CommentSection
          postId={post.id}
          comments={comments}
          moduleColor={moduleColor}
          user={user}
          newComment={newComment}
          onNewCommentChange={onNewCommentChange}
          onCommentSubmit={onCommentSubmit}
          onCommentLike={onCommentLike}
          onCommentEdit={onCommentEdit}
          onCommentDelete={onCommentDelete}
          initiallyExpanded={true}
        />
      )}

      <style jsx="true">{`
        .enhanced-post-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
          margin-bottom: 16px;
          padding: 16px;
          transition: box-shadow 0.2s ease;
        }

        .enhanced-post-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .post-author-section {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .author-avatar-img {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
        }

        .author-avatar-placeholder {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .author-name {
          font-size: 15px;
          font-weight: 600;
          color: #1c1e21;
          margin: 0;
          cursor: pointer;
        }

        .author-name:hover {
          text-decoration: underline;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #65676b;
        }

        .meta-dot {
          font-size: 10px;
        }

        .post-menu-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s;
        }

        .post-menu-btn:hover {
          background: #f0f2f5;
        }

        .post-content {
          margin-bottom: 8px;
        }

        .post-text {
          font-size: 15px;
          line-height: 1.5;
          color: #1c1e21;
          margin: 0 0 12px 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </div>
  );
}

export default PostItem;
