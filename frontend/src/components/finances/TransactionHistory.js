/**
 * TransactionHistory Component
 * Shows list of user's financial transactions
 */
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownLeft, Coins, TrendingUp, Gift, 
  ShoppingBag, RefreshCw, Filter, ChevronDown
} from 'lucide-react';

const TransactionHistory = ({ limit = 50, compact = false, moduleColor = '#A16207' }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/finance/transactions?limit=${limit}`;
      if (filter !== 'all') {
        url += `&asset_type=${filter}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filter, limit]);

  const getTransactionIcon = (tx) => {
    switch (tx.transaction_type) {
      case 'DIVIDEND':
        return <Gift size={18} />;
      case 'PAYMENT':
        return <ShoppingBag size={18} />;
      default:
        return tx.asset_type === 'COIN' ? <Coins size={18} /> : <TrendingUp size={18} />;
    }
  };

  const getTransactionColor = (tx) => {
    if (tx.transaction_type === 'DIVIDEND') return '#10B981';
    if (tx.transaction_type === 'WELCOME_BONUS') return '#8B5CF6';
    if (tx.is_incoming) return '#10B981';
    return '#EF4444';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionLabel = (tx) => {
    switch (tx.transaction_type) {
      case 'TRANSFER':
        return tx.is_incoming ? 'Получен перевод' : 'Отправлен перевод';
      case 'PAYMENT':
        return tx.is_incoming ? 'Получена оплата' : 'Оплата покупки';
      case 'DIVIDEND':
        return 'Дивиденды';
      case 'WELCOME_BONUS':
        return 'Приветственный бонус';
      case 'EMISSION':
        return 'Эмиссия';
      default:
        return 'Транзакция';
    }
  };

  if (loading) {
    return (
      <div className="transactions-loading">
        <RefreshCw size={24} className="spin" />
        <span>Загрузка транзакций...</span>
      </div>
    );
  }

  return (
    <div className={`transaction-history ${compact ? 'compact' : ''}`} style={{ '--module-color': moduleColor }}>
      {!compact && (
        <div className="history-header">
          <h3>История транзакций</h3>
          <div className="filter-dropdown">
            <button 
              className="filter-btn"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter size={16} />
              {filter === 'all' ? 'Все' : filter === 'COIN' ? 'Монеты' : 'Токены'}
              <ChevronDown size={16} />
            </button>
            {showFilter && (
              <div className="filter-menu">
                <button onClick={() => { setFilter('all'); setShowFilter(false); }}>Все</button>
                <button onClick={() => { setFilter('COIN'); setShowFilter(false); }}>Только COIN</button>
                <button onClick={() => { setFilter('TOKEN'); setShowFilter(false); }}>Только TOKEN</button>
              </div>
            )}
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="empty-state">
          <Coins size={48} />
          <p>Нет транзакций</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div 
                className="tx-icon"
                style={{ 
                  background: `${getTransactionColor(tx)}15`,
                  color: getTransactionColor(tx)
                }}
              >
                {tx.is_incoming ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              
              <div className="tx-details">
                <div className="tx-label">{getTransactionLabel(tx)}</div>
                <div className="tx-party">
                  {tx.is_incoming ? `От: ${tx.from_user_name}` : `Кому: ${tx.to_user_name}`}
                </div>
                {tx.description && <div className="tx-description">{tx.description}</div>}
              </div>
              
              <div className="tx-amount-section">
                <div 
                  className="tx-amount"
                  style={{ color: getTransactionColor(tx) }}
                >
                  {tx.is_incoming ? '+' : '-'}{tx.amount.toLocaleString('ru-RU')} 
                  <span className="asset-type">{tx.asset_type === 'COIN' ? 'AC' : 'AT'}</span>
                </div>
                {tx.fee_amount > 0 && (
                  <div className="tx-fee">Комиссия: {tx.fee_amount.toFixed(2)} AC</div>
                )}
                <div className="tx-date">{formatDate(tx.created_at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .transaction-history {
          width: 100%;
        }

        .transactions-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 40px;
          color: #64748b;
        }

        .transactions-loading .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .history-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .filter-dropdown {
          position: relative;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: #f1f5f9;
        }

        .filter-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 10;
          overflow: hidden;
        }

        .filter-menu button {
          display: block;
          width: 100%;
          padding: 10px 16px;
          background: none;
          border: none;
          text-align: left;
          font-size: 14px;
          color: #475569;
          cursor: pointer;
          transition: background 0.2s;
        }

        .filter-menu button:hover {
          background: #f8fafc;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: #94a3b8;
        }

        .empty-state p {
          margin: 12px 0 0 0;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: #fafafa;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .compact .transaction-item {
          padding: 12px;
          gap: 12px;
        }

        .transaction-item:hover {
          background: #f1f5f9;
        }

        .tx-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .compact .tx-icon {
          width: 36px;
          height: 36px;
        }

        .tx-details {
          flex: 1;
          min-width: 0;
        }

        .tx-label {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .tx-party {
          font-size: 13px;
          color: #64748b;
          margin-top: 2px;
        }

        .tx-description {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tx-amount-section {
          text-align: right;
          flex-shrink: 0;
        }

        .tx-amount {
          font-size: 16px;
          font-weight: 600;
        }

        .compact .tx-amount {
          font-size: 14px;
        }

        .asset-type {
          font-size: 12px;
          font-weight: 500;
          margin-left: 4px;
          opacity: 0.8;
        }

        .tx-fee {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .tx-date {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default TransactionHistory;
