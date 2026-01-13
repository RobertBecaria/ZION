import React from 'react';

const EventPaymentModal = ({
  event,
  selectedTicket,
  wallet,
  processing,
  receipt,
  moduleColor,
  onClose,
  onPurchase
}) => {
  if (!selectedTicket) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={() => !receipt && onClose()}>
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%'
        }}
        onClick={e => e.stopPropagation()}
      >
        {receipt ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ margin: '0 0 8px 0' }}>Оплата успешна!</h3>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Билет куплен</p>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>КВИТАНЦИЯ</p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>Мероприятие: {event.title}</p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>Билет: {selectedTicket.name}</p>
              <p style={{ margin: '4px 0', fontSize: '13px' }}>Сумма: {receipt.total_paid} AC</p>
              <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748b' }}>№ {receipt.receipt_id?.slice(0, 8).toUpperCase()}</p>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: moduleColor,
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Отлично!
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ margin: '0 0 16px 0' }}>Оплата ALTYN COIN</h3>
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>{event.title}</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#64748b' }}>Билет: {selectedTicket.name}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <span>Сумма:</span>
                <span style={{ fontWeight: '700', color: '#F59E0B' }}>{selectedTicket.altyn_price} AC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                <span>Комиссия (0.1%):</span>
                <span>{(selectedTicket.altyn_price * 0.001).toFixed(2)} AC</span>
              </div>
            </div>
            <p style={{
              textAlign: 'center',
              margin: '0 0 16px 0',
              color: wallet?.coin_balance >= selectedTicket.altyn_price ? '#059669' : '#EF4444'
            }}>
              Ваш баланс: {wallet?.coin_balance?.toLocaleString()} AC
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={onPurchase}
                disabled={processing || !wallet || wallet.coin_balance < selectedTicket.altyn_price}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: processing ? '#94a3b8' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: processing ? 'not-allowed' : 'pointer'
                }}
              >
                {processing ? 'Обработка...' : 'Оплатить'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventPaymentModal;
