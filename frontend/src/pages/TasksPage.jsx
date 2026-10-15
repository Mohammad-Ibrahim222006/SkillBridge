import React, { useState, useEffect } from 'react';
import { tasksApi } from '../services/api';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Layers,
  Calendar
} from 'lucide-react';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    setLoading(true);
    try {
      const res = await tasksApi.getMyTasks();
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await tasksApi.updateStatus(taskId, newStatus);
      if (res.success) {
        setMessage({ type: 'success', text: 'Task status updated.' });
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update task status' });
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Project Tasks</h1>
          <p className="page-subtitle">
            Track and update all tasks assigned to you across collaborative projects
          </p>
        </div>
      </div>

      {message.text && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: message.type === 'success' ? 'var(--accent-light)' : 'var(--danger-light)',
          color: message.type === 'success' ? 'var(--accent)' : 'var(--danger)',
          border: `1px solid ${message.type === 'success' ? 'var(--accent-border)' : 'var(--danger-border)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Progress Summary Card */}
      <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Overall Completion Rate
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Completed {completedCount} of {tasks.length} assigned task deliverables
            </p>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>
            {progressPercent}%
          </div>
        </div>
        <div className="progress-bar-container" style={{ height: '8px' }}>
          <div className="progress-bar-fill progress-primary" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            >
              {st === 'ALL' ? 'All Tasks' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '160px' }}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Task List */}
      {loading ? (
        <LoadingSpinner text="Retrieving assigned tasks..." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match the selected filter"
          description={tasks.length === 0 ? "You do not have any tasks assigned yet. Join a project team or add tasks inside your project details page." : "Try clearing status or priority filters to see other tasks."}
          actionText={tasks.length === 0 ? "Explore Projects" : "Clear Filters"}
          onAction={() => {
            if (tasks.length === 0) window.location.href = '/projects';
            else { setStatusFilter('ALL'); setPriorityFilter('ALL'); }
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--slate-900)' }}>
                    {t.title}
                  </span>
                  <PriorityBadge priority={t.priority} />
                </div>

                {t.description && (
                  <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    {t.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                  <span>Project: <strong>{t.projectTitle}</strong></span>
                  <span>Assigned by: <strong>{t.creatorName}</strong></span>
                  {t.dueDate && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={13} /> Due: {t.dueDate}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <select
                  className="form-select"
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                  style={{
                    fontWeight: 700,
                    fontSize: '0.825rem',
                    padding: '0.45rem 0.75rem',
                    backgroundColor: t.status === 'COMPLETED' ? 'var(--accent-light)' : (t.status === 'IN_PROGRESS' ? 'var(--warning-light)' : 'var(--slate-100)'),
                    color: t.status === 'COMPLETED' ? 'var(--accent)' : (t.status === 'IN_PROGRESS' ? '#b45309' : 'var(--slate-700)')
                  }}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
