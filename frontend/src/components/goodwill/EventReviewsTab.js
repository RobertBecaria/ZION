import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../config/api';
import { Star } from 'lucide-react';


const EventReviewsTab = ({
  eventId,
  token,
  moduleColor,
  canReview
}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token || submittingReview || !newReview.comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      });
      if (res.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#64748b' }}>Загрузка отзывов...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 20px 0' }}>
        Отзывы о мероприятии
      </h2>

      {/* Add Review Form */}
      {token && canReview && (
        <form onSubmit={handleSubmitReview} style={{
          background: '#f8fafc',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontWeight: '600' }}>Оставить отзыв</h4>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Оценка</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star
                    size={28}
                    fill={star <= newReview.rating ? '#F59E0B' : 'transparent'}
                    color={star <= newReview.rating ? '#F59E0B' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Расскажите о своих впечатлениях..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '15px',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submittingReview || !newReview.comment.trim()}
            style={{
              padding: '10px 20px',
              background: submittingReview ? '#94a3b8' : moduleColor,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '500',
              cursor: submittingReview ? 'not-allowed' : 'pointer'
            }}
          >
            {submittingReview ? 'Отправка...' : 'Отправить отзыв'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Star size={48} color="#e2e8f0" style={{ marginBottom: '12px' }} />
          <p>Пока нет отзывов</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(review => (
            <div key={review.id} style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: moduleColor + '20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: moduleColor,
                    fontWeight: '600'
                  }}>
                    {review.user?.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '500' }}>
                      {review.user?.first_name} {review.user?.last_name}
                    </p>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= review.rating ? '#F59E0B' : 'transparent'}
                          color={star <= review.rating ? '#F59E0B' : '#e2e8f0'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {new Date(review.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventReviewsTab;
