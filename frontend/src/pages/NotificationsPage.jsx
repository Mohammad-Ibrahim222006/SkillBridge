import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notificationsApi } from '../services/api';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  Bell,
  CheckCircle2,
  Mail,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Users
} from 'lucide-react';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getNotifications({ page: 0, size: 50 });
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter(n => filter === 'ALL' || !n.read);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'INVITATION_RECEIVED':
      case 'INVITATION_ACCEPTED':
      case 'INVITATION_REJECTED':
        return <Mail size={18} color="var(--primary)" />;
      case 'TASK_ASSIGNED':
      case 'TASK_STATUS_CHANGED':
        return <CheckSquare size={18} color="var(--accent)" />;
      case 'TEAM_MEMBER_JOINED':
      case 'TEAM_MEMBER_REMOVED':
        return <Users size={18} color="#d97706" />;
      default:
        return <Bell size={18} color="var(--slate-500)" />;
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '840px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications Feed</h1>
          <p className="page-subtitle">
            Stay informed about team invitations, assigned tasks, and collaboration updates
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleMarkAllRead}
            className="btn btn-outline btn-sm"
          >
            <CheckCircle2 size={15} /> Mark All as Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('ALL')}
          className={`btn btn-sm ${filter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Updates ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`btn btn-sm ${filter === 'UNREAD' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Unread ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving notifications..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={filter === 'UNREAD' ? 'No unread notifications' : 'Your notification feed is empty'}
          description="When teammates invite you to projects or assign deliverables, alerts will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: n.read ? 'var(--bg-surface)' : 'var(--primary-light)',
                borderLeft: n.read ? '1px solid var(--border)' : '4px solid var(--primary)'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0
              }}>
                {getNotificationIcon(n.type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.75rem' }}>
                  {n.linkUrl && (
                    <Link
                      to={n.linkUrl}
                      onClick={() => !n.read && handleMarkRead(n.id)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    >
                      Inspect <ExternalLink size={12} />
                    </Link>
                  )}
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
