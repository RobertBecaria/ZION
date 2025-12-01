/**
 * MessageBubble Component
 * WhatsApp-style message bubble with status indicators, replies, and attachments
 */
import React from 'react';
import { Check, CheckCheck, Reply, Image, File, Download } from 'lucide-react';

const MessageBubble = ({
  message,
  isOwn,
  showSender = false,
  onReply,
  moduleColor = '#059669'
}) => {
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;
    switch (message.status) {
      case 'read':
        return <CheckCheck size={14} className="status-icon read" />;
      case 'delivered':
        return <CheckCheck size={14} className="status-icon delivered" />;
      default:
        return <Check size={14} className="status-icon sent" />;
    }
  };

  const renderAttachment = () => {
    if (!message.attachment) return null;
    
    const { filename, file_path, mime_type } = message.attachment;
    const isImage = mime_type?.startsWith('image/');
    
    if (isImage) {
      return (
        <div className="attachment-container image-attachment">
          <img 
            src={`${process.env.REACT_APP_BACKEND_URL}${file_path}`} 
            alt={filename}
            className="attachment-image"
            onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}${file_path}`, '_blank')}
          />
        </div>
      );
    }
    
    return (
      <div className="attachment-container file-attachment">
        <File size={32} color={moduleColor} />
        <div className="file-info">
          <span className="file-name">{filename}</span>
          <a 
            href={`${process.env.REACT_APP_BACKEND_URL}${file_path}`}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            className="download-btn"
          >
            <Download size={16} /> Скачать
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={`message-bubble-wrapper ${isOwn ? 'own' : 'other'}`}>
      <div 
        className={`message-bubble ${isOwn ? 'own-bubble' : 'other-bubble'}`}
        style={isOwn ? { backgroundColor: `${moduleColor}20` } : {}}
      >
        {/* Reply reference */}
        {message.reply_to && message.reply_message && (
          <div className="reply-reference">
            <div className="reply-bar" style={{ backgroundColor: moduleColor }}></div>
            <div className="reply-content">
              <span className="reply-sender" style={{ color: moduleColor }}>
                {message.reply_message.sender?.first_name || 'Unknown'}
              </span>
              <span className="reply-text">
                {message.reply_message.content?.substring(0, 60)}{message.reply_message.content?.length > 60 ? '...' : ''}
              </span>
            </div>
          </div>
        )}
        
        {/* Sender name for group chats */}
        {showSender && !isOwn && message.sender && (
          <div className="sender-name" style={{ color: moduleColor }}>
            {message.sender.first_name} {message.sender.last_name}
          </div>
        )}
        
        {/* Attachment */}
        {renderAttachment()}
        
        {/* Message content */}
        <div className="message-content">
          {message.message_type !== 'IMAGE' && message.message_type !== 'FILE' && (
            <span className="message-text">{message.content}</span>
          )}
          {(message.message_type === 'IMAGE' || message.message_type === 'FILE') && !message.attachment && (
            <span className="message-text">{message.content}</span>
          )}
          <span className="message-meta">
            {message.is_edited && <span className="edited-label">изменено</span>}
            <span className="message-time">{formatTime(message.created_at)}</span>
            {getStatusIcon()}
          </span>
        </div>
        
        {/* Message tail */}
        <div className={`bubble-tail ${isOwn ? 'own-tail' : 'other-tail'}`}></div>
      </div>
      
      {/* Hover actions */}
      <div className="message-actions">
        <button className="action-btn" onClick={() => onReply && onReply(message)} title="Ответить">
          <Reply size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessageBubble;
