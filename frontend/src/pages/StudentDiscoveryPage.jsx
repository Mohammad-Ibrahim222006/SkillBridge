import React, { useState, useEffect } from 'react';
import { usersApi, skillsApi, projectsApi, invitationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ProficiencyBadge } from '../components/Badge';
import Modal from '../components/Modal';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  Users,
  Search,
  Mail,
  Globe,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Github, Linkedin } from '../components/SocialIcons';

const StudentDiscoveryPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [myOwnedProjects, setMyOwnedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [query, setQuery] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState('');

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    skillsApi.getAllSkills().then((res) => {
      if (res.success) setCatalogSkills(res.data || []);
    }).catch(console.warn);

    // If logged in, fetch projects owned by current user
    if (user) {
      projectsApi.searchProjects({ size: 50, status: 'OPEN' }).then((res) => {
        if (res.success && res.data) {
          const owned = (res.data.content || []).filter(p => p.ownerId === user.id);
          setMyOwnedProjects(owned);
          if (owned.length > 0) setSelectedProjectId(String(owned[0].id));
        }
      }).catch(console.warn);
    }
  }, [user]);

  useEffect(() => {
    loadStudents();
  }, [query, selectedSkillId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const params = { size: 18 };
      if (query.trim()) params.query = query.trim();
      if (selectedSkillId) params.skillId = parseInt(selectedSkillId, 10);

      const res = await usersApi.searchStudents(params);
      if (res.success && res.data) {
        // Exclude current user from peer discovery
        const list = (res.data.content || []).filter(s => s.id !== user?.id);
        setStudents(list);
      }
    } catch (err) {
      console.warn('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvite = (student) => {
    setTargetStudent(student);
    setIsInviteModalOpen(true);
    setMessage({ type: '', text: '' });
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      setMessage({ type: 'error', text: 'Please select one of your open projects.' });
      return;
    }

    setInviting(true);
    try {
      const res = await invitationsApi.sendInvitation(selectedProjectId, {
        inviteeId: targetStudent.id,
        message: inviteMessage.trim() || 'Join our project team on SkillBridge!',
      });

      if (res.success) {
        setIsInviteModalOpen(false);
        setInviteMessage('');
        setMessage({
          type: 'success',
          text: `Invitation successfully sent to ${targetStudent.fullName}!`
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to send invitation' });
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Find Teammates</h1>
          <p className="page-subtitle">
            Discover peer engineers with complementary technical skill sets and invite them to your projects
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

      {/* Filter Row */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by student name, education, interests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          <div>
            <select
              className="form-select"
              value={selectedSkillId}
              onChange={(e) => setSelectedSkillId(e.target.value)}
            >
              <option value="">Filter by Specific Skill</option>
              {catalogSkills.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Card Grid */}
      {loading ? (
        <LoadingSpinner text="Searching student technical profiles..." />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found matching your criteria"
          description="Try clearing your search keyword or selecting a different skill filter."
          actionText="Clear Filters"
          onAction={() => { setQuery(''); setSelectedSkillId(''); }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {students.map((s) => (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-body" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {s.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {s.fullName}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.education || 'Computer Science Student'}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {s.bio || 'Technical collaborator on SkillBridge.'}
                </p>

                {s.interests && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '0.875rem' }}>
                    <strong>Interests:</strong> {s.interests}
                  </div>
                )}

                {/* Skills badges */}
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--slate-400)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    Verified Skills
                  </div>
                  {(!s.skills || s.skills.length === 0) ? (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No skills listed yet</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {s.skills.slice(0, 5).map((sk) => (
                        <span key={sk.id} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {sk.skillName} ({sk.proficiency})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social / Portfolio Links */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                  {s.githubUrl && (
                    <a href={s.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--slate-600)' }} title="GitHub">
                      <Github size={16} />
                    </a>
                  )}
                  {s.linkedinUrl && (
                    <a href={s.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#0284c7' }} title="LinkedIn">
                      <Linkedin size={16} />
                    </a>
                  )}
                  {s.portfolioUrl && (
                    <a href={s.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }} title="Portfolio">
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              </div>

              {/* Action footer */}
              <div className="card-footer">
                <button
                  onClick={() => handleOpenInvite(s)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Mail size={14} /> Invite to My Project
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Invite ${targetStudent?.fullName || 'Student'} to Project`}
      >
        <form onSubmit={handleSendInvitation}>
          {myOwnedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
              <p style={{ marginBottom: '1rem' }}>
                You do not currently own any open projects.
              </p>
              <Link to="/projects/create" className="btn btn-primary btn-sm">
                Create a Project First
              </Link>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Select Project *</label>
                <select
                  className="form-select"
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                >
                  {myOwnedProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Capacity: {p.currentMembersCount}/{p.teamCapacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Invitation Note</label>
                <textarea
                  className="form-textarea"
                  placeholder="Hey, we'd love to collaborate with you on our project team..."
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
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};

export default StudentDiscoveryPage;
