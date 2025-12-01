/**
 * WishListDisplay Component
 * Interactive wish list display with claim/unclaim functionality
 */
import React from 'react';
import { Gift, Check, UserCheck } from 'lucide-react';

const WishListDisplay = ({
  event,
  wishListData,
  loadingWishList,
  claimingWish,
  handleClaimWish
}) => {
  const wishList = event?.birthday_party_data?.wish_list || [];
  const isPink = event?.birthday_party_data?.theme === 'PINK';
  
  if (wishList.length === 0) {
    return null;
  }
  
  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{ 
        fontSize: '14px', 
        fontWeight: '600',
        color: isPink ? '#BE185D' : '#1D4ED8',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}>
        <Gift size={16} />
        Список желаний
        {wishListData && (
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 'normal',
            background: 'rgba(255,255,255,0.8)',
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            {wishListData.claimed_count}/{wishListData.total_wishes} выбрано
          </span>
        )}
      </p>
      
      {loadingWishList ? (
        <div style={{ textAlign: 'center', padding: '10px', color: '#6B7280' }}>
          Загрузка...
        </div>
      ) : wishListData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {wishListData.wishes.map((wishItem) => {
            const isClaimed = wishItem.is_claimed;
            const isClaimedByMe = wishItem.is_claimed_by_me;
            const isLoading = claimingWish === wishItem.index;
            
            return (
              <button
                key={wishItem.index}
                onClick={() => !isClaimed || isClaimedByMe ? handleClaimWish(event.id, wishItem.index) : null}
                disabled={isLoading || (isClaimed && !isClaimedByMe)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isClaimedByMe 
                    ? (isPink ? '#FBCFE8' : '#BFDBFE')
                    : isClaimed 
                      ? '#E5E7EB'
                      : 'rgba(255,255,255,0.9)',
                  borderRadius: '10px',
                  border: isClaimedByMe 
                    ? `2px solid ${isPink ? '#EC4899' : '#3B82F6'}`
                    : isClaimed
                      ? '2px solid #D1D5DB'
                      : `1px solid ${isPink ? '#F9A8D4' : '#93C5FD'}`,
                  cursor: isClaimed && !isClaimedByMe ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: isClaimed && !isClaimedByMe ? '#9CA3AF' : (isPink ? '#9D174D' : '#1E40AF'),
                  textDecoration: isClaimed && !isClaimedByMe ? 'line-through' : 'none'
                }}>
                  🎁 {wishItem.title}
                </span>
                <span style={{ 
                  fontSize: '11px',
                  color: isClaimedByMe ? (isPink ? '#BE185D' : '#1D4ED8') : '#6B7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isLoading ? (
                    '...'
                  ) : isClaimedByMe ? (
                    <>
                      <Check size={12} />
                      Вы выбрали
                    </>
                  ) : isClaimed ? (
                    <>
                      <UserCheck size={12} />
                      {wishItem.claimed_by_name || 'Занято'}
                    </>
                  ) : (
                    'Выбрать'
                  )}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        // Fallback to simple display if API fails
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
          {wishList.map((wish, idx) => (
            <span 
              key={idx}
              style={{
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '12px',
                fontSize: '12px',
                color: isPink ? '#9D174D' : '#1E40AF'
              }}
            >
              🎁 {wish}
            </span>
          ))}
        </div>
      )}
      
      <p style={{
        marginTop: '10px',
        fontSize: '11px',
        color: '#6B7280',
        textAlign: 'center'
      }}>
        Нажмите на подарок, чтобы зарезервировать его
      </p>
    </div>
  );
};

export default WishListDisplay;
