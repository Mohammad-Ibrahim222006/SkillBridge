import React, { useState, useEffect } from 'react';
import { goalsApi, skillsApi } from '../services/api';
import Modal from '../components/Modal';
import { StatusBadge } from '../components/Badge';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  Compass,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Target
} from 'lucide-react';

const LearningGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetSkillId, setTargetSkillId] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [status, setStatus] = useState('NOT_STARTED');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadGoals();
    skillsApi.getAllSkills().then((res) => {
      if (res.success) setCatalogSkills(res.data || []);
    }).catch(console.warn);
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const res = await goalsApi.getGoals();
      if (res.success) {
        setGoals(res.data || []);
      }
    } catch (err) {
      console.warn('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        targetSkillId: targetSkillId ? parseInt(targetSkillId, 10) : null,
        targetDate: targetDate || null,
        status,
        progressPercentage: parseInt(progressPercentage, 10) || 0,
      };

      const res = await goalsApi.createGoal(payload);
      if (res.success) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setTargetSkillId('');
        setTargetDate('');
        setProgressPercentage(0);
        setStatus('NOT_STARTED');
        setMessage({ type: 'success', text: 'Learning goal created successfully!' });
        loadGoals();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create goal' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async (goal, newProgress) => {
    const p = Math.max(0, Math.min(100, parseInt(newProgress, 10)));
    let newStatus = goal.status;
    if (p === 100) newStatus = 'COMPLETED';
    else if (p > 0 && goal.status === 'NOT_STARTED') newStatus = 'IN_PROGRESS';

    try {
      await goalsApi.updateGoal(goal.id, {
        title: goal.title,
        description: goal.description,
        targetSkillId: goal.targetSkillId,
        targetDate: goal.targetDate,
        status: newStatus,
        progressPercentage: p,
      });

      setGoals(goals.map(g => g.id === goal.id ? { ...g, progressPercentage: p, status: newStatus } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (goalId, goalTitle) => {
    if (!window.confirm(`Delete learning goal "${goalTitle}"?`)) return;
    try {
      await goalsApi.deleteGoal(goalId);
      setMessage({ type: 'success', text: 'Learning goal deleted.' });
      setGoals(goals.filter(g => g.id !== goalId));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete goal' });
    }
  };

  const completedCount = goals.filter(g => g.status === 'COMPLETED').length;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Learning Goals</h1>
          <p className="page-subtitle">
            Set deliberate learning objectives, link them to skills gaps, and track your progress
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setMessage({ type: '', text: '' }); }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Set Learning Goal
        </button>
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

      {/* Progress Card */}
      <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
              Skill Acquisition Progress
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Completed {completedCount} of {goals.length} active learning objectives
            </p>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>
            {goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%
          </div>
        </div>
        <div className="progress-bar-container" style={{ height: '8px' }}>
          <div
            className="progress-bar-fill progress-success"
            style={{ width: `${goals.length > 0 ? (completedCount / goals.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <LoadingSpinner text="Loading learning goals..." />
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No learning goals set yet"
          description="Identify your skill gaps or set personal milestones to systematically improve your engineering capabilities."
          actionText="Set First Goal"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {goals.map((g) => (
            <div key={g.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                {g.targetSkillName ? (
                  <span className="badge badge-primary">
                    <Target size={12} /> {g.targetSkillName}
                  </span>
                ) : (
                  <span className="badge badge-neutral">General Milestone</span>
                )}
                <StatusBadge status={g.status} />
              </div>

              <div className="card-body" style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem' }}>
                  {g.title}
                </h3>

                {g.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {g.description}
                  </p>
                )}

                {/* Interactive Progress Slider */}
                <div style={{ marginTop: 'auto', background: 'var(--slate-50)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--slate-700)' }}>
                    <span>Progress</span>
                    <span>{g.progressPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progressPercentage}
                    onChange={(e) => handleUpdateProgress(g, e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100% (Done)</span>
                  </div>
                </div>

                {g.targetDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.875rem' }}>
                    <Calendar size={13} /> Target Date: <strong>{g.targetDate}</strong>
                  </div>
                )}
              </div>

              <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Added {new Date(g.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDeleteGoal(g.id, g.title)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                  title="Delete Goal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Personal Learning Goal"
      >
        <form onSubmit={handleCreateGoal}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Master Docker Compose & Multi-stage Builds"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Action Plan</label>
            <textarea
              className="form-textarea"
              placeholder="What specific tutorials, exercises, or project implementations will achieve this?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Technology Skill (Optional)</label>
            <select
              className="form-select"
              value={targetSkillId}
              onChange={(e) => setTargetSkillId(e.target.value)}
            >
              <option value="">-- No specific skill link --</option>
              {catalogSkills.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Completion Date</label>
              <input
                type="date"
                className="form-input"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Progress ({progressPercentage}%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? <div className="spinner" /> : 'Save Goal'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LearningGoalsPage;
