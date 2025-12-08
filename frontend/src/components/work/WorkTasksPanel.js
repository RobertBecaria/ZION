/**
 * WorkTasksPanel Component
 * Displays tasks in the right sidebar of Organization Lenta
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Filter, Clock, CheckCircle2, Circle, AlertCircle,
  ChevronDown, ChevronUp, MoreVertical, MessageSquare, User, Users, Building,
  FileText
} from 'lucide-react';
import WorkTaskCard from './WorkTaskCard';
import WorkTaskCreateModal from './WorkTaskCreateModal';
import WorkTaskTemplateManager from './WorkTaskTemplateManager';

const TASK_FILTERS = [
  { key: 'all', label: 'Все' },
  { key: 'my', label: 'Мои' },
  { key: 'team', label: 'Команды' },
  { key: 'created', label: 'Созданные мной' }
];

const WorkTasksPanel = ({
  organizationId,
  currentUser,
  moduleColor = '#C2410C',
  onTaskDiscuss,
  onRefreshFeed
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('my');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedSection, setExpandedSection] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('zion_token');
      
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/work/organizations/${organizationId}/tasks?include_completed=${showCompleted}`;
      
      if (activeFilter === 'my') {
        url += '&assigned_to_me=true';
      } else if (activeFilter === 'created') {
        url += '&created_by_me=true';
      } else if (activeFilter === 'team') {
        url += '&assignment_type=TEAM';
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [organizationId, activeFilter, showCompleted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskCreated = (newTask) => {
    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (updatedTask.status === 'DONE' && onRefreshFeed) {
      onRefreshFeed();
    }
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const activeTasks = tasks.filter(t => t.status !== 'DONE');
  const completedTasks = tasks.filter(t => t.status === 'DONE');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#eab308';
      default: return '#22c55e';
    }
  };

  return (
    <div className="work-tasks-panel" style={{ '--module-color': moduleColor }}>
      {/* Header */}
      <div className="tasks-panel-header">
        <div 
          className="tasks-panel-title"
          onClick={() => setExpandedSection(!expandedSection)}
        >
          <CheckCircle2 size={18} color={moduleColor} />
          <span>МОИ ЗАДАЧИ</span>
          {activeTasks.length > 0 && (
            <span className="tasks-count" style={{ backgroundColor: moduleColor }}>
              {activeTasks.length}
            </span>
          )}
          {expandedSection ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        <div className="tasks-panel-actions">
          <button 
            className="templates-btn"
            onClick={() => setShowTemplateManager(true)}
            title="Шаблоны задач"
          >
            <FileText size={16} />
          </button>
          <button 
            className="add-task-btn"
            onClick={() => setShowCreateModal(true)}
            style={{ color: moduleColor }}
            title="Создать задачу"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {expandedSection && (
        <>
          {/* Filters */}
          <div className="tasks-filters">
            {TASK_FILTERS.map(filter => (
              <button
                key={filter.key}
                className={`task-filter-btn ${activeFilter === filter.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter.key)}
                style={activeFilter === filter.key ? { 
                  backgroundColor: `${moduleColor}15`,
                  color: moduleColor,
                  borderColor: moduleColor
                } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="tasks-list">
            {loading ? (
              <div className="tasks-loading">
                <div className="loading-spinner" style={{ borderTopColor: moduleColor }} />
                <span>Загрузка...</span>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="no-tasks">
                <CheckCircle2 size={32} color="#9ca3af" />
                <p>Нет активных задач</p>
                <button 
                  className="create-task-btn"
                  onClick={() => setShowCreateModal(true)}
                  style={{ backgroundColor: moduleColor }}
                >
                  Создать задачу
                </button>
              </div>
            ) : (
              activeTasks.map(task => (
                <WorkTaskCard
                  key={task.id}
                  task={task}
                  organizationId={organizationId}
                  currentUser={currentUser}
                  moduleColor={moduleColor}
                  onUpdate={handleTaskUpdated}
                  onDelete={handleTaskDeleted}
                  onDiscuss={onTaskDiscuss}
                />
              ))
            )}
          </div>

          {/* Completed Tasks Toggle */}
          {completedTasks.length > 0 && (
            <button
              className="show-completed-btn"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              {showCompleted ? 'Скрыть выполненные' : `Показать выполненные (${completedTasks.length})`}
            </button>
          )}

          {/* Completed Tasks */}
          {showCompleted && completedTasks.length > 0 && (
            <div className="completed-tasks">
              <div className="completed-header">Выполненные</div>
              {completedTasks.map(task => (
                <WorkTaskCard
                  key={task.id}
                  task={task}
                  organizationId={organizationId}
                  currentUser={currentUser}
                  moduleColor={moduleColor}
                  onUpdate={handleTaskUpdated}
                  onDelete={handleTaskDeleted}
                  compact
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <WorkTaskCreateModal
          organizationId={organizationId}
          currentUser={currentUser}
          moduleColor={moduleColor}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedTemplate(null);
          }}
          onTaskCreated={handleTaskCreated}
          initialTemplate={selectedTemplate}
        />
      )}

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <WorkTaskTemplateManager
          organizationId={organizationId}
          moduleColor={moduleColor}
          onClose={() => setShowTemplateManager(false)}
          onTemplateSelect={(template) => {
            setSelectedTemplate(template);
            setShowTemplateManager(false);
            setShowCreateModal(true);
          }}
        />
      )}
    </div>
  );
};

export default WorkTasksPanel;
