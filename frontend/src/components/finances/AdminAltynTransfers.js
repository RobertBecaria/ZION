/**
 * AdminAltynTransfers Component
 * Admin panel for managing ALTYN TOKEN transfers from Ethereum
 */
import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Settings, Users, CheckCircle, XCircle, 
  RefreshCw, Search, Edit3, Trash2, AlertTriangle, 
  Shield, Clock, ExternalLink, Eye, ChevronDown, Save
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AdminAltynTransfers = ({ moduleColor = '#A16207' }) => {
  const [activeTab, setActiveTab] = useState('transfers');
  const [settings, setSettings] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editData, setEditData] = useState({});
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchSettings();
    fetchTransfers();
  }, [statusFilter]);

  const getAdminToken = () => localStorage.getItem('admin_token');

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-transfer-settings`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('transfer_status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-transfers?${params}`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setTransfers(data.transfers);
      }
    } catch (err) {
      console.error('Error fetching transfers:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates) => {
    setActionLoading('settings');
    try {
      const params = new URLSearchParams(updates);
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-transfer-settings?${params}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
        showSuccess('Настройки обновлены');
      } else {
        throw new Error(data.detail || 'Ошибка обновления');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const approveTransfer = async (transferId) => {
    setActionLoading(transferId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-transfers/${transferId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        showSuccess(`Заявка одобрена. Выпущено ${data.transaction.amount} AT`);
        fetchTransfers();
        fetchSettings();
      } else {
        throw new Error(data.detail || 'Ошибка одобрения');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const rejectTransfer = async () => {
    if (!selectedTransfer || !rejectReason.trim()) return;
    
    setActionLoading(selectedTransfer.id);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/admin/finance/altyn-transfers/${selectedTransfer.id}/reject?reason=${encodeURIComponent(rejectReason)}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess('Заявка отклонена');
        setShowRejectModal(false);
        setSelectedTransfer(null);
        setRejectReason('');
        fetchTransfers();
      } else {
        throw new Error(data.detail || 'Ошибка отклонения');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const updateTransfer = async () => {
    if (!selectedTransfer) return;

    setActionLoading(selectedTransfer.id);
    try {
      const params = new URLSearchParams();
      if (editData.amount_to_issue) params.append('amount_to_issue', editData.amount_to_issue);
      if (editData.admin_notes) params.append('admin_notes', editData.admin_notes);

      const response = await fetch(
        `${BACKEND_URL}/api/admin/finance/altyn-transfers/${selectedTransfer.id}?${params}`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${getAdminToken()}` }
        }
      );
      const data = await response.json();
      if (data.success) {
        showSuccess('Заявка обновлена');
        setShowEditModal(false);
        setSelectedTransfer(null);
        fetchTransfers();
      } else {
        throw new Error(data.detail || 'Ошибка обновления');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTransfer = async (transferId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    setActionLoading(transferId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/finance/altyn-transfers/${transferId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
      });
      const data = await response.json();
      if (data.success) {
        showSuccess('Заявка удалена');
        fetchTransfers();
      } else {
        throw new Error(data.detail || 'Ошибка удаления');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 6 }).format(num);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: config.bg,
        color: config.color
      }}>
        {config.text}
      </span>
    );
  };

  const openEditModal = (transfer) => {
    setSelectedTransfer(transfer);
    setEditData({
      amount_to_issue: transfer.amount_to_issue,
      admin_notes: transfer.admin_notes || ''
    });
    setShowEditModal(true);
  };

  const openRejectModal = (transfer) => {
    setSelectedTransfer(transfer);
    setRejectReason('');
    setShowRejectModal(true);
  };

  return (
    <div className="admin-altyn-transfers" style={{ '--module-color': moduleColor }}>
      {/* Header */}
      <div className="section-header">
        <div className="header-title">
          <ArrowRightLeft size={24} style={{ color: moduleColor }} />
          <h2>Управление ALTYN Transfer</h2>
        </div>
        <button className="refresh-btn" onClick={() => { fetchSettings(); fetchTransfers(); }}>
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

      {/* Statistics Cards */}
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: moduleColor }}>
              <ArrowRightLeft size={20} color="white" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{statistics.total_transfers}</span>
              <span className="stat-label">Всего заявок</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10B981' }}>
              <CheckCircle size={20} color="white" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{statistics.completed_transfers}</span>
              <span className="stat-label">Завершено</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F59E0B' }}>
              <Clock size={20} color="white" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{statistics.pending_transfers}</span>
              <span className="stat-label">Ожидают</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#8B5CF6' }}>
              <Shield size={20} color="white" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{formatNumber(statistics.total_tokens_issued)}</span>
              <span className="stat-label">Выпущено AT</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'transfers' ? 'active' : ''}`}
          onClick={() => setActiveTab('transfers')}
        >
          <ArrowRightLeft size={18} />
          Заявки на перенос
        </button>
        <button 
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} />
          Настройки
        </button>
      </div>

      {/* Transfers Tab */}
      {activeTab === 'transfers' && (
        <div className="transfers-section">
          {/* Filters */}
          <div className="filters">
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Поиск по адресу кошелька..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransfers()}
              />
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="VERIFIED">Проверено</option>
              <option value="COMPLETED">Завершено</option>
              <option value="REJECTED">Отклонено</option>
            </select>
          </div>

          {/* Transfers Table */}
          {loading ? (
            <div className="loading">
              <RefreshCw size={24} className="spin" />
              <span>Загрузка...</span>
            </div>
          ) : transfers.length === 0 ? (
            <div className="no-data">
              <ArrowRightLeft size={48} color="#cbd5e1" />
              <p>Нет заявок на перенос</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="transfers-table">
                <thead>
                  <tr>
                    <th>Пользователь</th>
                    <th>ETH Кошелёк</th>
                    <th>Баланс ETH</th>
                    <th>К выдаче</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id}>
                      <td>
                        <div className="user-info">
                          <span className="user-name">{transfer.user_name}</span>
                          <span className="user-email">{transfer.user_email}</span>
                        </div>
                      </td>
                      <td>
                        <a 
                          href={`https://etherscan.io/address/${transfer.eth_wallet_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="wallet-link"
                        >
                          {transfer.eth_wallet_address.slice(0, 10)}...{transfer.eth_wallet_address.slice(-8)}
                          <ExternalLink size={12} />
                        </a>
                      </td>
                      <td>{formatNumber(transfer.token_balance_eth)} AT</td>
                      <td className="amount-cell">{formatNumber(transfer.amount_to_issue)} AT</td>
                      <td>{getStatusBadge(transfer.status)}</td>
                      <td className="date-cell">{formatDate(transfer.created_at)}</td>
                      <td>
                        <div className="actions">
                          {(transfer.status === 'PENDING' || transfer.status === 'VERIFIED') && (
                            <>
                              <button 
                                className="action-btn approve"
                                onClick={() => approveTransfer(transfer.id)}
                                disabled={actionLoading === transfer.id}
                                title="Одобрить"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button 
                                className="action-btn reject"
                                onClick={() => openRejectModal(transfer)}
                                disabled={actionLoading === transfer.id}
                                title="Отклонить"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {transfer.status !== 'COMPLETED' && (
                            <>
                              <button 
                                className="action-btn edit"
                                onClick={() => openEditModal(transfer)}
                                disabled={actionLoading === transfer.id}
                                title="Редактировать"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="action-btn delete"
                                onClick={() => deleteTransfer(transfer.id)}
                                disabled={actionLoading === transfer.id}
                                title="Удалить"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {transfer.status === 'COMPLETED' && (
                            <span className="completed-label">Обработано</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && settings && (
        <div className="settings-section">
          <div className="settings-card">
            <h3>Основные настройки</h3>
            
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Функция переноса</span>
                <span className="setting-desc">Включить или отключить функцию для всех пользователей</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                  disabled={actionLoading === 'settings'}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Режим работы</span>
                <span className="setting-desc">
                  {settings.mode === 'AUTOMATIC' 
                    ? 'Токены выдаются автоматически после верификации'
                    : 'Каждая заявка требует одобрения администратора'}
                </span>
              </div>
              <select
                value={settings.mode}
                onChange={(e) => updateSettings({ mode: e.target.value })}
                disabled={actionLoading === 'settings'}
                className="mode-select"
              >
                <option value="AUTOMATIC">Автоматический</option>
                <option value="MODERATION">Модерация</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Требовать подпись</span>
                <span className="setting-desc">Криптографическая подпись для подтверждения владения кошельком</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.require_signature}
                  onChange={(e) => updateSettings({ require_signature: e.target.checked })}
                  disabled={actionLoading === 'settings'}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-label">Доступ к функции</span>
                <span className="setting-desc">Кто может использовать функцию переноса</span>
              </div>
              <select
                value={settings.access_mode}
                onChange={(e) => updateSettings({ access_mode: e.target.value })}
                disabled={actionLoading === 'settings'}
                className="mode-select"
              >
                <option value="everyone">Все пользователи</option>
                <option value="selected">Только выбранные</option>
              </select>
            </div>
          </div>

          <div className="settings-card">
            <h3>Информация о контракте</h3>
            <div className="contract-info">
              <div className="info-row">
                <span className="label">ALTYN TOKEN Contract:</span>
                <a 
                  href="https://etherscan.io/token/0x095d7847945c6a496cad77bff0687a1bf367ec4a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contract-link"
                >
                  0x095d7847945c6a496cad77bff0687a1bf367ec4a
                  <ExternalLink size={14} />
                </a>
              </div>
              <div className="info-row">
                <span className="label">Etherscan API:</span>
                <span className="value">Подключено</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTransfer && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редактирование заявки</h3>
            
            <div className="modal-content">
              <div className="form-group">
                <label>ETH Кошелёк</label>
                <input type="text" value={selectedTransfer.eth_wallet_address} disabled />
              </div>
              
              <div className="form-group">
                <label>Баланс на ETH</label>
                <input type="text" value={`${formatNumber(selectedTransfer.token_balance_eth)} AT`} disabled />
              </div>
              
              <div className="form-group">
                <label>Сумма к выдаче (AT)</label>
                <input
                  type="number"
                  value={editData.amount_to_issue}
                  onChange={(e) => setEditData({ ...editData, amount_to_issue: e.target.value })}
                  step="0.000001"
                />
              </div>
              
              <div className="form-group">
                <label>Заметки администратора</label>
                <textarea
                  value={editData.admin_notes}
                  onChange={(e) => setEditData({ ...editData, admin_notes: e.target.value })}
                  rows={3}
                  placeholder="Добавить заметку..."
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowEditModal(false)}>
                Отмена
              </button>
              <button 
                className="save-btn" 
                onClick={updateTransfer}
                disabled={actionLoading === selectedTransfer.id}
              >
                <Save size={16} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTransfer && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Отклонение заявки</h3>
            
            <div className="modal-content">
              <p>Вы собираетесь отклонить заявку от {selectedTransfer.user_name}</p>
              
              <div className="form-group">
                <label>Причина отклонения *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Укажите причину отклонения..."
                  required
                />
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowRejectModal(false)}>
                Отмена
              </button>
              <button 
                className="reject-btn" 
                onClick={rejectTransfer}
                disabled={!rejectReason.trim() || actionLoading === selectedTransfer.id}
              >
                <XCircle size={16} />
                Отклонить
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-altyn-transfers {
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
          font-size: 14px;
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 16px;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          color: #64748b;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #f8fafc;
        }

        .tab.active {
          background: var(--module-color);
          color: white;
          border-color: var(--module-color);
        }

        .filters {
          display: flex;
          gap: 16px;
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
          max-width: 400px;
        }

        .search-box input {
          flex: 1;
          padding: 12px 0;
          border: none;
          outline: none;
          font-size: 14px;
        }

        .status-filter {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
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

        .no-data p {
          margin-top: 16px;
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

        .transfers-table {
          width: 100%;
          border-collapse: collapse;
        }

        .transfers-table th,
        .transfers-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .transfers-table th {
          background: #f8fafc;
          font-weight: 600;
          font-size: 13px;
          color: #64748b;
        }

        .transfers-table tr:last-child td {
          border-bottom: none;
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

        .wallet-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--module-color);
          text-decoration: none;
          font-family: monospace;
          font-size: 13px;
        }

        .wallet-link:hover {
          text-decoration: underline;
        }

        .amount-cell {
          font-weight: 600;
          color: var(--module-color);
        }

        .date-cell {
          font-size: 13px;
          color: #64748b;
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

        .action-btn.approve {
          background: #d1fae5;
          color: #059669;
        }

        .action-btn.approve:hover:not(:disabled) {
          background: #a7f3d0;
        }

        .action-btn.reject {
          background: #fee2e2;
          color: #dc2626;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: #fecaca;
        }

        .action-btn.edit {
          background: #dbeafe;
          color: #2563eb;
        }

        .action-btn.edit:hover:not(:disabled) {
          background: #bfdbfe;
        }

        .action-btn.delete {
          background: #f1f5f9;
          color: #64748b;
        }

        .action-btn.delete:hover:not(:disabled) {
          background: #e2e8f0;
        }

        .completed-label {
          font-size: 12px;
          color: #10b981;
          font-weight: 500;
        }

        .settings-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 24px;
        }

        .settings-card h3 {
          margin: 0 0 20px;
          font-size: 16px;
          font-weight: 600;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-label {
          font-weight: 500;
          color: #1e293b;
        }

        .setting-desc {
          font-size: 13px;
          color: #64748b;
        }

        .toggle-switch {
          position: relative;
          width: 52px;
          height: 28px;
        }

        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          border-radius: 28px;
          transition: 0.3s;
        }

        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 20px;
          width: 20px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .toggle-switch input:checked + .toggle-slider {
          background-color: var(--module-color);
        }

        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }

        .mode-select {
          padding: 10px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          min-width: 180px;
        }

        .contract-info .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
        }

        .contract-info .label {
          color: #64748b;
        }

        .contract-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--module-color);
          text-decoration: none;
          font-family: monospace;
          font-size: 13px;
        }

        .contract-link:hover {
          text-decoration: underline;
        }

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
          padding: 24px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal h3 {
          margin: 0 0 20px;
          font-size: 18px;
        }

        .modal-content {
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #374151;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
        }

        .form-group input:disabled {
          background: #f8fafc;
          color: #64748b;
        }

        .form-group textarea {
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .cancel-btn {
          padding: 10px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
        }

        .save-btn, .reject-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: white;
        }

        .save-btn {
          background: var(--module-color);
        }

        .reject-btn {
          background: #dc2626;
        }

        .save-btn:disabled, .reject-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .admin-altyn-transfers {
            padding: 16px;
          }

          .filters {
            flex-direction: column;
          }

          .search-box {
            max-width: none;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminAltynTransfers;
