/**
 * AdminAltynAccounts Component
 * Admin panel for managing ALTYN accounts - block/unblock users
 */
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Shield, ShieldOff, Lock, Unlock, AlertTriangle,
  CheckCircle, XCircle, RefreshCw, Eye, Coins, TrendingUp,
  ChevronDown, ChevronUp, X
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminAltynAccounts = ({ moduleColor = '#A16207' }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBlockedOnly, setShowBlockedOnly] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [accountDetail, setAccountDetail] = useState(null);
  const [blockStats, setBlockStats] = useState(null);
  const [blockForm, setBlockForm] = useState({
    block_account: false,
    block_coin: false,
    block_token: false,
    reason: ''
  });

  const getAdminToken = () => localStorage.getItem('admin_token');

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (showBlockedOnly) params.append('blocked_only', 'true');

      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-accounts?${params}`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, showBlockedOnly]);

  const fetchBlockStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-blocked-stats`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setBlockStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching block stats:', err);
    }
  };

  const fetchAccountDetail = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-accounts/${userId}`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setAccountDetail(data.account);
        setShowDetailModal(true);
      }
    } catch (err) {
      showError('Ошибка загрузки данных аккаунта');
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchBlockStats();
  }, [fetchAccounts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAccounts();
  };

  const openBlockModal = (account) => {
    setSelectedAccount(account);
    setBlockForm({
      block_account: account.blocks.account_blocked,
      block_coin: account.blocks.coin_blocked,
      block_token: account.blocks.token_blocked,
      reason: account.blocks.block_reason || ''
    });
    setShowBlockModal(true);
  };

  const handleBlockSubmit = async () => {
    if (!selectedAccount) return;

    setActionLoading(selectedAccount.user_id);
    try {
      const params = new URLSearchParams();
      params.append('block_account', blockForm.block_account);
      params.append('block_coin', blockForm.block_coin);
      params.append('block_token', blockForm.block_token);
      if (blockForm.reason) params.append('reason', blockForm.reason);

      const response = await fetch(
        `${BACKEND_URL}/api/admin/finance/altyn-accounts/${selectedAccount.user_id}/block?${params}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess('Настройки блокировки обновлены');
        setShowBlockModal(false);
        fetchAccounts();
        fetchBlockStats();
      } else {
        throw new Error(data.detail || 'Ошибка обновления');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const unblockAll = async (userId) => {
    if (!window.confirm('Снять все блокировки с этого аккаунта?')) return;

    setActionLoading(userId);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/finance/altyn-accounts/${userId}/block`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess('Все блокировки сняты');
        fetchAccounts();
        fetchBlockStats();
      } else {
        throw new Error(data.detail || 'Ошибка');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const quickBlock = async (userId, blockType, value) => {
    setActionLoading(userId);
    try {
      const params = new URLSearchParams();
      params.append(blockType, value);

      const response = await fetch(
        `${BACKEND_URL}/api/admin/finance/altyn-accounts/${userId}/block?${params}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess(value ? 'Заблокировано' : 'Разблокировано');
        fetchAccounts();
        fetchBlockStats();
      }
    } catch (err) {
      showError('Ошибка');
    } finally {
      setActionLoading(null);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(num || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasAnyBlock = (blocks) => {
    return blocks.account_blocked || blocks.coin_blocked || blocks.token_blocked;
  };

  return (
    <div className="admin-altyn-accounts" style={{ '--module-color': moduleColor }}>
      {/* Header */}
      <div className="section-header">
        <div className="header-title">
          <Users size={24} style={{ color: moduleColor }} />
          <h2>Управление ALTYN аккаунтами</h2>
        </div>
        <button className="refresh-btn" onClick={() => { fetchAccounts(); fetchBlockStats(); }}>
          <RefreshCw size={18} />
          Обновить
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="message error">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="message success">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      {blockStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blocked">
              <ShieldOff size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{blockStats.total_blocked_accounts}</span>
              <span className="stat-label">Заблокировано аккаунтов</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon coin">
              <Coins size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{blockStats.total_coin_blocked}</span>
              <span className="stat-label">COIN заблокирован</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon token">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{blockStats.total_token_blocked}</span>
              <span className="stat-label">TOKEN заблокирован</span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <form className="filters" onSubmit={handleSearch}>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Поиск по email, имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="search-btn">Найти</button>
        </div>
        <label className="checkbox-filter">
          <input
            type="checkbox"
            checked={showBlockedOnly}
            onChange={(e) => setShowBlockedOnly(e.target.checked)}
          />
          <span>Только заблокированные</span>
        </label>
      </form>

      {/* Accounts Table */}
      {loading ? (
        <div className="loading">
          <RefreshCw size={24} className="spin" />
          <span>Загрузка...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="no-data">
          <Users size={48} color="#cbd5e1" />
          <p>{searchTerm ? 'Аккаунты не найдены' : 'Нет аккаунтов'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>COIN Баланс</th>
                <th>TOKEN Баланс</th>
                <th>Статус блокировки</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.user_id} className={hasAnyBlock(account.blocks) ? 'blocked-row' : ''}>
                  <td>
                    <div className="user-info">
                      <span className="user-name">{account.first_name} {account.last_name}</span>
                      <span className="user-email">{account.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className={`balance ${account.blocks.coin_blocked ? 'blocked' : ''}`}>
                      <Coins size={14} />
                      <span>{formatNumber(account.wallet.coin_balance)}</span>
                      {account.blocks.coin_blocked && <Lock size={12} className="lock-icon" />}
                    </div>
                  </td>
                  <td>
                    <div className={`balance ${account.blocks.token_blocked ? 'blocked' : ''}`}>
                      <TrendingUp size={14} />
                      <span>{formatNumber(account.wallet.token_balance)}</span>
                      {account.blocks.token_blocked && <Lock size={12} className="lock-icon" />}
                    </div>
                  </td>
                  <td>
                    <div className="block-status">
                      {account.blocks.account_blocked && (
                        <span className="block-badge account">Аккаунт</span>
                      )}
                      {account.blocks.coin_blocked && (
                        <span className="block-badge coin">COIN</span>
                      )}
                      {account.blocks.token_blocked && (
                        <span className="block-badge token">TOKEN</span>
                      )}
                      {!hasAnyBlock(account.blocks) && (
                        <span className="no-block">Активен</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      <button 
                        className="action-btn view"
                        onClick={() => fetchAccountDetail(account.user_id)}
                        title="Подробнее"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="action-btn block"
                        onClick={() => openBlockModal(account)}
                        disabled={actionLoading === account.user_id}
                        title="Настроить блокировку"
                      >
                        <Shield size={16} />
                      </button>
                      {hasAnyBlock(account.blocks) && (
                        <button 
                          className="action-btn unblock"
                          onClick={() => unblockAll(account.user_id)}
                          disabled={actionLoading === account.user_id}
                          title="Снять все блокировки"
                        >
                          <Unlock size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Block Modal */}
      {showBlockModal && selectedAccount && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Управление блокировкой</h3>
              <button className="close-btn" onClick={() => setShowBlockModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="user-card">
                <span className="name">{selectedAccount.first_name} {selectedAccount.last_name}</span>
                <span className="email">{selectedAccount.email}</span>
              </div>

              <div className="block-options">
                <label className="block-option">
                  <input
                    type="checkbox"
                    checked={blockForm.block_account}
                    onChange={(e) => setBlockForm({ ...blockForm, block_account: e.target.checked })}
                  />
                  <div className="option-content">
                    <ShieldOff size={20} />
                    <div>
                      <span className="option-title">Заблокировать аккаунт</span>
                      <span className="option-desc">Полная блокировка ALTYN операций</span>
                    </div>
                  </div>
                </label>

                <label className="block-option">
                  <input
                    type="checkbox"
                    checked={blockForm.block_coin}
                    onChange={(e) => setBlockForm({ ...blockForm, block_coin: e.target.checked })}
                  />
                  <div className="option-content">
                    <Coins size={20} />
                    <div>
                      <span className="option-title">Заблокировать ALTYN COIN</span>
                      <span className="option-desc">Запретить операции с COIN</span>
                    </div>
                  </div>
                </label>

                <label className="block-option">
                  <input
                    type="checkbox"
                    checked={blockForm.block_token}
                    onChange={(e) => setBlockForm({ ...blockForm, block_token: e.target.checked })}
                  />
                  <div className="option-content">
                    <TrendingUp size={20} />
                    <div>
                      <span className="option-title">Заблокировать ALTYN TOKEN</span>
                      <span className="option-desc">Запретить операции с TOKEN</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="form-group">
                <label>Причина блокировки</label>
                <textarea
                  value={blockForm.reason}
                  onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })}
                  rows={3}
                  placeholder="Укажите причину (опционально)..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowBlockModal(false)}>
                Отмена
              </button>
              <button 
                className="save-btn"
                onClick={handleBlockSubmit}
                disabled={actionLoading === selectedAccount.user_id}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && accountDetail && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Детали аккаунта</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-content">
              <div className="detail-section">
                <h4>Пользователь</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Имя:</span>
                    <span className="value">{accountDetail.user.first_name} {accountDetail.user.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{accountDetail.user.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Регистрация:</span>
                    <span className="value">{formatDate(accountDetail.user.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Кошелёк</h4>
                {accountDetail.wallet ? (
                  <div className="wallet-balances">
                    <div className="balance-card coin">
                      <Coins size={24} />
                      <div>
                        <span className="balance-value">{formatNumber(accountDetail.wallet.coin_balance)}</span>
                        <span className="balance-label">ALTYN COIN</span>
                      </div>
                    </div>
                    <div className="balance-card token">
                      <TrendingUp size={24} />
                      <div>
                        <span className="balance-value">{formatNumber(accountDetail.wallet.token_balance)}</span>
                        <span className="balance-label">ALTYN TOKEN</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="no-wallet">Кошелёк не создан</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Статус блокировки</h4>
                <div className="block-detail">
                  <div className={`block-item ${accountDetail.blocks.account_blocked ? 'blocked' : ''}`}>
                    <ShieldOff size={18} />
                    <span>Аккаунт: {accountDetail.blocks.account_blocked ? 'Заблокирован' : 'Активен'}</span>
                  </div>
                  <div className={`block-item ${accountDetail.blocks.coin_blocked ? 'blocked' : ''}`}>
                    <Coins size={18} />
                    <span>COIN: {accountDetail.blocks.coin_blocked ? 'Заблокирован' : 'Активен'}</span>
                  </div>
                  <div className={`block-item ${accountDetail.blocks.token_blocked ? 'blocked' : ''}`}>
                    <TrendingUp size={18} />
                    <span>TOKEN: {accountDetail.blocks.token_blocked ? 'Заблокирован' : 'Активен'}</span>
                  </div>
                </div>
              </div>

              {accountDetail.recent_transactions && accountDetail.recent_transactions.length > 0 && (
                <div className="detail-section">
                  <h4>Последние транзакции</h4>
                  <div className="transactions-list">
                    {accountDetail.recent_transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="tx-item">
                        <span className="tx-type">{tx.transaction_type}</span>
                        <span className="tx-amount">{formatNumber(tx.amount)} {tx.asset_type}</span>
                        <span className="tx-date">{formatDate(tx.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowDetailModal(false)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-altyn-accounts {
          padding: 24px;
        }

        .section-header {
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

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f8fafc;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .message.error {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .message.success {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.blocked { background: #EF4444; }
        .stat-icon.coin { background: #F59E0B; }
        .stat-icon.token { background: #8B5CF6; }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
        }

        .filters {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-bottom: 20px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          flex: 1;
          max-width: 500px;
        }

        .search-box input {
          flex: 1;
          padding: 12px 0;
          border: none;
          outline: none;
          font-size: 14px;
        }

        .search-btn {
          padding: 8px 16px;
          background: var(--module-color);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .checkbox-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
        }

        .checkbox-filter input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .loading, .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          color: #64748b;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .table-container {
          overflow-x: auto;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }

        .accounts-table {
          width: 100%;
          border-collapse: collapse;
        }

        .accounts-table th,
        .accounts-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .accounts-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
        }

        .accounts-table tr:last-child td {
          border-bottom: none;
        }

        .accounts-table tr.blocked-row {
          background: #fef2f2;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: #1e293b;
        }

        .user-email {
          font-size: 12px;
          color: #64748b;
        }

        .balance {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }

        .balance.blocked {
          color: #ef4444;
          text-decoration: line-through;
        }

        .lock-icon {
          color: #ef4444;
        }

        .block-status {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .block-badge {
          padding: 4px 10px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
        }

        .block-badge.account {
          background: #fef2f2;
          color: #dc2626;
        }

        .block-badge.coin {
          background: #fef3c7;
          color: #d97706;
        }

        .block-badge.token {
          background: #ede9fe;
          color: #7c3aed;
        }

        .no-block {
          color: #10b981;
          font-size: 13px;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.view {
          background: #f1f5f9;
          color: #64748b;
        }

        .action-btn.view:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .action-btn.block {
          background: #fef3c7;
          color: #d97706;
        }

        .action-btn.block:hover:not(:disabled) {
          background: #fde68a;
        }

        .action-btn.unblock {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.unblock:hover:not(:disabled) {
          background: #a7f3d0;
        }

        /* Modals */
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
        }

        .modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal.large {
          max-width: 700px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          padding: 4px;
        }

        .modal-content {
          padding: 24px;
        }

        .user-card {
          display: flex;
          flex-direction: column;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .user-card .name {
          font-weight: 600;
          font-size: 16px;
        }

        .user-card .email {
          color: #64748b;
          font-size: 14px;
        }

        .block-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .block-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f8fafc;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .block-option:hover {
          background: #f1f5f9;
        }

        .block-option input {
          width: 20px;
          height: 20px;
        }

        .block-option input:checked + .option-content {
          color: #dc2626;
        }

        .option-content {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .option-title {
          display: block;
          font-weight: 500;
        }

        .option-desc {
          display: block;
          font-size: 12px;
          color: #64748b;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }

        .save-btn {
          padding: 10px 24px;
          background: var(--module-color);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Detail Modal Styles */
        .detail-section {
          margin-bottom: 24px;
        }

        .detail-section h4 {
          margin: 0 0 12px;
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-grid {
          display: grid;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .detail-item .label {
          color: #64748b;
        }

        .detail-item .value {
          font-weight: 500;
        }

        .wallet-balances {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .balance-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 12px;
        }

        .balance-card.coin {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
        }

        .balance-card.token {
          background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
          color: #5b21b6;
        }

        .balance-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
        }

        .balance-label {
          display: block;
          font-size: 12px;
          opacity: 0.8;
        }

        .block-detail {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .block-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          background: #f0fdf4;
          border-radius: 8px;
          color: #16a34a;
        }

        .block-item.blocked {
          background: #fef2f2;
          color: #dc2626;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tx-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 13px;
        }

        .tx-type {
          font-weight: 500;
        }

        .tx-date {
          color: #64748b;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filters {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .wallet-balances {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAltynAccounts;
