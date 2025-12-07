/**
 * WorkTaskCompleteModal Component
 * Modal for completing a task with optional photo proof
 */
import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Image, CheckCircle2, Trash2 } from 'lucide-react';

const WorkTaskCompleteModal = ({
  task,
  organizationId,
  moduleColor = '#C2410C',
  onClose,
  onComplete
}) => {
  const [completionNote, setCompletionNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('zion_token');
      const uploadedPhotos = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/media/upload`,
          {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          }
        );

        if (response.ok) {
          const data = await response.json();
          uploadedPhotos.push({
            id: data.media_id,
            url: data.file_url,
            preview: URL.createObjectURL(file)
          });
        }
      }

      setPhotos(prev => [...prev, ...uploadedPhotos]);
    } catch (err) {
      setError('Ошибка загрузки фото');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Check if photo is required
    if (task.requires_photo_proof && photos.length === 0) {
      setError('Для завершения задачи требуется фото');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/work/organizations/${organizationId}/tasks/${task.id}/status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'DONE',
            completion_note: completionNote.trim() || null,
            completion_photo_ids: photos.map(p => p.id)
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        onComplete && onComplete(data.task);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Ошибка завершения задачи');
      }
    } catch (err) {
      setError('Ошибка сети');
      console.error('Complete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="task-complete-modal"
        onClick={e => e.stopPropagation()}
        style={{ '--module-color': moduleColor }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2>
            <CheckCircle2 size={20} color="#22c55e" />
            Завершение задачи
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Task Info */}
          <div className="task-info">
            <h3>{task.title}</h3>
            {task.description && <p>{task.description}</p>}
          </div>

          {/* Completion Note */}
          <div className="form-group">
            <label>Комментарий к выполнению</label>
            <textarea
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="Опишите что было сделано..."
              rows={3}
            />
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label>
              <Image size={14} />
              Фото подтверждение
              {task.requires_photo_proof && <span className="required">*</span>}
            </label>

            <div className="photo-upload-area">
              {photos.length > 0 && (
                <div className="photo-previews">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-preview">
                      <img src={photo.preview} alt={`Фото ${index + 1}`} />
                      <button 
                        className="remove-photo"
                        onClick={() => removePhoto(index)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <button
                type="button"
                className="upload-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <span>Загрузка...</span>
                ) : (
                  <>
                    <Camera size={18} />
                    <span>Добавить фото</span>
                  </>
                )}
              </button>
            </div>

            {task.requires_photo_proof && (
              <p className="photo-hint">
                Для этой задачи требуется фото подтверждение выполнения
              </p>
            )}
          </div>

          {/* Error */}
          {error && <div className="form-error">{error}</div>}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Отмена
          </button>
          <button 
            className="submit-btn"
            onClick={handleSubmit}
            disabled={loading || (task.requires_photo_proof && photos.length === 0)}
            style={{ backgroundColor: '#22c55e' }}
          >
            {loading ? 'Завершение...' : 'Завершить задачу'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkTaskCompleteModal;
