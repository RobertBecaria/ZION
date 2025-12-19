/**
 * ExchangeRates Component
 * Shows current exchange rates for ALTYN COIN
 */
import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, TrendingUp, Globe } from 'lucide-react';

const ExchangeRates = ({ moduleColor = '#A16207' }) => {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversionAmount, setConversionAmount] = useState(100);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/finance/exchange-rates`);
      
      if (response.ok) {
        const data = await response.json();
        setRates(data.rates);
      }
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const formatCurrency = (amount, currency) => {
    const symbols = {
      USD: '$',
      RUB: '₽',
      KZT: '₸'
    };
    return `${symbols[currency] || ''}${amount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="exchange-rates loading">
        <RefreshCw size={24} className="spin" />
        <span>Загрузка курсов...</span>
      </div>
    );
  }

  return (
    <div className="exchange-rates" style={{ '--module-color': moduleColor }}>
      <div className="rates-header">
        <h3><Globe size={20} /> Курсы валют</h3>
        <button className="refresh-btn" onClick={fetchRates}>
          <RefreshCw size={16} />
          Обновить
        </button>
      </div>

      {/* Base Rate Info */}
      <div className="base-rate-card">
        <div className="rate-icon" style={{ background: `linear-gradient(135deg, ${moduleColor} 0%, ${moduleColor}dd 100%)` }}>
          <DollarSign size={28} />
        </div>
        <div className="rate-info">
          <span className="rate-label">1 ALTYN COIN (AC)</span>
          <span className="rate-value">= 1 USD</span>
          <span className="rate-note">Стейблкоин, привязан к доллару США</span>
        </div>
      </div>

      {/* Exchange Rates Table */}
      <div className="rates-table">
        <div className="rate-row header">
          <span>Валюта</span>
          <span>Курс к 1 AC</span>
          <span>1000 AC</span>
        </div>
        
        <div className="rate-row">
          <div className="currency">
            <span className="flag">🇺🇸</span>
            <span className="name">US Dollar</span>
            <span className="code">USD</span>
          </div>
          <span className="rate">{formatCurrency(rates?.USD || 1, 'USD')}</span>
          <span className="amount">{formatCurrency(1000 * (rates?.USD || 1), 'USD')}</span>
        </div>

        <div className="rate-row">
          <div className="currency">
            <span className="flag">🇷🇺</span>
            <span className="name">Russian Ruble</span>
            <span className="code">RUB</span>
          </div>
          <span className="rate">{formatCurrency(rates?.RUB || 90, 'RUB')}</span>
          <span className="amount">{formatCurrency(1000 * (rates?.RUB || 90), 'RUB')}</span>
        </div>

        <div className="rate-row">
          <div className="currency">
            <span className="flag">🇰🇿</span>
            <span className="name">Kazakh Tenge</span>
            <span className="code">KZT</span>
          </div>
          <span className="rate">{formatCurrency(rates?.KZT || 450, 'KZT')}</span>
          <span className="amount">{formatCurrency(1000 * (rates?.KZT || 450), 'KZT')}</span>
        </div>
      </div>

      {/* Currency Converter */}
      <div className="converter-section">
        <h4>💱 Конвертер валют</h4>
        <div className="converter">
          <div className="input-group">
            <label>ALTYN COIN (AC)</label>
            <input
              type="number"
              value={conversionAmount}
              onChange={(e) => setConversionAmount(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
          
          <div className="conversions">
            <div className="conversion-result">
              <span className="result-label">🇺🇸 USD</span>
              <span className="result-value">{formatCurrency(conversionAmount * (rates?.USD || 1), 'USD')}</span>
            </div>
            <div className="conversion-result">
              <span className="result-label">🇷🇺 RUB</span>
              <span className="result-value">{formatCurrency(conversionAmount * (rates?.RUB || 90), 'RUB')}</span>
            </div>
            <div className="conversion-result">
              <span className="result-label">🇰🇿 KZT</span>
              <span className="result-value">{formatCurrency(conversionAmount * (rates?.KZT || 450), 'KZT')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="info-note">
        <TrendingUp size={16} />
        <p>
          Курсы обновляются автоматически каждый час через ExchangeRate.host API. 
          ALTYN COIN — это стейблкоин платформы ZION.CITY, привязанный к курсу USD 1:1.
        </p>
      </div>

      <style jsx>{`
        .exchange-rates {
          padding: 0;
        }

        .exchange-rates.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 60px;
          color: #64748b;
        }

        .exchange-rates.loading .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .rates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .rates-header h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .refresh-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 13px;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: #f1f5f9;
          color: var(--module-color);
        }

        .base-rate-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: linear-gradient(135deg, ${moduleColor}10 0%, ${moduleColor}05 100%);
          border: 1px solid ${moduleColor}30;
          border-radius: 16px;
          margin-bottom: 24px;
        }

        .rate-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .rate-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rate-label {
          font-size: 14px;
          color: #64748b;
        }

        .rate-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
        }

        .rate-note {
          font-size: 13px;
          color: var(--module-color);
        }

        .rates-table {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .rate-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          padding: 16px 20px;
          align-items: center;
        }

        .rate-row.header {
          background: #e2e8f0;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .rate-row:not(.header) {
          border-bottom: 1px solid #e2e8f0;
        }

        .rate-row:last-child {
          border-bottom: none;
        }

        .currency {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .flag {
          font-size: 24px;
        }

        .name {
          font-weight: 500;
          color: #1e293b;
        }

        .code {
          font-size: 12px;
          color: #64748b;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: auto;
          margin-right: 12px;
        }

        .rate {
          font-weight: 600;
          color: #1e293b;
        }

        .amount {
          font-weight: 500;
          color: #64748b;
        }

        .converter-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .converter-section h4 {
          margin: 0 0 16px 0;
          font-size: 15px;
          color: #1e293b;
        }

        .converter {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }

        @media (max-width: 640px) {
          .converter {
            flex-direction: column;
          }
        }

        .input-group {
          flex: 1;
        }

        .input-group label {
          display: block;
          font-size: 13px;
          color: #64748b;
          margin-bottom: 8px;
        }

        .input-group input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--module-color);
        }

        .conversions {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .conversion-result {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: white;
          border-radius: 10px;
        }

        .result-label {
          font-size: 14px;
          color: #64748b;
        }

        .result-value {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }

        .info-note {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 10px;
          color: #1E40AF;
        }

        .info-note p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default ExchangeRates;
