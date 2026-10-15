import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  projectsApi,
  teamsApi,
  invitationsApi,
  tasksApi
} from '../services/api';
import { StatusBadge, MatchBadge, PriorityBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { LoadingSpinner } from '../components/EmptyState';
import {
  FolderKanban,
  Users,
  Target,
  CheckSquare,
  Plus,
  Mail,
  UserCheck,
  Calendar,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { Github } from '../components/SocialIcons';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    loadProjectDetails();
  }, [id]);

  const loadProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await projectsApi.getProject(id);
      if (res.success && res.data) {
        setProject(res.data);
      }

      // Load skill match if user is authenticated
      if (user) {
        try {
          const matchRes = await projectsApi.getMatch(id);
          if (matchRes.success) {
            setMatchData(matchRes.data);
          }
        } catch (ignored) {}
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load project details' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInviteModal = async () => {
    setIsInviteModalOpen(true);
    try {
      const recRes = await teamsApi.getRecommendations(id);
      if (recRes.success && recRes.data) {
        setRecommendedCandidates(recRes.data);
      }
    } catch (e) {
      console.warn('Error loading teammate recommendations:', e);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedCandidateId) {
      setMessage({ type: 'error', text: 'Please select a student to invite.' });
      return;
    }

    setInviting(true);
    try {
      const res = await invitationsApi.sendInvitation(id, {
        inviteeId: parseInt(selectedCandidateId, 10),
        message: inviteMessage.trim() || 'Join our project team on SkillBridge!',
      });
      if (res.success) {
        setIsInviteModalOpen(false);
        setSelectedCandidateId('');
        setInviteMessage('');
        setMessage({ type: 'success', text: 'Invitation sent successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send invitation' });
    } finally {
      setInviting(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const payload = {
        title: taskTitle.trim(),
        description: taskDescription.trim(),
        priority: taskPriority,
        dueDate: taskDueDate || null,
        assigneeId: taskAssigneeId ? parseInt(taskAssigneeId, 10) : null,
      };

      const res = await tasksApi.createTask(id, payload);
      if (res.success) {
        setIsTaskModalOpen(false);
        setTaskTitle('');
        setTaskDescription('');
        setTaskAssigneeId('');
        setTaskDueDate('');
        setMessage({ type: 'success', text: 'Task created successfully!' });
        loadProjectDetails();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create task' });
    } finally {
      setCreatingTask(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this project team?')) return;
    try {
      await teamsApi.leaveProject(id);
      setMessage({ type: 'success', text: 'You have left the project team.' });
      loadProjectDetails();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to leave team' });
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this project? This cannot be undone.')) return;
    try {
      await projectsApi.deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete project' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving comprehensive project details..." />;
  }

  if (!project) {
    return (
      <div className="page-wrapper">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Project not found. <Link to="/projects">Return to Project Catalog</Link>
        </div>
      </div>
    );
  }

  const isOwner = project.currentUserOwner;
  const isMember = project.currentUserMember;

  return (
    <div className="page-wrapper">
      {/* Messages */}
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

      {/* Project Header Banner */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary">{project.category}</span>
              <span className="badge badge-neutral">{project.difficulty}</span>
              <StatusBadge status={project.status} />
              {isMember && (
                <span className="badge badge-success">
                  <UserCheck size={12} /> Team {project.currentUserRole || 'Member'}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
              {project.title}
            </h1>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Project Owner: <strong>{project.ownerName}</strong> ({project.ownerEmail})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {matchData && (
              <div style={{
                background: 'var(--slate-50)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Skill Compatibility
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {matchData.coveragePercentage}%
                </div>
              </div>
            )}

            <Link to={`/skill-gap?projectId=${project.id}`} className="btn btn-outline">
              <Target size={16} /> Skill-Gap Analysis
            </Link>

            {isOwner && (
              <>
                <button onClick={handleOpenInviteModal} className="btn btn-primary">
                  <Users size={16} /> Invite Teammates
                </button>
                <button onClick={handleDeleteProject} className="btn btn-danger btn-sm" title="Delete Project">
                  <Trash2 size={16} />
                </button>
              </>
            )}

            {isMember && !isOwner && (
              <button onClick={handleLeaveTeam} className="btn btn-outline btn-sm" style={{ color: 'var(--danger)' }}>
                <LogOut size={16} /> Leave Team
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: '0.975rem', color: 'var(--slate-700)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {project.description}
        </p>

        {/* Links & Deadlines */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          {project.deadline && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={15} /> Target Deadline: <strong>{project.deadline}</strong>
            </div>
          )}
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              <Github size={15} /> Source Repository <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Two Column Layout: Requirements & Team */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Required Technical Skills */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Required Technical Skills</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Proficiencies and importance weights for successful contribution
              </p>
            </div>
          </div>
          <div className="card-body">
            {(!project.skillRequirements || project.skillRequirements.length === 0) ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No specific requirements listed. Open to all students.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {project.skillRequirements.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                        {r.skillName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({r.category || 'General'})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-primary">{r.requiredProficiency}</span>
                      <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                        Weight: {r.weight}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Team Members */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Project Team</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Capacity: {project.members?.length || 0} / {project.teamCapacity} members
              </p>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {project.members?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem'
                    }}>
                      {m.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                        {m.fullName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {m.email}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">{m.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Project Tasks & Deliverables Section */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Project Tasks & Deliverables</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live task progress: <strong>{project.taskCompletionPercentage}% complete</strong>
            </p>
          </div>
          {isMember && (
            <button onClick={() => setIsTaskModalOpen(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>
        <div className="card-body">
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="progress-bar-container" style={{ height: '8px' }}>
              <div
                className="progress-bar-fill progress-success"
                style={{ width: `${project.taskCompletionPercentage}%` }}
              />
            </div>
          </div>

          {(!project.tasks || project.tasks.length === 0) ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
              No tasks logged yet for this project.
            </p>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {project.tasks.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.title}</td>
                      <td>{t.assigneeName || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>
                      <td><PriorityBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.dueDate || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invite Teammates Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Teammates to Project"
        maxWidth="640px"
      >
        <form onSubmit={handleSendInvite}>
          <div className="form-group">
            <label className="form-label">
              Recommended Students with Complementary Skills
            </label>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              These candidates possess skills that cover deficits in your project requirements:
            </p>
            <select
              className="form-select"
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              required
            >
              <option value="">-- Choose a student candidate --</option>
              {recommendedCandidates.map((c) => (
                <option key={c.candidateId} value={c.candidateId}>
                  {c.fullName} — {c.explanation}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Invitation Message</label>
            <textarea
              className="form-textarea"
              placeholder="Hi! We saw your proficiency in React and would love to have you on our team..."
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={inviting}
            >
              {inviting ? <div className="spinner" /> : <><Mail size={16} /> Send Invitation</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Project Task"
      >
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Implement JWT authentication filter"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Details on what needs to be delivered..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Assignee (Team Members)</label>
            <select
              className="form-select"
              value={taskAssigneeId}
              onChange={(e) => setTaskAssigneeId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {project.members?.map((m) => (
                <option key={m.userId} value={m.userId}>
                  {m.fullName} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingTask}
            >
              {creatingTask ? <div className="spinner" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
