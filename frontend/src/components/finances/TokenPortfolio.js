/**
 * TokenPortfolio Component
 * Shows user's TOKEN holdings and dividend information
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Gift, PieChart, Award, RefreshCw } from 'lucide-react';

const TokenPortfolio = ({ wallet, portfolio, moduleColor = '#A16207' }) => {
  const [tokenHolders, setTokenHolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTokenHolders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/token-holders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTokenHolders(data.holders || []);
      }
    } catch (err) {
      console.error('Error fetching token holders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenHolders();
  }, []);

  const tokenBalance = wallet?.token_balance || 0;
  const tokenPercentage = wallet?.token_percentage || 0;
  const totalDividends = wallet?.total_dividends_received || 0;
  const pendingDividends = wallet?.pending_dividends || 0;

  const formatNumber = (num) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(2)}K`;
    }
    return num.toLocaleString('ru-RU');
  };

  return (
    <div className="token-portfolio" style={{ '--module-color': moduleColor }}>
      {/* Portfolio Summary */}
      <div className="portfolio-summary">
        <div className="summary-card main">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)' }}>
            <TrendingUp size={28} />
          </div>
          <div className="card-content">
            <span className="card-label">Ваши ALTYN TOKENS</span>
            <span className="card-value">{formatNumber(tokenBalance)}</span>
            <span className="card-subtitle">{tokenPercentage.toFixed(4)}% от всех токенов</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <Gift size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Всего дивидендов</span>
            <span className="card-value">{formatNumber(totalDividends)} AC</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="card-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <Award size={24} />
          </div>
          <div className="card-content">
            <span className="card-label">Ожидаемые дивиденды</span>
            <span className="card-value">{formatNumber(pendingDividends)} AC</span>
          </div>
        </div>
      </div>

      {/* Token Economics Info */}
      <div className="economics-section">
        <h3><PieChart size={20} /> Экономика ALTYN TOKEN</h3>
        <div className="economics-grid">
          <div className="econ-item">
            <span className="econ-label">Всего токенов</span>
            <span className="econ-value">35,000,000 AT</span>
          </div>
          <div className="econ-item">
            <span className="econ-label">Комиссия с транзакций</span>
            <span className="econ-value">0.1%</span>
          </div>
          <div className="econ-item">
            <span className="econ-label">Распределение дивидендов</span>
            <span className="econ-value">Ежедневно / По запросу</span>
          </div>
          <div className="econ-item">
            <span className="econ-label">Стоимость 1 ALTYN COIN</span>
            <span className="econ-value">= 1 USD</span>
          </div>
        </div>
      </div>

      {/* Token Holders Leaderboard */}
      <div className="holders-section">
        <h3><Users size={20} /> Топ держателей ALTYN TOKEN</h3>
        
        {loading ? (
          <div className="loading-state">
            <RefreshCw size={24} className="spin" />
            <span>Загрузка...</span>
          </div>
        ) : (
          <div className="holders-list">
            {tokenHolders.map((holder, index) => (
              <div key={holder.user_id} className="holder-item">
                <div className="holder-rank">#{index + 1}</div>
                <div className="holder-info">
                  <span className="holder-name">{holder.user_name}</span>
                  <span className="holder-percentage">{holder.percentage.toFixed(4)}%</span>
                </div>
                <div className="holder-balance">
                  <span className="balance-value">{formatNumber(holder.token_balance)}</span>
                  <span className="balance-label">AT</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dividend Calculation Example */}
      <div className="dividend-example">
        <h4>📊 Как рассчитываются дивиденды?</h4>
        <p>
          Каждая транзакция в ALTYN COIN взимает комиссию 0.1%. Эти комиссии 
          накапливаются в казначействе платформы и распределяются между держателями 
          ALTYN TOKEN пропорционально их доле владения.
        </p>
        <div className="example-calc">
          <div className="calc-row">
            <span>Ваша доля токенов:</span>
            <span>{tokenPercentage.toFixed(4)}%</span>
          </div>
          <div className="calc-row">
            <span>При распределении 10,000 AC:</span>
            <span>Вы получите {(10000 * tokenPercentage / 100).toFixed(2)} AC</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .token-portfolio {
          padding: 0;
        }

        .portfolio-summary {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .portfolio-summary {
            grid-template-columns: 1fr;
          }
        }

        .summary-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
        }

        .summary-card.main {
          background: linear-gradient(135deg, #8B5CF610 0%, #6D28D915 100%);
          border: 1px solid #8B5CF630;
        }

        .card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-label {
          font-size: 13px;
          color: #64748b;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .card-subtitle {
          font-size: 13px;
          color: #8B5CF6;
          font-weight: 500;
        }

        .economics-section, .holders-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .economics-section h3, .holders-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .economics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .econ-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .econ-label {
          font-size: 13px;
          color: #64748b;
        }

        .econ-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 32px;
          color: #64748b;
        }

        .loading-state .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .holders-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .holder-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: white;
          border-radius: 10px;
        }

        .holder-rank {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
        }

        .holder-item:nth-child(1) .holder-rank {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        }

        .holder-item:nth-child(2) .holder-rank {
          background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%);
        }

        .holder-item:nth-child(3) .holder-rank {
          background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
        }

        .holder-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .holder-name {
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
        }

        .holder-percentage {
          font-size: 12px;
          color: #8B5CF6;
        }

        .holder-balance {
          text-align: right;
        }

        .balance-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .balance-label {
          font-size: 12px;
          color: #64748b;
          margin-left: 4px;
        }

        .dividend-example {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 12px;
          padding: 20px;
        }

        .dividend-example h4 {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: #92400E;
        }

        .dividend-example p {
          margin: 0 0 16px 0;
          font-size: 14px;
          color: #78350F;
          line-height: 1.6;
        }

        .example-calc {
          background: white;
          border-radius: 8px;
          padding: 12px 16px;
        }

        .calc-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          color: #78350F;
        }

        .calc-row:not(:last-child) {
          border-bottom: 1px solid #FDE68A;
        }

        .calc-row span:last-child {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default TokenPortfolio;
