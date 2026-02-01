/**
 * NodeManagement Component
 * Manage ALTYN TOKEN staking nodes
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Server, Plus, Coins, Lock, Unlock, RefreshCw, AlertTriangle,
  CheckCircle, X, HardDrive, Cpu, MemoryStick, Clock, Users,
  TrendingUp, Zap, Settings, Search, ChevronRight, Loader2,
  ArrowRight, Monitor, Activity, Wifi
} from 'lucide-react';

const NodeManagement = ({ user, moduleColor = '#A16207' }) => {
  const [nodes, setNodes] = useState([]);
  const [myNodes, setMyNodes] = useState([]);
  const [myStakes, setMyStakes] = useState([]);
  const [summary, setSummary] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showAutoCreateModal, setShowAutoCreateModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [nodesRes, myDataRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/finance/nodes?limit=50`, { headers }),
        fetch(`${BACKEND_URL}/api/finance/nodes/my`, { headers }),
        fetch(`${BACKEND_URL}/api/finance/nodes/stats`, { headers })
      ]);

      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setNodes(data.nodes || []);
      }

      if (myDataRes.ok) {
        const data = await myDataRes.json();
        setMyNodes(data.my_nodes || []);
        setMyStakes(data.my_stakes || []);
        setSummary(data.summary || {});
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error('Error fetching node data:', err);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  const formatNumber = (num) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num?.toLocaleString('ru-RU') || '0';
  };

  // Create Node Modal
  const CreateNodeModal = ({ onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [initialStake, setInitialStake] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!name.trim()) {
        setError('Введите название узла');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('zion_token');
        const response = await fetch(`${BACKEND_URL}/api/finance/nodes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: name.trim(),
            initial_stake: parseFloat(initialStake) || 0
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Ошибка создания узла');
        }

        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const nodeType = parseFloat(initialStake) >= 10000 ? 'SUPER' : 'STANDARD';
    const maxCapacity = nodeType === 'SUPER' ? 100000 : 5000;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Server className="w-6 h-6" style={{ color: moduleColor }} />
              Создать NODE
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Hardware Requirements Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Требования к оборудованию
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-blue-800">
                  <HardDrive className="w-4 h-4" />
                  <span>100 GB HDD</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800">
                  <MemoryStick className="w-4 h-4" />
                  <span>16 GB RAM</span>
                </div>
                <div className="flex items-center gap-2 text-blue-800 col-span-2">
                  <Cpu className="w-4 h-4" />
                  <span>Apple M1/M2/M3 или Intel i7+ (8+ ядер)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Название узла</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мой NODE #1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Начальный стейк (опционально)
              </label>
              <input
                type="number"
                value={initialStake}
                onChange={(e) => setInitialStake(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Доступно: {formatNumber(summary.available_tokens || 0)} AT
              </p>
            </div>

            {/* Node Type Preview */}
            <div className={`p-4 rounded-lg border ${nodeType === 'SUPER' ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${nodeType === 'SUPER' ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'}`}>
                    {nodeType} NODE
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Максимальная ёмкость: {formatNumber(maxCapacity)} AT
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Период блокировки</p>
                  <p className="font-bold text-gray-900">30 дней</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 py-3 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: moduleColor }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Создать
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Stake Modal
  const StakeModal = ({ node, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const available = node.total_capacity - (node.staked_amount || 0);

    const handleSubmit = async (e) => {
      e.preventDefault();
      const stakeAmount = parseFloat(amount);
      
      if (!stakeAmount || stakeAmount <= 0) {
        setError('Введите корректную сумму');
        return;
      }

      if (stakeAmount > available) {
        setError(`Максимально доступно: ${formatNumber(available)} AT`);
        return;
      }

      if (stakeAmount > (summary.available_tokens || 0)) {
        setError('Недостаточно токенов');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('zion_token');
        const response = await fetch(`${BACKEND_URL}/api/finance/nodes/${node.id}/stake`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: stakeAmount })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Ошибка стейкинга');
        }

        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Coins className="w-6 h-6" style={{ color: moduleColor }} />
              Стейкинг в "{node.name}"
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Тип узла:</span>
                <span className={`font-bold ${node.node_type === 'SUPER' ? 'text-purple-600' : 'text-gray-900'}`}>
                  {node.node_type}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Доступно в узле:</span>
                <span className="font-bold text-gray-900">{formatNumber(available)} AT</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">Ваши токены:</span>
                <span className="font-bold text-gray-900">{formatNumber(summary.available_tokens || 0)} AT</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сумма стейкинга</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                min="1"
                max={Math.min(available, summary.available_tokens || 0)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Период блокировки: 30 дней</span>
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Токены будут заблокированы на 30 дней с момента стейкинга
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="flex-1 py-3 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: moduleColor }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Coins className="w-5 h-5" />Застейкать</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Auto Create Modal
  const AutoCreateModal = ({ onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [preferNewNode, setPreferNewNode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      const stakeAmount = parseFloat(amount);
      
      if (!stakeAmount || stakeAmount <= 0) {
        setError('Введите корректную сумму');
        return;
      }

      if (stakeAmount > (summary.available_tokens || 0)) {
        setError('Недостаточно токенов');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('zion_token');
        const response = await fetch(`${BACKEND_URL}/api/finance/nodes/auto-create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: stakeAmount,
            prefer_new_node: preferNewNode
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Ошибка автоматического стейкинга');
        }

        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6" style={{ color: moduleColor }} />
              Автоматический стейкинг
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Система автоматически найдёт лучший узел для ваших токенов или создаст новый, если это выгоднее.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Сумма стейкинга</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Доступно: {formatNumber(summary.available_tokens || 0)} AT
              </p>
            </div>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={preferNewNode}
                onChange={(e) => setPreferNewNode(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300"
              />
              <div>
                <p className="font-medium text-gray-900">Создать новый узел</p>
                <p className="text-xs text-gray-500">Предпочитать создание нового узла вместо стейкинга в существующий</p>
              </div>
            </label>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading || !amount}
                className="flex-1 py-3 rounded-lg text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: moduleColor }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" />Авто-стейк</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Unstake handler
  const handleUnstake = async (stake) => {
    if (!window.confirm('Вы уверены, что хотите вывести токены?')) return;

    try {
      const token = localStorage.getItem('zion_token');
      const response = await fetch(`${BACKEND_URL}/api/finance/nodes/stakes/${stake.id}/unstake`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка вывода токенов');
      }

      handleRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 animate-spin" style={{ color: moduleColor }} />
        <span className="ml-3 text-gray-600">Загрузка узлов...</span>
      </div>
    );
  }

  return (
    <div className="node-management" style={{ '--module-color': moduleColor }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Server size={28} style={{ color: moduleColor }} />
          <h2 className="text-2xl font-bold text-gray-900">NODE Стейкинг</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAutoCreateModal(true)}
            className="px-4 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition"
            style={{ backgroundColor: '#10B981' }}
          >
            <Zap size={18} />
            Авто
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition"
            style={{ backgroundColor: moduleColor }}
          >
            <Plus size={18} />
            Создать NODE
          </button>
          <button onClick={handleRefresh} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
            <RefreshCw size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${moduleColor}20` }}>
              <Server size={24} style={{ color: moduleColor }} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Мои узлы</p>
              <p className="text-2xl font-bold text-gray-900">{summary.nodes_owned || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-100">
              <Coins size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Застейкано</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.total_staked || 0)} AT</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-100">
              <TrendingUp size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Доступно</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(summary.available_tokens || 0)} AT</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-100">
              <Activity size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Всего в сети</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_staked || 0)} AT</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { id: 'overview', label: 'Обзор', icon: Activity },
          { id: 'my-nodes', label: 'Мои узлы', icon: Server },
          { id: 'my-stakes', label: 'Мои стейки', icon: Coins },
          { id: 'all-nodes', label: 'Все узлы', icon: Search },
          { id: 'resources', label: 'Ресурсы', icon: Monitor }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-current font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ color: activeTab === tab.id ? moduleColor : undefined }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Global Stats */}
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Статистика сети</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Всего узлов</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_nodes || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Активных</p>
                <p className="text-xl font-bold text-green-600">{stats.active_nodes || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Стейкеров</p>
                <p className="text-xl font-bold text-gray-900">{stats.total_stakers || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">% застейкан</p>
                <p className="text-xl font-bold" style={{ color: moduleColor }}>{stats.staking_percentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${moduleColor}20` }}>
                  <Server size={32} style={{ color: moduleColor }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Создать NODE</h4>
                  <p className="text-sm text-gray-500">Запустите свой узел и получайте дивиденды</p>
                </div>
                <ChevronRight className="ml-auto text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => setShowAutoCreateModal(true)}
              className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition text-left"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-green-100">
                  <Zap size={32} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Авто-стейкинг</h4>
                  <p className="text-sm text-gray-500">Система автоматически найдёт лучший узел</p>
                </div>
                <ChevronRight className="ml-auto text-gray-400" />
              </div>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'my-nodes' && (
        <div className="space-y-4">
          {myNodes.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Server size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">У вас нет узлов</h3>
              <p className="text-gray-500 mt-2">Создайте свой первый NODE, чтобы начать получать дивиденды</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-6 py-3 rounded-lg text-white"
                style={{ backgroundColor: moduleColor }}
              >
                Создать NODE
              </button>
            </div>
          ) : (
            myNodes.map(node => (
              <div key={node.id} className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${node.node_type === 'SUPER' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <Server size={24} className={node.node_type === 'SUPER' ? 'text-purple-600' : 'text-gray-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{node.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          node.node_type === 'SUPER' ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {node.node_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {formatNumber(node.staked_amount || 0)} / {formatNumber(node.total_capacity)} AT
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      node.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      node.status === 'FULL' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {node.status === 'ACTIVE' ? 'Активен' : node.status === 'FULL' ? 'Заполнен' : 'Неактивен'}
                    </span>
                    <div className="mt-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(node.staked_amount / node.total_capacity) * 100}%`,
                            backgroundColor: node.node_type === 'SUPER' ? '#8B5CF6' : moduleColor
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'my-stakes' && (
        <div className="space-y-4">
          {myStakes.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Coins size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">У вас нет стейков</h3>
              <p className="text-gray-500 mt-2">Застейкайте токены в узлы, чтобы получать дивиденды</p>
              <button
                onClick={() => setShowAutoCreateModal(true)}
                className="mt-4 px-6 py-3 rounded-lg text-white"
                style={{ backgroundColor: moduleColor }}
              >
                Авто-стейкинг
              </button>
            </div>
          ) : (
            myStakes.map(stake => (
              <div key={stake.id} className="bg-white rounded-xl p-4 border shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stake.is_locked ? 'bg-amber-100' : 'bg-green-100'}`}>
                      {stake.is_locked ? <Lock size={24} className="text-amber-600" /> : <Unlock size={24} className="text-green-600" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{stake.node_name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatNumber(stake.staked_amount)} AT
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      {stake.is_locked ? (
                        <div className="flex items-center gap-1 text-amber-600">
                          <Clock size={16} />
                          <span className="text-sm font-medium">{stake.days_remaining} дней</span>
                        </div>
                      ) : (
                        <span className="text-sm text-green-600 font-medium">Доступно</span>
                      )}
                    </div>
                    <button
                      onClick={() => handleUnstake(stake)}
                      disabled={stake.is_locked}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        stake.is_locked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-600 hover:bg-red-200'
                      }`}
                    >
                      Вывести
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'all-nodes' && (
        <div className="space-y-4">
          {nodes.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <Server size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Нет доступных узлов</h3>
              <p className="text-gray-500 mt-2">Будьте первым - создайте свой NODE!</p>
            </div>
          ) : (
            nodes.map(node => (
              <div key={node.id} className="bg-white rounded-xl p-4 border shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${node.node_type === 'SUPER' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <Server size={24} className={node.node_type === 'SUPER' ? 'text-purple-600' : 'text-gray-600'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{node.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          node.node_type === 'SUPER' ? 'bg-purple-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {node.node_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Владелец: {node.owner_name} • {formatNumber(node.staked_amount || 0)} / {formatNumber(node.total_capacity)} AT
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium" style={{ color: moduleColor }}>
                        {formatNumber(node.available_capacity)} AT доступно
                      </p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${node.fill_percentage}%`,
                            backgroundColor: node.node_type === 'SUPER' ? '#8B5CF6' : moduleColor
                          }}
                        />
                      </div>
                    </div>
                    {node.status === 'ACTIVE' && node.available_capacity > 0 && (
                      <button
                        onClick={() => { setSelectedNode(node); setShowStakeModal(true); }}
                        className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition"
                        style={{ backgroundColor: moduleColor }}
                      >
                        Стейк
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Resource Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Activity size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Мониторинг ресурсов</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Система мониторинга ресурсов будет подключена в будущих обновлениях.
                  Здесь будет отображаться информация о CPU, RAM и HDD вашего устройства.
                </p>
              </div>
            </div>
          </div>

          {/* Placeholder Resource Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Cpu size={24} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">CPU</h4>
                  <p className="text-sm text-gray-500">Процессор</p>
                </div>
              </div>
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">Ожидание подключения...</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <MemoryStick size={24} className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">RAM</h4>
                  <p className="text-sm text-gray-500">Оперативная память</p>
                </div>
              </div>
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">Ожидание подключения...</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <HardDrive size={24} className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">HDD</h4>
                  <p className="text-sm text-gray-500">Хранилище</p>
                </div>
              </div>
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">Ожидание подключения...</p>
              </div>
            </div>
          </div>

          {/* Online Stats Placeholder */}
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <Wifi size={24} className="text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Онлайн статистика</h4>
                <p className="text-sm text-gray-500">Время онлайн и активность</p>
              </div>
            </div>
            <div className="text-center py-8 text-gray-400">
              <Clock size={32} className="mx-auto mb-2" />
              <p className="text-sm">Статистика будет доступна после подключения системы мониторинга</p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateNodeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showStakeModal && selectedNode && (
        <StakeModal
          node={selectedNode}
          onClose={() => { setShowStakeModal(false); setSelectedNode(null); }}
          onSuccess={handleRefresh}
        />
      )}

      {showAutoCreateModal && (
        <AutoCreateModal
          onClose={() => setShowAutoCreateModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
};

export default NodeManagement;
