import React from 'react';
import { User, MoreHorizontal, Heart } from 'lucide-react';
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
  return (
    <div className="post-item">
      <div className="post-header">
        <div className="post-author">
          {post.author.profile_picture ? (
            <img 
              src={post.author.profile_picture} 
              alt={`${post.author.first_name} ${post.author.last_name}`}
              className="author-avatar"
              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="author-avatar" style={{ backgroundColor: moduleColor }}>
              <User size={20} color="white" />
            </div>
          )}
          <div className="author-info">
            <h5>{post.author.first_name} {post.author.last_name}</h5>
            <span className="post-time">{formatTime(post.created_at)}</span>
          </div>
        </div>
        <button className="post-menu-btn">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        
        <PostMedia 
          post={post} 
          backendUrl={backendUrl} 
          onImageClick={onImageClick}
        />
      </div>

      {/* Post Stats */}
      <div className="post-stats">
        <div className="stats-left">
          {post.likes_count > 0 && (
            <span className="stat-item">
              <Heart size={16} />
              {post.likes_count}
            </span>
          )}
          {post.top_reactions && post.top_reactions.length > 0 && (
            <div className="reactions-summary">
              {post.top_reactions.map((reaction, index) => (
                <span key={index} className="reaction-item">
                  {reaction.emoji} {reaction.count}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="stats-right">
          {post.comments_count > 0 && (
            <span 
              className="stat-item clickable"
              onClick={() => onToggleComments(post.id)}
            >
              {post.comments_count} комментариев
            </span>
          )}
        </div>
      </div>

      {/* Post Actions Bar */}
      <PostActions
        post={post}
        moduleColor={moduleColor}
        onLike={onLike}
        onReaction={onReaction}
        onToggleComments={onToggleComments}
      />

      {/* Comments Section */}
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
        />
      )}
    </div>
  );
}

export default PostItem;
