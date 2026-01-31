/**
 * ResetPassword Component
 * Allows users to set a new password using the reset token from email
 */
import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { BACKEND_URL } from '../../config/api';

const BACKGROUND_IMAGE = 'https://customer-assets.emergentagent.com/job_19d0102c-736b-4d98-ac03-8c99eb900d4d/artifacts/vql02g0g_China2%20%281%29.jpg';

function ResetPassword({ token, onBack, onSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          new_password: password
        }),
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

  // Success state
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
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Пароль изменён!</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>
              Ваш пароль был успешно обновлён. Теперь вы можете войти с новым паролем.
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button
              onClick={onSuccess || onBack}
              className="auth-button"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)'
              }}
            >
              Войти в аккаунт
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or missing token
  if (!token) {
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
              <XCircle size={64} style={{ color: '#EF4444' }} />
            </div>
            <h2 style={{ color: '#fff', marginBottom: '10px' }}>Недействительная ссылка</h2>
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>
              Ссылка для сброса пароля недействительна или устарела. Пожалуйста, запросите новую ссылку.
            </p>
          </div>

          <div style={{ marginTop: '20px' }}>
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
          <h2 style={{ color: '#e2e8f0', marginTop: '10px' }}>Новый пароль</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Введите новый пароль для вашего аккаунта
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label style={{ color: '#e2e8f0' }}>Новый пароль</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                required
                minLength={6}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#fff'
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: '#a5b4fc' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ color: '#e2e8f0' }}>Подтвердите пароль</label>
            <div className="password-input">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                required
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  color: '#fff'
                }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ color: '#a5b4fc' }}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
            {loading ? 'Сохранение...' : <><Lock size={20} /> Сохранить пароль</>}
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

export default ResetPassword;
