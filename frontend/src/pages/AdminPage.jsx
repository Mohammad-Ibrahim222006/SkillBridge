import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminApi, projectApi } from '../services/api';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import { 
  ShieldCheck, 
  Users, 
  FolderGit2, 
  CheckSquare, 
  Target, 
  Search, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Archive,
  Layers
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'projects'
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadUsers(0, userQuery);
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats();
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadUsers = async (pageNumber = 0, query = '') => {
    try {
      const res = await adminApi.getUsers({
        page: pageNumber,
        size: 15,
        query: query || undefined,
        sortBy: 'createdAt',
        direction: 'desc'
      });
      if (res.data?.data) {
        setUsers(res.data.data.content || []);
        setTotalPages(res.data.data.totalPages || 1);
        setPage(pageNumber);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await projectApi.getAll({ size: 50 });
      if (res.data?.data?.content) {
        setProjects(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(0, userQuery);
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this account?`)) return;
    setActionLoading(true);
    try {
      await adminApi.toggleUserStatus(userId);
      setMessage({ type: 'success', text: `User status changed successfully.` });
      loadUsers(page, userQuery);
      loadStats();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update user status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'ROLE_ADMIN' ? 'ROLE_STUDENT' : 'ROLE_ADMIN';
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    setActionLoading(true);
    try {
      await adminApi.changeUserRole(userId, newRole);
      setMessage({ type: 'success', text: `User role changed to ${newRole}.` });
      loadUsers(page, userQuery);
      loadStats();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change user role.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleModerateProject = async (projectId, newStatus) => {
    setActionLoading(true);
    try {
      await adminApi.moderateProject(projectId, newStatus);
      setMessage({ type: 'success', text: `Project status updated to ${newStatus}.` });
      loadProjects();
      loadStats();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update project status.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: 40 }}>
          <ShieldAlert size={48} color="var(--danger-color)" style={{ margin: '0 auto 16px' }} />
          <h2>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            This section is reserved for platform administrators with the <code>ROLE_ADMIN</code> authority.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 0 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck color="var(--primary-color)" size={28} />
            Platform Administration
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
            System-level health metrics, user account moderation, and platform project governance.
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={() => { loadStats(); loadUsers(page, userQuery); loadProjects(); }}
          title="Refresh statistics"
        >
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: 20 }}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <button 
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('overview')}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          Overview & Metrics
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          User Management ({stats?.totalUsers || 0})
        </button>
        <button 
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('projects')}
          style={{ borderRadius: '6px 6px 0 0', borderBottom: 'none' }}
        >
          Project Moderation ({projects.length})
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div>
          {stats ? (
            <>
              <div className="grid grid-4" style={{ marginBottom: 24 }}>
                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL USERS</span>
                    <Users size={20} color="var(--primary-color)" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
                    {stats.totalUsers}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {stats.totalStudents} students &bull; {stats.totalAdmins} admins
                  </div>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL PROJECTS</span>
                    <FolderGit2 size={20} color="#10b981" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
                    {stats.totalProjects}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {stats.openProjects} open &bull; {stats.inProgressProjects} active &bull; {stats.completedProjects} done
                  </div>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKILLS IN TAXONOMY</span>
                    <Sparkles size={20} color="#8b5cf6" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
                    {stats.totalSkills}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {stats.totalUserSkills} student skill claims recorded
                  </div>
                </div>

                <div className="card stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>COLLABORATION</span>
                    <CheckSquare size={20} color="#f59e0b" />
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, margin: '8px 0 4px' }}>
                    {stats.totalTasks}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {stats.completedTasks} tasks done &bull; {stats.totalInvitations} invitations
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-2">
                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Platform Architecture Health</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Backend Engine</span>
                      <strong>Spring Boot 3.3.4 (Java 17/25)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Relational Persistence</span>
                      <strong>MySQL 8.0 (InnoDB, ACID compliant)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Security Filter Chain</span>
                      <strong>JWT Stateless Authentication with BCrypt</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Skill Matching Alg.</span>
                      <strong style={{ color: 'var(--primary-color)' }}>Deterministic Weighted Coverage (100% explainable)</strong>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Key Activity Indicators</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Active Learning Goals</span>
                      <strong>{stats.totalGoals} goals tracked</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Team Invitations Sent</span>
                      <strong>{stats.totalInvitations} total requests</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Task Completion Rate</span>
                      <strong>
                        {stats.totalTasks > 0 ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : '0%'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Open Project Ratio</span>
                      <strong>
                        {stats.totalProjects > 0 ? `${Math.round((stats.openProjects / stats.totalProjects) * 100)}%` : '0%'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading platform analytics...</div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem' }}>User Directory & Permissions</h3>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by name or email..." 
                  value={userQuery} 
                  onChange={(e) => setUserQuery(e.target.value)}
                  style={{ paddingLeft: 32, width: 260 }}
                />
              </div>
              <button type="submit" className="btn btn-secondary">Search</button>
            </form>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Skills Count</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 30 }}>No users found matching query.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <Badge variant={u.role === 'ROLE_ADMIN' ? 'danger' : 'info'}>
                          {u.role.replace('ROLE_', '')}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={u.active ? 'success' : 'neutral'}>
                          {u.active ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td>
                        {u.skills?.length || 0} skills
                      </td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            disabled={actionLoading || u.id === user?.id}
                            onClick={() => handleToggleUserStatus(u.id, u.active)}
                            title={u.active ? 'Disable account' : 'Enable account'}
                          >
                            {u.active ? <UserX size={14} color="var(--danger-color)" /> : <UserCheck size={14} color="var(--success-color)" />}
                            {u.active ? 'Disable' : 'Enable'}
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                            disabled={actionLoading || u.id === user?.id}
                            onClick={() => handleChangeRole(u.id, u.role)}
                            title="Toggle between Student and Admin"
                          >
                            {u.role === 'ROLE_ADMIN' ? 'Demote to Student' : 'Promote to Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 0}
                onClick={() => loadUsers(page - 1, userQuery)}
              >
                Previous
              </button>
              <span style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                disabled={page >= totalPages - 1}
                onClick={() => loadUsers(page + 1, userQuery)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Projects Moderation */}
      {activeTab === 'projects' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Project Portfolio Moderation</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>
            Override project life-cycle state, moderate non-compliant submissions, or archive obsolete projects.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Current Status</th>
                  <th>Moderate Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Capacity: {p.memberCount || 0}/{p.teamCapacity}
                      </div>
                    </td>
                    <td>{p.ownerName}</td>
                    <td><Badge variant="neutral">{p.category}</Badge></td>
                    <td><Badge variant="info">{p.difficulty}</Badge></td>
                    <td>
                      <Badge variant={p.status === 'OPEN' ? 'success' : p.status === 'IN_PROGRESS' ? 'primary' : 'neutral'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td>
                      <select 
                        className="form-control" 
                        style={{ padding: '4px 8px', fontSize: '0.85rem', width: 'auto' }}
                        value={p.status}
                        onChange={(e) => handleModerateProject(p.id, e.target.value)}
                        disabled={actionLoading}
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
