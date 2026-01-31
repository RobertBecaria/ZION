/**
 * Business Analytics Dashboard
 * Displays aggregated metrics for business owners
 */
import React, { useState, useEffect } from 'react';
import { BACKEND_URL } from '../config/api';
import { 
  BarChart3, Users, Calendar, Star, TrendingUp, 
  Loader2, AlertCircle, RefreshCw, ChevronDown
} from 'lucide-react';

const BusinessAnalyticsDashboard = ({ organizationId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const periodOptions = [
    { value: '7d', label: 'За 7 дней' },
    { value: '30d', label: 'За 30 дней' },
    { value: '90d', label: 'За 90 дней' },
    { value: 'all', label: 'За всё время' }
  ];

  useEffect(() => {
    loadAnalytics();
  }, [organizationId, period]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(
        `${BACKEND_URL}/api/work/organizations/${organizationId}/analytics?period=${period}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Ошибка загрузки аналитики');
      }
    } catch (err) {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, subvalue, color = 'blue' }) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      pink: 'bg-pink-50 text-pink-600 border-pink-200'
    };
    
    return (
      <div className={`p-4 rounded-xl border ${colors[color]} transition-all hover:shadow-md`}>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color].replace('border-', 'bg-').replace('-200', '-100')}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subvalue && <div className="text-sm text-gray-500 mt-1">{subvalue}</div>}
      </div>
    );
  };

  const RatingStars = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const SimpleBarChart = ({ data, maxValue }) => {
    if (!data || data.length === 0) return null;
    const max = maxValue || Math.max(...data.map(d => d.count), 1);
    
    return (
      <div className="flex items-end gap-1 h-24">
        {data.slice(-14).map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-600 hover:to-blue-500"
              style={{ height: `${(item.count / max) * 100}%`, minHeight: item.count > 0 ? '4px' : '0' }}
              title={`${item.date}: ${item.count} бронирований`}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <span className="text-red-700">{error}</span>
        <button 
          onClick={loadAnalytics}
          className="ml-auto text-red-600 hover:text-red-800"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, bookings, reviews, customers, services, trends } = analytics;

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Аналитика бизнеса</h3>
            <p className="text-sm text-gray-600">{analytics.organization_name}</p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <span className="text-sm">{periodOptions.find(p => p.value === period)?.label}</span>
            <ChevronDown size={16} className={`transition-transform ${showPeriodDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showPeriodDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {periodOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setPeriod(opt.value); setShowPeriodDropdown(false); }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 ${period === opt.value ? 'bg-blue-50 text-blue-600' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon={Calendar} 
          label="Бронирований" 
          value={summary.total_bookings}
          subvalue={`${bookings.completed} завершено`}
          color="blue"
        />
        <StatCard 
          icon={Users} 
          label="Клиентов" 
          value={summary.unique_customers}
          subvalue={`${customers.repeat_rate}% повторных`}
          color="green"
        />
        <StatCard 
          icon={Star} 
          label="Рейтинг" 
          value={summary.average_rating || '—'}
          subvalue={`${summary.total_reviews} отзывов`}
          color="orange"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Услуг" 
          value={summary.total_services}
          subvalue={`${services.by_status.active} активных`}
          color="purple"
        />
      </div>

      {/* Bookings Chart */}
      {trends.bookings_by_day && trends.bookings_by_day.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">Бронирования по дням</h4>
          <SimpleBarChart data={trends.bookings_by_day} />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{trends.bookings_by_day[0]?.date}</span>
            <span>{trends.bookings_by_day[trends.bookings_by_day.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Popular Services */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">Популярные услуги</h4>
          {services.most_popular && services.most_popular.length > 0 ? (
            <div className="space-y-3">
              {services.most_popular.map((service, idx) => (
                <div key={service.service_id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{service.service_name}</div>
                    <div className="text-xs text-gray-500">{service.booking_count} бронирований</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Нет данных о бронированиях</p>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">Последние отзывы</h4>
          {reviews.recent && reviews.recent.length > 0 ? (
            <div className="space-y-3">
              {reviews.recent.map((review, idx) => (
                <div key={idx} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Нет отзывов за этот период</p>
          )}
        </div>
      </div>

      {/* Rating Distribution */}
      {reviews.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="font-medium text-gray-900 mb-4">Распределение оценок</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = reviews.rating_distribution[rating] || 0;
              const percentage = reviews.total > 0 ? (count / reviews.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{rating}</span>
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Insights */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <h4 className="font-medium text-green-900 mb-3">Аналитика клиентов</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{customers.unique}</div>
            <div className="text-sm text-green-600">Уникальных клиентов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{customers.repeat}</div>
            <div className="text-sm text-green-600">Повторных клиентов</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{customers.repeat_rate}%</div>
            <div className="text-sm text-green-600">Лояльность</div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          <span className="text-sm">Обновить данные</span>
        </button>
      </div>
    </div>
  );
};

export default BusinessAnalyticsDashboard;
