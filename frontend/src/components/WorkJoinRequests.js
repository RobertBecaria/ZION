import React, { useState, useEffect } from 'react';
import { Clock, Building2, XCircle, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const WorkJoinRequests = ({ onBack, onViewProfile }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Mock join requests data
  const mockRequests = [
    {
      id: 'req-001',
      organization_id: 'org-002',
      organization_name: 'Сбербанк',
      organization_type: 'COMPANY',
      status: 'pending',
      requested_at: '2025-08-20T10:30:00Z',
      message: 'Хочу присоединиться к вашей команде в качестве разработчика'
    },
    {
      id: 'req-002',
      organization_id: 'org-004',
      organization_name: 'Газпром',
      organization_type: 'COMPANY',
      status: 'pending',
      requested_at: '2025-08-22T14:15:00Z',
      message: 'Заинтересован в работе в вашей компании'
    },
    {
      id: 'req-003',
      organization_id: 'org-006',
      organization_name: 'Ростелеком',
      organization_type: 'COMPANY',
      status: 'rejected',
      requested_at: '2025-08-15T09:00:00Z',
      reviewed_at: '2025-08-16T11:30:00Z',
      rejection_reason: 'В данный момент мы не принимаем новых участников'
    }
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    setLoading(true);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);
    }, 800);
  };

  const handleCancelRequest = async (requestId) => {
    setCancellingId(requestId);
    // TODO: Replace with actual API call
    setTimeout(() => {
      setRequests(prev => prev.filter(req => req.id !== requestId));
      setCancellingId(null);
    }, 1000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка запросов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full hover:bg-white/80 flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои запросы</h1>
            <p className="text-gray-600 mt-1">Запросы на вступление в организации</p>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Ожидают рассмотрения ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {request.organization_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.organization_type.replace('_', ' ')}
                        </p>
                        {request.message && (
                          <p className="text-gray-700 mb-3 italic">"{request.message}"</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Отправлено: {formatDate(request.requested_at)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      disabled={cancellingId === request.id}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {cancellingId === request.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          Отмена...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Отменить
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Requests */}
        {rejectedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              Отклонённые ({rejectedRequests.length})
            </h2>
            <div className="space-y-4">
              {rejectedRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-red-500"
                >
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {request.organization_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {request.organization_type.replace('_', ' ')}
                      </p>
                      {request.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2">
                          <p className="text-sm text-red-700">
                            <span className="font-semibold">Причина отклонения:</span> {request.rejection_reason}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        Отправлено: {formatDate(request.requested_at)}
                      </p>
                      {request.reviewed_at && (
                        <p className="text-sm text-gray-500">
                          Рассмотрено: {formatDate(request.reviewed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Нет запросов</h3>
            <p className="text-gray-600 mb-6">
              У вас пока нет запросов на вступление в организации
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              Найти организации
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkJoinRequests;