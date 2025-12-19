/**
 * AdminFinance Component
 * Admin panel for managing ALTYN banking system
 */
import React, { useState, useEffect } from 'react';
import { 
  Shield, Coins, Gift, Users, AlertTriangle, CheckCircle,
  RefreshCw, Plus, Send, TrendingUp
} from 'lucide-react';

const AdminFinance = ({ onRefresh, moduleColor = '#A16207', userEmail }) => {
  const [treasury, setTreasury] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Emission form
  const [emissionAmount, setEmissionAmount] = useState('');
  const [emissionDescription, setEmissionDescription] = useState('');

  // Initialize tokens form
  const [initEmail, setInitEmail] = useState('');
  const [initTokens, setInitTokens] = useState('35000000');
  const [initCoins, setInitCoins] = useState('1000000');

  const fetchTreasury = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/treasury`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTreasury(data);
      }
    } catch (err) {
      console.error('Error fetching treasury:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreasury();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateEmission = async (e) => {
    e.preventDefault();
    if (!emissionAmount || parseFloat(emissionAmount) <= 0) {
      showMessage('error', 'Введите корректную сумму');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/admin/emission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(emissionAmount),
          description: emissionDescription || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка создания эмиссии');
      }

      showMessage('success', `Эмиссия ${parseFloat(emissionAmount).toLocaleString()} AC успешно создана`);
      setEmissionAmount('');
      setEmissionDescription('');
      fetchTreasury();
      onRefresh && onRefresh();
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDistributeDividends = async () => {
    if (!treasury?.treasury?.collected_fees || treasury.treasury.collected_fees <= 0) {
      showMessage('error', 'Нет комиссий для распределения');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/admin/distribute-dividends`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка распределения дивидендов');
      }

      showMessage('success', `Распределено ${data.payout.total_distributed.toLocaleString()} AC между ${data.payout.holders_count} держателями`);
      fetchTreasury();
      onRefresh && onRefresh();
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInitializeTokens = async (e) => {
    e.preventDefault();
    if (!initEmail) {
      showMessage('error', 'Введите email пользователя');
      return;
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('zion_token');

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/finance/admin/initialize-tokens?user_email=${encodeURIComponent(initEmail)}&token_amount=${initTokens}&coin_amount=${initCoins}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка инициализации');
      }

      showMessage('success', data.message);
      setInitEmail('');
      fetchTreasury();
      onRefresh && onRefresh();
    } catch (err) {
      showMessage('error', err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-finance loading">
        <RefreshCw size={24} className="spin" />
        <span>Загрузка данных казначейства...</span>
      </div>
    );
  }

  const collectedFees = treasury?.treasury?.collected_fees || 0;
  const totalCoins = treasury?.treasury?.total_coins_in_circulation || 0;
  const totalTokens = treasury?.treasury?.total_token_supply || 35000000;

  return (
    <div className="admin-finance" style={{ '--module-color': moduleColor }}>
      <div className="admin-header">
        <h3><Shield size={20} /> Панель администратора</h3>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Treasury Stats */}
      <div className="treasury-stats">
        <div className="stat-card">
          <Coins size={24} />
          <div className="stat-content">
            <span className="stat-label">Собрано комиссий</span>
            <span className="stat-value">{collectedFees.toLocaleString()} AC</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={24} />
          <div className="stat-content">
            <span className="stat-label">Монет в обороте</span>
            <span className="stat-value">{totalCoins.toLocaleString()} AC</span>
          </div>
        </div>
        <div className="stat-card">
          <Users size={24} />
          <div className="stat-content">
            <span className="stat-label">Всего токенов</span>
            <span className="stat-value">{totalTokens.toLocaleString()} AT</span>
          </div>
        </div>
      </div>

      {/* Distribute Dividends */}
      <div className="admin-section">
        <h4><Gift size={18} /> Распределение дивидендов</h4>
        <p className="section-desc">
          Распределить собранные комиссии ({collectedFees.toLocaleString()} AC) между держателями ALTYN TOKEN
        </p>
        <button 
          className="action-btn primary"
          onClick={handleDistributeDividends}
          disabled={actionLoading || collectedFees <= 0}
        >
          <Send size={18} />
          {actionLoading ? 'Распределение...' : 'Распределить дивиденды'}
        </button>
      </div>

      {/* Create Emission */}
      <div className="admin-section">
        <h4><Plus size={18} /> Новая эмиссия ALTYN COIN</h4>
        <form onSubmit={handleCreateEmission} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Сумма эмиссии</label>
              <input
                type="number"
                value={emissionAmount}
                onChange={(e) => setEmissionAmount(e.target.value)}
                placeholder="1000000"
                min="1"
                disabled={actionLoading}
              />
            </div>
            <div className="form-group">
              <label>Описание (опционально)</label>
              <input
                type="text"
                value={emissionDescription}
                onChange={(e) => setEmissionDescription(e.target.value)}
                placeholder="Причина эмиссии..."
                disabled={actionLoading}
              />
            </div>
          </div>
          <button type="submit" className="action-btn" disabled={actionLoading || !emissionAmount}>
            <Coins size={18} />
            {actionLoading ? 'Создание...' : 'Создать эмиссию'}
          </button>
        </form>
      </div>

      {/* Initialize Tokens */}
      <div className="admin-section">
        <h4><Users size={18} /> Инициализация TOKENS для пользователя</h4>
        <p className="section-desc">Первоначальное распределение токенов инвесторам</p>
        <form onSubmit={handleInitializeTokens} className="admin-form">
          <div className="form-row">
            <div className="form-group">
              <label>Email пользователя</label>
              <input
                type="email"
                value={initEmail}
                onChange={(e) => setInitEmail(e.target.value)}
                placeholder="investor@example.com"
                disabled={actionLoading}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Количество TOKENS</label>
              <input
                type="number"
                value={initTokens}
                onChange={(e) => setInitTokens(e.target.value)}
                placeholder="35000000"
                min="1"
                disabled={actionLoading}
              />
            </div>
            <div className="form-group">
              <label>Количество COINS</label>
              <input
                type="number"
                value={initCoins}
                onChange={(e) => setInitCoins(e.target.value)}
                placeholder="1000000"
                min="0"
                disabled={actionLoading}
              />
            </div>
          </div>
          <button type="submit" className="action-btn" disabled={actionLoading || !initEmail}>
            <TrendingUp size={18} />
            {actionLoading ? 'Инициализация...' : 'Инициализировать токены'}
          </button>
        </form>
      </div>

      {/* Recent Emissions */}
      {treasury?.recent_emissions?.length > 0 && (
        <div className="admin-section">
          <h4>📜 Последние эмиссии</h4>
          <div className="history-list">
            {treasury.recent_emissions.map((emission, idx) => (
              <div key={idx} className="history-item">
                <span className="history-amount">+{emission.amount.toLocaleString()} AC</span>
                <span className="history-desc">{emission.description}</span>
                <span className="history-date">
                  {new Date(emission.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-finance {
          padding: 0;
        }

        .admin-finance.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #64748b;
        }

        .admin-finance.loading .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .admin-header {
          margin-bottom: 20px;
        }

        .admin-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #DC2626;
        }

        .admin-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .admin-message.error {
          background: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FECACA;
        }

        .admin-message.success {
          background: #F0FDF4;
          color: #16A34A;
          border: 1px solid #BBF7D0;
        }

        .treasury-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .stat-card svg {
          color: var(--module-color);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
        }

        .admin-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .admin-section h4 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1e293b;
        }

        .section-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0 0 16px 0;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #475569;
          margin-bottom: 6px;
        }

        .form-group input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--module-color);
          box-shadow: 0 0 0 3px ${moduleColor}20;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: linear-gradient(135deg, ${moduleColor} 0%, ${moduleColor}dd 100%);
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          width: fit-content;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        }

        .action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .history-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: white;
          border-radius: 8px;
        }

        .history-amount {
          font-weight: 600;
          color: #10B981;
        }

        .history-desc {
          flex: 1;
          font-size: 14px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-date {
          font-size: 12px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default AdminFinance;
