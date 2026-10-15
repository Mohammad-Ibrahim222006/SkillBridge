import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { invitationsApi, projectsApi, teamsApi } from '../services/api';
import { StatusBadge } from '../components/Badge';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  UserCheck,
  Mail,
  CheckCircle2,
  XCircle,
  FolderKanban,
  Trash2,
  LogOut,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

const TeamManagementPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invitations');
  const [invitations, setInvitations] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'invitations') {
        const res = await invitationsApi.getUserInvitations();
        if (res.success) {
          setInvitations(res.data || []);
        }
      } else {
        const res = await projectsApi.searchProjects({ size: 50 });
        if (res.success && res.data) {
          // Filter projects where user is owner or member
          setMyProjects(res.data.content || []);
        }
      }
    } catch (err) {
      console.warn('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (invitationId, projectTitle) => {
    try {
      const res = await invitationsApi.acceptInvitation(invitationId);
      if (res.success) {
        setMessage({ type: 'success', text: `Accepted invitation! You are now a team member on "${projectTitle}".` });
        loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to accept invitation' });
    }
  };

  const handleRejectInvite = async (invitationId) => {
    try {
      const res = await invitationsApi.rejectInvitation(invitationId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Invitation declined.' });
        loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to decline invitation' });
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams & Collaboration</h1>
          <p className="page-subtitle">
            Manage your project memberships, sent/received invitations, and team rosters
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.75rem' }}>
        <button
          onClick={() => { setActiveTab('invitations'); setMessage({ type: '', text: '' }); }}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeTab === 'invitations' ? 'var(--primary)' : 'var(--slate-600)',
            borderBottom: activeTab === 'invitations' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Mail size={16} /> Received Invitations
        </button>
        <button
          onClick={() => { setActiveTab('projects'); setMessage({ type: '', text: '' }); }}
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            color: activeTab === 'projects' ? 'var(--primary)' : 'var(--slate-600)',
            borderBottom: activeTab === 'projects' ? '2px solid var(--primary)' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FolderKanban size={16} /> My Teams & Projects
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading invitations and team rosters..." />
      ) : activeTab === 'invitations' ? (
        invitations.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No project invitations"
            description="You have no pending invitations. Explore open projects or complete your skills to get noticed by project owners!"
            actionText="Explore Projects"
            onAction={() => window.location.href = '/projects'}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {invitations.map((inv) => (
              <div
                key={inv.id}
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <Link to={`/projects/${inv.projectId}`} style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--slate-900)' }}>
                      {inv.projectTitle}
                    </Link>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Invited by: <strong>{inv.inviterName}</strong> • Role: <strong>{inv.role}</strong> • Received: {new Date(inv.createdAt).toLocaleDateString()}
                  </div>
                  {inv.message && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.5rem', fontStyle: 'italic', background: 'var(--slate-50)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
                      "{inv.message}"
                    </p>
                  )}
                </div>

                {inv.status === 'PENDING' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAcceptInvite(inv.id, inv.projectTitle)}
                      className="btn btn-primary btn-sm"
                    >
                      <CheckCircle2 size={15} /> Accept Invitation
                    </button>
                    <button
                      onClick={() => handleRejectInvite(inv.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <XCircle size={15} /> Decline
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Responded: {inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString() : '—'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* My Projects Tab */
        myProjects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No collaborative projects found"
            description="You have not created or joined any projects yet."
            actionText="Create Project"
            onAction={() => window.location.href = '/projects/create'}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {myProjects.map((p) => (
              <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">
                  <span className="badge badge-primary">{p.category}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className="card-body" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.35rem' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Owner: {p.ownerName} {p.ownerId === user?.id && <span className="badge badge-neutral" style={{ marginLeft: '4px' }}>You</span>}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    Team Members: <strong>{p.currentMembersCount} / {p.teamCapacity}</strong>
                  </div>
                </div>
                <div className="card-footer">
                  <Link to={`/projects/${p.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    Manage Team & Tasks <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TeamManagementPage;
