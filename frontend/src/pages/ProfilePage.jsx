import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { ProficiencyBadge } from '../components/Badge';
import { LoadingSpinner } from '../components/EmptyState';
import {
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  Globe,
  GraduationCap,
  Sparkles,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { Github, Linkedin } from '../components/SocialIcons';

const ProfilePage = () => {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [education, setEducation] = useState('');
  const [interests, setInterests] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await profileApi.getProfile();
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setFullName(p.fullName || '');
        setBio(p.bio || '');
        setEducation(p.education || '');
        setInterests(p.interests || '');
        setGithubUrl(p.githubUrl || '');
        setLinkedinUrl(p.linkedinUrl || '');
        setPortfolioUrl(p.portfolioUrl || '');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setSaving(true);

    try {
      const res = await profileApi.updateProfile({
        fullName: fullName.trim(),
        bio: bio.trim(),
        education: education.trim(),
        interests: interests.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        portfolioUrl: portfolioUrl.trim(),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setSuccessMsg('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading student profile details..." />;
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Profile</h1>
          <p className="page-subtitle">
            Manage your background, verified skills, and external portfolio links
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
            Completeness:
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {profile?.completenessPercentage || 0}% Complete
          </span>
        </div>
      </div>

      {successMsg && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent)',
          border: '1px solid var(--accent-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Profile Edit Form */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="card-header">
            <h3 className="card-title">Personal & Academic Info</h3>
          </div>
          <form onSubmit={handleSave} className="card-body">
            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="text"
                className="form-input"
                value={profile?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-500)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Education / Academic Institution</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. B.Tech in CSE, Class of 2026"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio & Career Objective</label>
              <textarea
                className="form-textarea"
                placeholder="Brief summary of your background, architectural interests, and project ambitions..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests & Preferred Domains</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Microservices, Full Stack Web, Cloud, AI"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
              />
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '1.5rem 0 1rem', color: 'var(--slate-900)' }}>
              External Portfolio & Social Links
            </h4>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Github size={15} /> GitHub Profile URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://github.com/your-username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Linkedin size={15} /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://linkedin.com/in/your-profile"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={15} /> Personal Portfolio / Blog URL
              </label>
              <input
                type="url"
                className="form-input"
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {saving ? <div className="spinner" /> : <><Save size={16} /> Save Profile Changes</>}
            </button>
          </form>
        </div>

        {/* Right Column: Skills & Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Skills Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Technical Skills</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Used for project matching and teammate recommendations
                </p>
              </div>
              <Link to="/skills" className="btn btn-outline btn-sm">
                <Cpu size={14} /> Add / Manage
              </Link>
            </div>
            <div className="card-body">
              {(!profile?.skills || profile.skills.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                    No skills added yet. Add your proficiencies to get project matches!
                  </p>
                  <Link to="/skills" className="btn btn-primary btn-sm">
                    Add Your First Skill
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {profile.skills.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'var(--slate-50)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                          {s.skillName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Category: {s.category || 'General'} {s.yearsOfExperience > 0 && `• ${s.yearsOfExperience} yrs exp`}
                        </div>
                      </div>
                      <ProficiencyBadge level={s.proficiency} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Project Participation */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Participation</h3>
              <Link to="/projects" className="btn btn-ghost btn-sm">
                Browse Projects <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                  {profile?.projectsCreatedCount || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Projects Authored
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {profile?.projectsJoinedCount || 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Teams Joined
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
