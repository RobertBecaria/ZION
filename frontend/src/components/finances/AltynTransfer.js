/**
 * AltynTransfer Component
 * Allows users to transfer ALTYN TOKEN from Ethereum wallet to Zion.City platform
 */
import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Wallet, CheckCircle, XCircle, AlertTriangle,
  ExternalLink, Clock, RefreshCw, Shield, Info, Loader2, Copy, Check
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AltynTransfer = ({ moduleColor = '#A16207', onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Info, 2: Input, 3: Verify, 4: Submit, 5: Complete
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [transferResult, setTransferResult] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check user access on mount
  useEffect(() => {
    checkAccess();
    fetchMyRequests();
  }, []);

  const checkAccess = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/finance/altyn-transfer/check-access`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAccessInfo(data);
    } catch (err) {
      console.error('Error checking access:', err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/finance/altyn-transfer/my-requests?limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.transfers || []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const verifyWallet = async () => {
    if (!walletAddress.trim()) {
      setError('Введите адрес кошелька');
      return;
    }

    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('Неверный формат адреса Ethereum кошелька');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/finance/altyn-transfer/verify-wallet`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eth_wallet_address: walletAddress })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка верификации');
      }

      setVerificationResult(data);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTransfer = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/finance/altyn-transfer/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          eth_wallet_address: walletAddress,
          signature: null // Can add signature support later
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка создания заявки');
      }

      setTransferResult(data.transfer);
      setStep(5);
      fetchMyRequests();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setWalletAddress('');
    setVerificationResult(null);
    setTransferResult(null);
    setError(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ru-RU', {
      maximumFractionDigits: 6
    }).format(num);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: '#F59E0B', bg: '#FEF3C7', text: 'Ожидает' },
      VERIFIED: { color: '#3B82F6', bg: '#DBEAFE', text: 'Проверено' },
      APPROVED: { color: '#10B981', bg: '#D1FAE5', text: 'Одобрено' },
      COMPLETED: { color: '#10B981', bg: '#D1FAE5', text: 'Завершено' },
      REJECTED: { color: '#EF4444', bg: '#FEE2E2', text: 'Отклонено' },
      FAILED: { color: '#EF4444', bg: '#FEE2E2', text: 'Ошибка' }
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span style={{
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  // Access denied view
  if (accessInfo && !accessInfo.has_access) {
    return (
      <div className="altyn-transfer" style={{ '--module-color': moduleColor }}>
        <div className="transfer-card error">
          <XCircle size={48} color="#EF4444" />
          <h3>Доступ ограничен</h3>
          <p>{accessInfo.reason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="altyn-transfer" style={{ '--module-color': moduleColor }}>
      {/* Header */}
      <div className="transfer-header">
        <div className="header-title">
          <ArrowRightLeft size={24} style={{ color: moduleColor }} />
          <h2>Перенос ALTYN TOKEN с Ethereum</h2>
        </div>
        <button 
          className="history-btn" 
          onClick={() => setShowHistory(!showHistory)}
        >
          <Clock size={18} />
          {showHistory ? 'Скрыть историю' : 'История заявок'}
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="history-panel">
          <h3>Мои заявки на перенос</h3>
          {myRequests.length === 0 ? (
            <p className="no-data">Нет заявок</p>
          ) : (
            <div className="requests-list">
              {myRequests.map((req) => (
                <div key={req.id} className="request-item">
                  <div className="request-info">
                    <span className="wallet-address">{req.eth_wallet_address}</span>
                    <span className="amount">{formatNumber(req.amount_to_issue)} AT</span>
                  </div>
                  <div className="request-status">
                    {getStatusBadge(req.status)}
                    <span className="date">
                      {new Date(req.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step Progress */}
      <div className="step-progress">
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`step ${step >= s ? 'active' : ''} ${step === s ? 'current' : ''}`}
            style={{ '--step-color': step >= s ? moduleColor : '#e2e8f0' }}
          >
            <div className="step-circle">{s}</div>
            <span className="step-label">
              {s === 1 && 'Инфо'}
              {s === 2 && 'Кошелёк'}
              {s === 3 && 'Проверка'}
              {s === 4 && 'Подтверждение'}
              {s === 5 && 'Готово'}
            </span>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Step 1: Information */}
      {step === 1 && (
        <div className="transfer-step info-step">
          <div className="info-card">
            <div className="info-icon" style={{ background: `linear-gradient(135deg, ${moduleColor} 0%, ${moduleColor}99 100%)` }}>
              <Info size={32} color="white" />
            </div>
            <h3>Что такое перенос ALTYN TOKEN?</h3>
            <p>
              Эта функция позволяет вам перенести ваши ALTYN TOKEN с Ethereum блокчейна 
              на платформу Zion.City. После переноса токены будут зачислены на ваш 
              кошелёк в системе.
            </p>
          </div>

          <div className="info-steps">
            <div className="info-item">
              <div className="item-number">1</div>
              <div className="item-content">
                <h4>Введите адрес кошелька</h4>
                <p>Укажите адрес вашего Ethereum кошелька, на котором хранятся ALTYN TOKEN</p>
              </div>
            </div>
            <div className="info-item">
              <div className="item-number">2</div>
              <div className="item-content">
                <h4>Проверка баланса</h4>
                <p>Система проверит баланс ALTYN TOKEN через Etherscan</p>
              </div>
            </div>
            <div className="info-item">
              <div className="item-number">3</div>
              <div className="item-content">
                <h4>Зачисление токенов</h4>
                <p>
                  {accessInfo?.settings?.mode === 'AUTOMATIC' 
                    ? 'Токены будут зачислены автоматически после подтверждения'
                    : 'После проверки администратором токены будут зачислены на ваш счёт'}
                </p>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <AlertTriangle size={20} color="#F59E0B" />
            <div>
              <strong>Важно!</strong>
              <p>Каждый Ethereum кошелёк может быть использован для переноса только один раз.</p>
            </div>
          </div>

          <div className="contract-info">
            <Shield size={18} />
            <span>Контракт ALTYN TOKEN: </span>
            <a 
              href="https://etherscan.io/token/0x095d7847945c6a496cad77bff0687a1bf367ec4a" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              0x095d...7ec4a
              <ExternalLink size={14} />
            </a>
          </div>

          <button 
            className="primary-btn"
            onClick={() => setStep(2)}
            style={{ background: moduleColor }}
          >
            Начать перенос
          </button>
        </div>
      )}

      {/* Step 2: Wallet Input */}
      {step === 2 && (
        <div className="transfer-step input-step">
          <div className="input-card">
            <Wallet size={48} style={{ color: moduleColor }} />
            <h3>Введите адрес Ethereum кошелька</h3>
            <p>Укажите адрес кошелька, на котором находятся ваши ALTYN TOKEN</p>
            
            <div className="input-group">
              <label>Ethereum адрес</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="wallet-input"
              />
              <span className="input-hint">Начинается с 0x, 42 символа</span>
            </div>

            <div className="button-group">
              <button className="secondary-btn" onClick={() => setStep(1)}>
                Назад
              </button>
              <button 
                className="primary-btn"
                onClick={verifyWallet}
                disabled={loading || !walletAddress.trim()}
                style={{ background: moduleColor }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Проверка...
                  </>
                ) : (
                  <>Проверить кошелёк</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Verification Result */}
      {step === 3 && verificationResult && (
        <div className="transfer-step verify-step">
          <div className="verify-card success">
            <CheckCircle size={48} color="#10B981" />
            <h3>Кошелёк проверен!</h3>
            
            <div className="verify-details">
              <div className="detail-row">
                <span className="label">Адрес кошелька:</span>
                <div className="value-with-copy">
                  <span className="value mono">{verificationResult.wallet_address}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(verificationResult.wallet_address)}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="detail-row highlight">
                <span className="label">Баланс ALTYN TOKEN:</span>
                <span className="value large">{formatNumber(verificationResult.balance)} AT</span>
              </div>
              <div className="detail-row">
                <span className="label">Контракт:</span>
                <a 
                  href={`https://etherscan.io/token/${verificationResult.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="value link"
                >
                  {verificationResult.contract}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="info-box">
              <Info size={18} />
              <span>
                {verificationResult.mode === 'AUTOMATIC'
                  ? 'Токены будут зачислены автоматически после подтверждения.'
                  : 'После подтверждения заявка будет отправлена на модерацию.'}
              </span>
            </div>

            <div className="button-group">
              <button className="secondary-btn" onClick={() => setStep(2)}>
                Изменить кошелёк
              </button>
              <button 
                className="primary-btn"
                onClick={() => setStep(4)}
                style={{ background: moduleColor }}
              >
                Продолжить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div className="transfer-step confirm-step">
          <div className="confirm-card">
            <Shield size={48} style={{ color: moduleColor }} />
            <h3>Подтверждение переноса</h3>
            
            <div className="confirm-summary">
              <div className="summary-row">
                <span>Ethereum кошелёк:</span>
                <span className="mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</span>
              </div>
              <div className="summary-row highlight">
                <span>Сумма к зачислению:</span>
                <span>{formatNumber(verificationResult?.balance || 0)} ALTYN TOKEN</span>
              </div>
              <div className="summary-row">
                <span>Режим:</span>
                <span>
                  {verificationResult?.mode === 'AUTOMATIC' ? 'Автоматический' : 'Модерация'}
                </span>
              </div>
            </div>

            <div className="warning-box">
              <AlertTriangle size={20} color="#F59E0B" />
              <div>
                <strong>Внимание!</strong>
                <p>После подтверждения этот кошелёк больше нельзя будет использовать для переноса.</p>
              </div>
            </div>

            <div className="button-group">
              <button className="secondary-btn" onClick={() => setStep(3)}>
                Назад
              </button>
              <button 
                className="primary-btn"
                onClick={submitTransfer}
                disabled={loading}
                style={{ background: moduleColor }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Обработка...
                  </>
                ) : (
                  <>Подтвердить перенос</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 5 && transferResult && (
        <div className="transfer-step complete-step">
          <div className={`complete-card ${transferResult.status === 'COMPLETED' ? 'success' : 'pending'}`}>
            {transferResult.status === 'COMPLETED' ? (
              <>
                <CheckCircle size={64} color="#10B981" />
                <h3>Токены успешно зачислены!</h3>
                <p>ALTYN TOKEN переведены на ваш кошелёк в Zion.City</p>
              </>
            ) : (
              <>
                <Clock size={64} color="#F59E0B" />
                <h3>Заявка отправлена!</h3>
                <p>Ваша заявка отправлена на рассмотрение администратором</p>
              </>
            )}

            <div className="result-details">
              <div className="detail-row">
                <span>ID заявки:</span>
                <span className="mono">{transferResult.id}</span>
              </div>
              <div className="detail-row highlight">
                <span>Сумма:</span>
                <span>{formatNumber(transferResult.amount)} AT</span>
              </div>
              <div className="detail-row">
                <span>Статус:</span>
                {getStatusBadge(transferResult.status)}
              </div>
              {transferResult.transaction_id && (
                <div className="detail-row">
                  <span>Транзакция:</span>
                  <span className="mono">{transferResult.transaction_id.slice(0, 16)}...</span>
                </div>
              )}
            </div>

            <button 
              className="primary-btn"
              onClick={resetForm}
              style={{ background: moduleColor }}
            >
              <RefreshCw size={18} />
              Новый перенос
            </button>
          </div>
        </div>
      )}

      <style>{`
        .altyn-transfer {
          padding: 16px;
        }

        .transfer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-title h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
        }

        .history-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: all 0.2s;
        }

        .history-btn:hover {
          background: #f8fafc;
          color: var(--module-color);
        }

        .history-panel {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .history-panel h3 {
          margin: 0 0 16px;
          font-size: 16px;
        }

        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .request-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .request-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wallet-address {
          font-family: monospace;
          font-size: 12px;
          color: #64748b;
        }

        .amount {
          font-weight: 600;
          color: #1e293b;
        }

        .request-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .date {
          font-size: 12px;
          color: #94a3b8;
        }

        .no-data {
          text-align: center;
          color: #94a3b8;
          padding: 24px;
        }

        .step-progress {
          display: flex;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 0 16px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--step-color);
          color: white;
          font-weight: 600;
          transition: all 0.3s;
        }

        .step.current .step-circle {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .step-label {
          font-size: 12px;
          color: #64748b;
        }

        .step.active .step-label {
          color: var(--step-color);
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          margin-bottom: 24px;
          color: #dc2626;
        }

        .error-message button {
          margin-left: auto;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #dc2626;
        }

        .transfer-step {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .info-card {
          text-align: center;
          padding: 32px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          margin-bottom: 24px;
          max-width: 500px;
        }

        .info-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .info-card h3 {
          margin: 0 0 12px;
          font-size: 20px;
        }

        .info-card p {
          color: #64748b;
          line-height: 1.6;
        }

        .info-steps {
          width: 100%;
          max-width: 500px;
          margin-bottom: 24px;
        }

        .info-item {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-bottom: 12px;
        }

        .item-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--module-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .item-content h4 {
          margin: 0 0 4px;
          font-size: 14px;
        }

        .item-content p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }

        .warning-box {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 12px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 500px;
        }

        .warning-box strong {
          display: block;
          margin-bottom: 4px;
          color: #92400e;
        }

        .warning-box p {
          margin: 0;
          font-size: 13px;
          color: #78350f;
        }

        .contract-info {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
          margin-bottom: 24px;
        }

        .contract-info a {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--module-color);
          text-decoration: none;
        }

        .contract-info a:hover {
          text-decoration: underline;
        }

        .primary-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 32px;
          background: var(--module-color);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .secondary-btn {
          padding: 14px 24px;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .secondary-btn:hover {
          background: #f8fafc;
        }

        .button-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .input-card, .verify-card, .confirm-card, .complete-card {
          text-align: center;
          padding: 32px;
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          width: 100%;
          max-width: 500px;
        }

        .input-card h3, .verify-card h3, .confirm-card h3, .complete-card h3 {
          margin: 16px 0 8px;
          font-size: 20px;
        }

        .input-card p, .verify-card p, .confirm-card p, .complete-card p {
          color: #64748b;
          margin-bottom: 24px;
        }

        .input-group {
          text-align: left;
          margin-bottom: 16px;
        }

        .input-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .wallet-input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: monospace;
          transition: all 0.2s;
        }

        .wallet-input:focus {
          outline: none;
          border-color: var(--module-color);
        }

        .input-hint {
          display: block;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 8px;
        }

        .verify-details, .result-details, .confirm-summary {
          text-align: left;
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin: 24px 0;
        }

        .detail-row, .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child, .summary-row:last-child {
          border-bottom: none;
        }

        .detail-row.highlight, .summary-row.highlight {
          background: #fef3c7;
          margin: 0 -16px;
          padding: 12px 16px;
          border-radius: 8px;
        }

        .detail-row .label, .summary-row span:first-child {
          color: #64748b;
          font-size: 14px;
        }

        .detail-row .value, .summary-row span:last-child {
          font-weight: 500;
          font-size: 14px;
        }

        .detail-row .value.large {
          font-size: 18px;
          font-weight: 700;
          color: var(--module-color);
        }

        .detail-row .value.mono, .mono {
          font-family: monospace;
          font-size: 12px;
        }

        .value-with-copy {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .copy-btn {
          padding: 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          cursor: pointer;
          color: #64748b;
        }

        .copy-btn:hover {
          background: #f8fafc;
        }

        .detail-row .value.link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--module-color);
          text-decoration: none;
        }

        .info-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #eff6ff;
          border-radius: 8px;
          font-size: 13px;
          color: #1e40af;
          margin-bottom: 16px;
        }

        .complete-card.success {
          border-color: #10B981;
        }

        .complete-card.pending {
          border-color: #F59E0B;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .step-progress {
            padding: 0;
          }

          .step-label {
            display: none;
          }

          .transfer-header {
            flex-direction: column;
            gap: 16px;
          }

          .button-group {
            flex-direction: column;
            width: 100%;
          }

          .primary-btn, .secondary-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AltynTransfer;
