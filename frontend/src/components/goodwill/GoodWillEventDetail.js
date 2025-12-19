import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Coins, Share2, Heart, User, CheckCircle, HelpCircle, XCircle } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GoodWillEventDetail = ({ 
  eventId, 
  token, 
  moduleColor = '#8B5CF6',
  onBack,
  onWalletClick 
}) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchEvent();
    if (token) fetchWallet();
  }, [eventId, token]);

  const fetchEvent = async () => {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/finance/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleRSVP = async (status) => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchEvent();
      }
    } catch (error) {
      console.error('Error updating RSVP:', error);
    }
  };

  const handlePurchaseTicket = async () => {
    if (!selectedTicket || !token) return;
    setProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/goodwill/events/${eventId}/purchase-ticket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_id: eventId,
          ticket_type_id: selectedTicket.id,
          pay_with_altyn: true
        })
      });
      if (res.ok) {
        const data = await res.json();
        setReceipt(data.receipt);
        fetchEvent();
        fetchWallet();
      } else {
        const error = await res.json();
        alert(error.detail || 'Ошибка при покупке билета');
      }
    } catch (error) {
      console.error('Error purchasing ticket:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div className="spinner" style={{ borderTopColor: moduleColor }}></div>
        <p style={{ color: '#64748b', marginTop: '16px' }}>Загрузка...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p>Мероприятие не найдено</p>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          marginBottom: '20px',
          padding: '8px 0',
          fontSize: '14px'
        }}
      >
        <ArrowLeft size={18} />
        Назад к списку
      </button>

      {/* Cover Image */}
      <div style={{ 
        height: '250px', 
        background: event.cover_image 
          ? `url(${event.cover_image}) center/cover`
          : `linear-gradient(135deg, ${event.category?.color || moduleColor}60 0%, ${event.category?.color || moduleColor}30 100%)`,
        borderRadius: '20px',
        marginBottom: '24px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <span>{event.category?.icon}</span>
          <span style={{ color: event.category?.color }}>{event.category?.name}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Main Content */}
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: '0 0 16px 0' }}>
            {event.title}
          </h1>

          {/* Organizer */}
          {event.organizer && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px',
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '12px'
            }}>
              {event.organizer.logo ? (
                <img 
                  src={event.organizer.logo} 
                  alt="" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: moduleColor + '20',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: moduleColor
                }}>
                  {event.organizer.name?.[0]}
                </div>
              )}
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1e293b' }}>
                  {event.organizer.name}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Организатор
                </p>
              </div>
            </div>
          )}

          {/* Event Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <Calendar size={20} color={moduleColor} />
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#1e293b' }}>
                  {formatDate(event.start_date)}
                </p>
                {event.end_date && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    До: {formatDate(event.end_date)}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <MapPin size={20} color={moduleColor} />
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: '500', color: '#1e293b' }}>
                  {event.is_online ? 'Онлайн мероприятие' : event.venue_name || event.city}
                </p>
                {event.address && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {event.address}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={20} color={moduleColor} />
              <p style={{ margin: 0, color: '#1e293b' }}>
                {event.attendees_count} участников
                {event.maybe_count > 0 && ` • ${event.maybe_count} возможно`}
                {event.capacity > 0 && ` / ${event.capacity} мест`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px 0' }}>
              О мероприятии
            </h3>
            <p style={{ color: '#475569', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {event.description}
            </p>
          </div>

          {/* Attendees Preview */}
          {event.attendees_preview && event.attendees_preview.length > 0 && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px 0' }}>
                Участники
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {event.attendees_preview.map((att, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '20px'
                  }}>
                    {att.user?.profile_picture ? (
                      <img 
                        src={att.user.profile_picture} 
                        alt="" 
                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <User size={12} color="#64748b" />
                      </div>
                    )}
                    <span style={{ fontSize: '13px', color: '#475569' }}>
                      {att.user?.first_name} {att.user?.last_name?.[0]}.
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            position: 'sticky',
            top: '20px'
          }}>
            {/* Price */}
            {event.is_free ? (
              <div style={{ 
                background: '#ECFDF5', 
                padding: '16px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#059669' }}>
                  Бесплатно
                </p>
              </div>
            ) : event.ticket_types?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontWeight: '600' }}>Билеты</h4>
                {event.ticket_types.map(ticket => (
                  <div 
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: '12px',
                      border: selectedTicket?.id === ticket.id ? `2px solid ${moduleColor}` : '2px solid #e2e8f0',
                      borderRadius: '10px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      background: selectedTicket?.id === ticket.id ? moduleColor + '10' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500' }}>{ticket.name}</span>
                      <span style={{ fontWeight: '700', color: '#F59E0B' }}>
                        {ticket.altyn_price || ticket.price} {ticket.altyn_price ? 'AC' : '₽'}
                      </span>
                    </div>
                    {ticket.quantity > 0 && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                        Осталось: {ticket.quantity - (ticket.sold || 0)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* RSVP Buttons */}
            {event.my_attendance?.payment_transaction_id ? (
              <div style={{ 
                background: '#ECFDF5', 
                padding: '16px', 
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <CheckCircle size={24} color="#059669" style={{ marginBottom: '8px' }} />
                <p style={{ margin: 0, fontWeight: '600', color: '#059669' }}>Билет куплен</p>
              </div>
            ) : event.is_free ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button
                    onClick={() => handleRSVP('GOING')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: event.my_rsvp === 'GOING' ? '#10B981' : '#f1f5f9',
                      color: event.my_rsvp === 'GOING' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle size={16} />
                    Иду
                  </button>
                  <button
                    onClick={() => handleRSVP('MAYBE')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: event.my_rsvp === 'MAYBE' ? '#F59E0B' : '#f1f5f9',
                      color: event.my_rsvp === 'MAYBE' ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '10px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <HelpCircle size={16} />
                    Может быть
                  </button>
                </div>
                {event.my_rsvp && event.my_rsvp !== 'NOT_GOING' && (
                  <button
                    onClick={() => handleRSVP('NOT_GOING')}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'transparent',
                      color: '#94a3b8',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Отменить участие
                  </button>
                )}
              </div>
            ) : selectedTicket?.altyn_price && (
              <div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!wallet || wallet.coin_balance < selectedTicket.altyn_price}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: (!wallet || wallet.coin_balance < selectedTicket.altyn_price) ? '#94a3b8' : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: (!wallet || wallet.coin_balance < selectedTicket.altyn_price) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Coins size={18} />
                  Оплатить ALTYN
                </button>
                {wallet && (
                  <p style={{ 
                    textAlign: 'center', 
                    margin: '12px 0 0 0', 
                    fontSize: '13px',
                    color: wallet.coin_balance >= (selectedTicket?.altyn_price || 0) ? '#059669' : '#EF4444'
                  }}>
                    Ваш баланс: {wallet.coin_balance?.toLocaleString()} AC
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTicket && (
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
        }} onClick={() => !receipt && setShowPaymentModal(false)}>
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
                  onClick={() => {
                    setShowPaymentModal(false);
                    setReceipt(null);
                  }}
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
                    onClick={() => setShowPaymentModal(false)}
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
                    onClick={handlePurchaseTicket}
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
      )}
    </div>
  );
};

export default GoodWillEventDetail;
