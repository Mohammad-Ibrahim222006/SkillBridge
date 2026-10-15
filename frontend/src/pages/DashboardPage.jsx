import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, tasksApi } from '../services/api';
import { MatchBadge, PriorityBadge } from '../components/Badge';
import { LoadingSpinner } from '../components/EmptyState';
import {
  Sparkles,
  Cpu,
  Compass,
  FolderKanban,
  CheckSquare,
  Mail,
  ArrowRight,
  PlusCircle,
  Target,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (taskId, newStatus) => {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Compiling live metrics and project recommendations..." />;
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div style={{ padding: '1.5rem', background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  const {
    profile,
    profileCompleteness = 0,
    totalSkills = 0,
    activeGoals = 0,
    createdProjects = 0,
    joinedProjects = 0,
    pendingInvitations = 0,
    assignedTasks = 0,
    completedTasks = 0,
    overallTaskCompletionRate = 0,
    recommendedProjects = [],
    urgentTasks = [],
    recentNotifications = []
  } = data || {};

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--palette-navy) 0%, #0c268a 55%, var(--palette-cobalt) 100%)',
        color: 'white',
        borderRadius: 'var(--radius-lg)',
        padding: '2.25rem 2.5rem',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px -10px rgba(5, 16, 59, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.25)',
        border: '1.5px solid rgba(166, 206, 253, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(166, 206, 253, 0.35)',
            padding: '0.3rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--palette-ice)',
            marginBottom: '0.85rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}>
            <Sparkles size={14} color="var(--palette-ice)" /> Student Workspace
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem', color: '#ffffff' }}>
            Welcome back, {user?.fullName || 'Student'}!
          </h1>
          <p style={{ color: 'var(--palette-ice)', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.5rem', opacity: 0.95 }}>
            {createdProjects > 0 || joinedProjects > 0
              ? `You are collaborating on ${createdProjects + joinedProjects} project(s) with ${assignedTasks} assigned task(s).`
              : 'Add your technical skills and discover projects that match your capabilities or help you learn.'}
          </p>

          {/* Profile completeness gauge */}
          <div style={{
            background: 'rgba(5, 16, 59, 0.4)',
            backdropFilter: 'blur(8px)',
            padding: '0.95rem 1.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(166, 206, 253, 0.25)',
            maxWidth: '440px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.45rem', color: '#ffffff' }}>
              <span>Profile Completeness</span>
              <span style={{ color: 'var(--palette-ice)' }}>{profileCompleteness}%</span>
            </div>
            <div className="progress-bar-container" style={{ height: '7px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div className="progress-bar-fill progress-success" style={{ width: `${profileCompleteness}%` }} />
            </div>
            {profileCompleteness < 100 && (
              <div style={{ marginTop: '0.55rem', fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                <Link to="/profile" style={{ textDecoration: 'underline', fontWeight: 700, color: 'var(--palette-ice)' }}>
                  Complete your bio, links, and skills
                </Link>{' '}
                to improve team matching.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Cpu size={24} />
          </div>
          <div>
            <div className="stat-value">{totalSkills}</div>
            <div className="stat-label">Verified Skills</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <Compass size={24} />
          </div>
          <div>
            <div className="stat-value">{activeGoals}</div>
            <div className="stat-label">Active Goals</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stat-value">{createdProjects + joinedProjects}</div>
            <div className="stat-label">Projects Active</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <CheckSquare size={24} />
          </div>
          <div>
            <div className="stat-value">{overallTaskCompletionRate}%</div>
            <div className="stat-label">Tasks Done ({completedTasks}/{assignedTasks})</div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem'
      }}>
        <Link to="/skills" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}>
          <Cpu size={18} color="var(--primary)" /> Manage Skills
        </Link>
        <Link to="/projects/create" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}>
          <PlusCircle size={18} color="var(--accent)" /> Create New Project
        </Link>
        <Link to="/skill-gap" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}>
          <Target size={18} color="#d97706" /> Skill-Gap Engine
        </Link>
        <Link to="/teams" className="btn btn-outline" style={{ justifyContent: 'flex-start', padding: '0.875rem 1rem' }}>
          <Mail size={18} color="#ec4899" />
          <span>Invitations</span>
          {pendingInvitations > 0 && (
            <span className="badge badge-warning" style={{ marginLeft: 'auto' }}>
              {pendingInvitations}
            </span>
          )}
        </Link>
      </div>

      {/* Main Grid: Recommended Projects & Right Column (Tasks & Alerts) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Top Recommended Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Recommended Projects</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ranked by compatibility with your stored skills
                </p>
              </div>
              <Link to="/projects" className="btn btn-ghost btn-sm">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              {recommendedProjects.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No open projects available right now. Check back soon or create one!
                </div>
              ) : (
                recommendedProjects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <Link to={`/projects/${p.id}`} style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.975rem' }}>
                          {p.title}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Owner: {p.ownerName} • Category: {p.category}
                        </div>
                      </div>
                      <MatchBadge score={p.userMatchScore} />
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                      {p.description.length > 110 ? p.description.substring(0, 110) + '...' : p.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {p.skillRequirements?.slice(0, 3).map((r) => (
                          <span key={r.id} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                            {r.skillName}
                          </span>
                        ))}
                      </div>
                      <Link to={`/skill-gap?projectId=${p.id}`} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                        Analyze Gap <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Tasks & Recent Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Assigned Tasks Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Assigned Tasks</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Active project assignments needing your attention
                </p>
              </div>
              <Link to="/tasks" className="btn btn-ghost btn-sm">
                Task Board <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              {urgentTasks.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No pending tasks assigned to you.
                </div>
              ) : (
                urgentTasks.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-900)' }}>
                          {t.title}
                        </span>
                        <PriorityBadge priority={t.priority} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Project: {t.projectTitle} {t.dueDate && `• Due: ${t.dueDate}`}
                      </div>
                    </div>

                    <select
                      className="form-select"
                      style={{ width: 'auto', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
                      value={t.status}
                      onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity / Notifications */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Updates</h3>
              <Link to="/notifications" className="btn btn-ghost btn-sm">
                All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ padding: '0' }}>
              {recentNotifications.length === 0 ? (
                <div style={{ padding: '1.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No recent activity notifications.
                </div>
              ) : (
                recentNotifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.875rem 1.25rem',
                      borderBottom: '1px solid var(--border)',
                      fontSize: '0.825rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{n.title}</div>
                    <div style={{ color: 'var(--slate-600)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
