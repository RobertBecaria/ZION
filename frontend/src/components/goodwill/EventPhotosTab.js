import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from '../../config/api';
import { Camera, Image } from 'lucide-react';


const EventPhotosTab = ({
  eventId,
  token,
  moduleColor,
  canUpload
}) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    fetchPhotos();
  }, [eventId]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/photos`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (res.ok) {
        fetchPhotos();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b' }}>Загрузка фотографий...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
          Фотогалерея
        </h2>
        {token && canUpload && (
          <>
            <input
              type="file"
              ref={photoInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={uploadingPhoto}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: moduleColor,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              <Camera size={16} />
              {uploadingPhoto ? 'Загрузка...' : 'Добавить фото'}
            </button>
          </>
        )}
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Image size={48} color="#e2e8f0" style={{ marginBottom: '12px' }} />
          <p>Пока нет фотографий</p>
          {canUpload && <p style={{ fontSize: '14px' }}>Будьте первым, кто поделится моментами!</p>}
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px'
          }}>
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid transparent',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = moduleColor}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                <img
                  src={photo.url}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Photo Lightbox */}
          {selectedPhoto && (
            <div
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                cursor: 'pointer'
              }}
            >
              <img
                src={selectedPhoto.url}
                alt=""
                style={{
                  maxWidth: '90%',
                  maxHeight: '90%',
                  objectFit: 'contain',
                  borderRadius: '8px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {selectedPhoto.user?.first_name} {selectedPhoto.user?.last_name}
                {selectedPhoto.created_at && (
                  <span style={{ marginLeft: '8px', opacity: 0.7 }}>
                    {new Date(selectedPhoto.created_at).toLocaleDateString('ru-RU')}
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventPhotosTab;
