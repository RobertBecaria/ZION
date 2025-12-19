/**
 * SendCoins Component
 * Modal for sending ALTYN COINS or TOKENS
 */
import React, { useState } from 'react';
import { X, Send, User, Coins, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const SendCoins = ({ 
  assetType = 'COIN', 
  currentBalance = 0, 
  onClose, 
  onSuccess,
  moduleColor = '#A16207'
}) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isCoin = assetType === 'COIN';
  const feeRate = isCoin ? 0.001 : 0; // 0.1% fee for COINS only
  const amountNum = parseFloat(amount) || 0;
  const fee = amountNum * feeRate;
  const netAmount = amountNum - fee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!recipientEmail || !amount) {
      setError('Заполните все обязательные поля');
      return;
    }

    if (amountNum <= 0) {
      setError('Сумма должна быть больше нуля');
      return;
    }

    if (amountNum > currentBalance) {
      setError('Недостаточно средств');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to_user_email: recipientEmail,
          amount: amountNum,
          asset_type: assetType,
          description: description || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Ошибка перевода');
      }

      setSuccess(`Успешно отправлено ${amountNum} ${isCoin ? 'ALTYN COIN' : 'ALTYN TOKEN'} пользователю ${data.transaction.recipient}`);
      
      setTimeout(() => {
        onSuccess && onSuccess(data.transaction);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="send-modal" style={{ '--module-color': moduleColor }}>
        <div className="modal-header">
          <div className="header-title">
            {isCoin ? <Coins size={24} /> : <TrendingUp size={24} />}
            <h3>Отправить {isCoin ? 'ALTYN COIN' : 'ALTYN TOKEN'}</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert success">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                <User size={16} />
                Email получателя *
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={loading || success}
              />
            </div>

            <div className="form-group">
              <label>
                {isCoin ? <Coins size={16} /> : <TrendingUp size={16} />}
                Сумма *
              </label>
              <div className="amount-input">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={loading || success}
                />
                <span className="currency">{isCoin ? 'AC' : 'AT'}</span>
              </div>
              <div className="balance-hint">
                Доступно: {currentBalance.toLocaleString('ru-RU')} {isCoin ? 'AC' : 'AT'}
              </div>
            </div>

            {isCoin && amountNum > 0 && (
              <div className="fee-info">
                <div className="fee-row">
                  <span>Комиссия (0.1%)</span>
                  <span>{fee.toFixed(2)} AC</span>
                </div>
                <div className="fee-row total">
                  <span>Получатель получит</span>
                  <span>{netAmount.toFixed(2)} AC</span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Описание (необязательно)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="За что перевод..."
                disabled={loading || success}
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || success || !recipientEmail || !amount}
                style={{ background: `linear-gradient(135deg, ${moduleColor} 0%, ${moduleColor}dd 100%)` }}
              >
                {loading ? (
                  <>Отправка...</>
                ) : (
                  <>
                    <Send size={18} />
                    Отправить
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
          }

          .send-modal {
            background: white;
            border-radius: 16px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e2e8f0;
          }

          .header-title {
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--module-color);
          }

          .header-title h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
          }

          .close-btn {
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
          }

          .modal-body {
            padding: 24px;
          }

          .alert {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
          }

          .alert.error {
            background: #FEF2F2;
            color: #DC2626;
            border: 1px solid #FECACA;
          }

          .alert.success {
            background: #F0FDF4;
            color: #16A34A;
            border: 1px solid #BBF7D0;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            margin-bottom: 8px;
          }

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 15px;
            transition: all 0.2s;
          }

          .form-group input:focus {
            outline: none;
            border-color: var(--module-color);
            box-shadow: 0 0 0 3px ${moduleColor}20;
          }

          .amount-input {
            position: relative;
          }

          .amount-input input {
            padding-right: 50px;
          }

          .amount-input .currency {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            font-weight: 600;
            color: #64748b;
          }

          .balance-hint {
            font-size: 13px;
            color: #64748b;
            margin-top: 6px;
          }

          .fee-info {
            background: #f8fafc;
            border-radius: 10px;
            padding: 16px;
            margin-bottom: 20px;
          }

          .fee-row {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: #64748b;
            padding: 4px 0;
          }

          .fee-row.total {
            font-weight: 600;
            color: #1e293b;
            border-top: 1px solid #e2e8f0;
            margin-top: 8px;
            padding-top: 12px;
          }

          .form-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
          }

          .cancel-btn {
            flex: 1;
            padding: 14px;
            background: #f1f5f9;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cancel-btn:hover {
            background: #e2e8f0;
          }

          .submit-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 14px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            color: white;
            cursor: pointer;
            transition: all 0.2s;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SendCoins;
