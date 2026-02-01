/**
 * AdminNodeManagement Component
 * Admin panel for managing ALTYN TOKEN nodes
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Server, Search, RefreshCw, AlertTriangle, X, Trash2, ArrowRightLeft,
  Users, Coins, ChevronDown, ChevronUp, Lock, Unlock, Eye, Filter,
  TrendingUp, Activity, Shield, Clock
} from 'lucide-react';

// Get backend URL
const getBackendUrl = () => {
  let baseUrl = process.env.REACT_APP_BACKEND_URL || '';
  const currentHost = window.location.hostname;
  const isProduction = currentHost === 'zioncity.app' || 
                       currentHost.endsWith('.zioncity.app') ||
                       currentHost.endsWith('.emergent.host');
  
  if (!baseUrl || (isProduction && baseUrl.includes('preview.emergentagent.com'))) {
    baseUrl = window.location.origin;
  }
  
  if (baseUrl.endsWith('/api')) return baseUrl;
  return baseUrl + '/api';
};

const BACKEND_URL = getBackendUrl();

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString('ru-RU') || '0';
};

const AdminNodeManagement = () => {
  const [nodes, setNodes] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [showNodeDetail, setShowNodeDetail] = useState(false);
  const [showReorganizeModal, setShowReorganizeModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterType) params.append('node_type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const [nodesRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/finance/nodes?${params.toString()}`, { headers }),
        fetch(`${BACKEND_URL}/admin/finance/nodes/stats`, { headers })
      ]);

      if (nodesRes.ok) {
        const data = await nodesRes.json();
        setNodes(data.nodes || []);
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
  }, [searchQuery, filterType, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Force Unstake Handler
  const handleForceUnstake = async (nodeId, stakeId, userName) => {
    const reason = prompt(`Причина принудительного вывода токенов пользователя ${userName}:`);
    if (!reason) return;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${BACKEND_URL}/admin/finance/nodes/${nodeId}/force-unstake/${stakeId}?reason=${encodeURIComponent(reason)}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка');
      }

      const data = await response.json();
      alert(data.message);
      handleRefresh();
      setShowNodeDetail(false);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Delete Node Handler
  const handleDeleteNode = async (nodeId, nodeName) => {
    const reason = prompt(`Причина удаления узла "${nodeName}":`);
    if (!reason) return;

    if (!window.confirm(`Вы уверены, что хотите удалить узел "${nodeName}"? Все токены будут возвращены стейкерам.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(
        `${BACKEND_URL}/admin/finance/nodes/${nodeId}?reason=${encodeURIComponent(reason)}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка');
      }

      const data = await response.json();
      alert(data.message);
      handleRefresh();
      setShowNodeDetail(false);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  // Node Detail Modal
  const NodeDetailModal = ({ node, onClose }) => {
    const [nodeData, setNodeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchNodeDetail = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const response = await fetch(`${BACKEND_URL}/admin/finance/nodes/${node.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setNodeData(data);
          }
        } catch (err) {
          console.error('Error fetching node detail:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchNodeDetail();
    }, [node.id]);

    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-slate-700">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-6 h-6 text-amber-400" />
              {nodeData?.node?.name}
              <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                nodeData?.node?.node_type === 'SUPER' ? 'bg-purple-500' : 'bg-slate-500'
              }`}>
                {nodeData?.node?.node_type}
              </span>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Node Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Владелец</p>
                <p className="text-white font-medium">{nodeData?.node?.owner_name}</p>
                <p className="text-slate-500 text-xs">{nodeData?.node?.owner_email}</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Застейкано</p>
                <p className="text-white font-medium">{formatNumber(nodeData?.node?.staked_amount)} AT</p>
                <p className="text-slate-500 text-xs">{nodeData?.node?.fill_percentage}% заполнено</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Ёмкость</p>
                <p className="text-white font-medium">{formatNumber(nodeData?.node?.total_capacity)} AT</p>
                <p className="text-slate-500 text-xs">{formatNumber(nodeData?.node?.available_capacity)} доступно</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <p className="text-slate-400 text-xs">Стейкеров</p>
                <p className="text-white font-medium">{nodeData?.total_stakers}</p>
                <p className={`text-xs ${nodeData?.node?.status === 'ACTIVE' ? 'text-green-400' : nodeData?.node?.status === 'FULL' ? 'text-blue-400' : 'text-red-400'}`}>
                  {nodeData?.node?.status}
                </p>
              </div>
            </div>

            {/* Stakes Table */}
            <div className="bg-slate-900/50 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-400" />
                  Стейки ({nodeData?.stakes?.length || 0})
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {nodeData?.stakes?.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">Нет стейков</div>
                ) : (
                  nodeData?.stakes?.map(stake => (
                    <div key={stake.id} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                      <div>
                        <p className="text-white font-medium">{stake.user_name}</p>
                        <p className="text-slate-400 text-sm">{stake.user_email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{formatNumber(stake.staked_amount)} AT</p>
                        <div className="flex items-center gap-1">
                          {stake.is_locked ? (
                            <span className="text-amber-400 text-xs flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {stake.days_remaining} дней
                            </span>
                          ) : (
                            <span className="text-green-400 text-xs flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              Доступно
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleForceUnstake(node.id, stake.id, stake.user_name)}
                        className="ml-4 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                      >
                        Force Unstake
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-slate-700 flex justify-between">
            <button
              onClick={() => { setSelectedNode(node); setShowReorganizeModal(true); onClose(); }}
              className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 flex items-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Реорганизовать стейки
            </button>
            <button
              onClick={() => handleDeleteNode(node.id, node.name)}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Удалить узел
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Reorganize Modal
  const ReorganizeModal = ({ node, onClose }) => {
    const [stakes, setStakes] = useState([]);
    const [targetNodes, setTargetNodes] = useState([]);
    const [selectedStake, setSelectedStake] = useState('');
    const [targetNode, setTargetNode] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('admin_token');
          const headers = { 'Authorization': `Bearer ${token}` };

          const [nodeRes, allNodesRes] = await Promise.all([
            fetch(`${BACKEND_URL}/admin/finance/nodes/${node.id}`, { headers }),
            fetch(`${BACKEND_URL}/admin/finance/nodes?limit=100`, { headers })
          ]);

          if (nodeRes.ok) {
            const data = await nodeRes.json();
            setStakes(data.stakes || []);
          }

          if (allNodesRes.ok) {
            const data = await allNodesRes.json();
            setTargetNodes((data.nodes || []).filter(n => n.id !== node.id && n.status === 'ACTIVE'));
          }
        } catch (err) {
          console.error('Error:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [node.id]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedStake || !targetNode || !reason) {
        setError('Заполните все поля');
        return;
      }

      setSubmitting(true);
      setError('');

      try {
        const token = localStorage.getItem('admin_token');
        const response = await fetch(
          `${BACKEND_URL}/admin/finance/nodes/reorganize?reason=${encodeURIComponent(reason)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              stake_id: selectedStake,
              target_node_id: targetNode
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Ошибка');
        }

        const data = await response.json();
        alert(data.message);
        handleRefresh();
        onClose();
      } catch (err) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    };

    if (loading) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-blue-400" />
              Реорганизация стейков
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-2">Исходный узел</label>
              <div className="px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white">
                {node.name}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Выберите стейк</label>
              <select
                value={selectedStake}
                onChange={(e) => setSelectedStake(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите стейк...</option>
                {stakes.map(stake => (
                  <option key={stake.id} value={stake.id}>
                    {stake.user_name} - {formatNumber(stake.staked_amount)} AT
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Целевой узел</label>
              <select
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите узел...</option>
                {targetNodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.node_type}) - {formatNumber(n.available_capacity)} доступно
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Причина</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Причина реорганизации..."
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Перемещение...' : 'Переместить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-node-management">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Server className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Всего узлов</p>
              <p className="text-white text-xl font-bold">{stats.total_nodes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Активных</p>
              <p className="text-white text-xl font-bold">{stats.by_status?.active || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">SUPER</p>
              <p className="text-white text-xl font-bold">{stats.by_type?.super || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Coins className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Застейкано</p>
              <p className="text-white text-xl font-bold">{formatNumber(stats.total_staked || 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-500/20">
              <TrendingUp className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">% застейкан</p>
              <p className="text-white text-xl font-bold">{stats.staking_percentage || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск узлов..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Все типы</option>
          <option value="STANDARD">STANDARD</option>
          <option value="SUPER">SUPER</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Все статусы</option>
          <option value="ACTIVE">Активные</option>
          <option value="FULL">Заполненные</option>
          <option value="INACTIVE">Неактивные</option>
        </select>

        <button
          onClick={handleRefresh}
          className="px-4 py-2.5 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Nodes Table */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Узел</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Тип</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Владелец</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Застейкано</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Заполнение</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Статус</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Загрузка...
                  </td>
                </tr>
              ) : nodes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Узлы не найдены
                  </td>
                </tr>
              ) : (
                nodes.map(node => (
                  <tr key={node.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${node.node_type === 'SUPER' ? 'bg-purple-500/20' : 'bg-slate-700'}`}>
                          <Server className={`w-4 h-4 ${node.node_type === 'SUPER' ? 'text-purple-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{node.name}</p>
                          <p className="text-slate-500 text-xs">{node.stakes_count} стейкеров</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        node.node_type === 'SUPER' ? 'bg-purple-500 text-white' : 'bg-slate-600 text-white'
                      }`}>
                        {node.node_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white">{node.owner_name}</p>
                      <p className="text-slate-500 text-xs">{node.owner_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium">{formatNumber(node.staked_amount)}</p>
                      <p className="text-slate-500 text-xs">/ {formatNumber(node.total_capacity)} AT</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white">{node.fill_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${node.node_type === 'SUPER' ? 'bg-purple-500' : 'bg-amber-500'}`}
                            style={{ width: `${node.fill_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        node.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                        node.status === 'FULL' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {node.status === 'ACTIVE' ? 'Активен' : node.status === 'FULL' ? 'Заполнен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedNode(node); setShowNodeDetail(true); }}
                          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                          title="Подробнее"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedNode(node); setShowReorganizeModal(true); }}
                          className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition"
                          title="Реорганизовать"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNode(node.id, node.name)}
                          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNodeDetail && selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          onClose={() => { setShowNodeDetail(false); setSelectedNode(null); }}
        />
      )}

      {showReorganizeModal && selectedNode && (
        <ReorganizeModal
          node={selectedNode}
          onClose={() => { setShowReorganizeModal(false); setSelectedNode(null); }}
        />
      )}
    </div>
  );
};

export default AdminNodeManagement;
