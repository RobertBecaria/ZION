/**
 * ForgotPassword Component
 * Allows users to request a password reset email
 */
import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { BACKEND_URL } from '../../config';

const BACKGROUND_IMAGE = 'https://customer-assets.emergentagent.com/job_19d0102c-736b-4d98-ac03-8c99eb900d4d/artifacts/vql02g0g_China2%20%281%29.jpg';

function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || 'Произошла ошибка. Попробуйте снова.');
      }
    } catch (err) {
      setError('Ошибка сети. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="auth-container"
        style={{
          backgroundImage: `url(${BACKGROUND_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh'
        }}
      >
        <div
          className="auth-card"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <CheckCircle size={64} style={{ color: '#10B981' }} />
            </div>
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Письмо отправлено!</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>
              Если аккаунт с адресом <strong style={{ color: '#a5b4fc' }}>{email}</strong> существует,
              вы получите письмо с инструкциями по сбросу пароля.
            </p>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              Не получили письмо? Проверьте папку "Спам" или попробуйте снова через несколько минут.
            </p>
            <button
              onClick={onBack}
              className="auth-button"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              <ArrowLeft size={20} /> Вернуться к входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="auth-container"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      <div
        className="auth-card"
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div className="auth-header">
          <div className="auth-logo-section">
            <img src="/zion-logo.jpeg" alt="ZION.CITY Logo" className="auth-logo" />
            <h1 className="platform-logo" style={{ color: '#fff', textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>ZION.CITY</h1>
          </div>
          <h2 style={{ color: '#e2e8f0', marginTop: '10px' }}>Восстановление пароля</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Введите email, указанный при регистрации
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label style={{ color: '#e2e8f0' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#fff'
              }}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
            }}
          >
            {loading ? 'Отправка...' : <><Mail size={20} /> Отправить ссылку</>}
          </button>
        </form>

        <div className="auth-switch">
          <p style={{ color: '#94a3b8' }}>
            <button onClick={onBack} style={{ color: '#a5b4fc', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ArrowLeft size={16} /> Вернуться к входу
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
