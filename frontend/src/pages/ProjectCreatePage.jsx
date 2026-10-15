import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, skillsApi } from '../services/api';
import {
  FolderKanban,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const ProjectCreatePage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Full Stack');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [teamCapacity, setTeamCapacity] = useState(4);
  const [deadline, setDeadline] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');

  // Skill Requirements builder
  const [requirements, setRequirements] = useState([
    { skillId: '', skillName: '', requiredProficiency: 'INTERMEDIATE', weight: 'HIGH' }
  ]);
  const [catalogSkills, setCatalogSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    skillsApi.getAllSkills().then((res) => {
      if (res.success) setCatalogSkills(res.data || []);
    }).catch(console.warn);
  }, []);

  const handleAddRequirement = () => {
    setRequirements([
      ...requirements,
      { skillId: '', skillName: '', requiredProficiency: 'INTERMEDIATE', weight: 'MEDIUM' }
    ]);
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleRequirementChange = (index, field, value) => {
    const updated = [...requirements];
    updated[index][field] = value;
    if (field === 'skillId') {
      const found = catalogSkills.find(s => s.id === parseInt(value, 10));
      if (found) {
        updated[index].skillName = found.name;
      }
    }
    setRequirements(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both project title and description.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        difficulty,
        teamCapacity: parseInt(teamCapacity, 10) || 4,
        deadline: deadline || null,
        githubRepoUrl: githubRepoUrl.trim() || null,
        demoUrl: demoUrl.trim() || null,
        skillRequirements: requirements
          .filter(r => r.skillId || r.skillName.trim())
          .map(r => ({
            skillId: r.skillId ? parseInt(r.skillId, 10) : null,
            skillName: r.skillName.trim() || null,
            requiredProficiency: r.requiredProficiency,
            weight: r.weight
          }))
      };

      const res = await projectsApi.createProject(payload);
      if (res.success && res.data) {
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '880px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Post New Project</h1>
          <p className="page-subtitle">
            Specify project deliverables and configure technical skill requirements for candidate matching
          </p>
        </div>
      </div>

      {error && (
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
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <div className="form-group">
          <label className="form-label">Project Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Distributed Task Scheduler with Redis & Go"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Description *</label>
          <textarea
            className="form-textarea"
            placeholder="Detailed description of the project problem statement, architecture, target deliverables, and team responsibilities..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={{ minHeight: '140px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Full Stack">Full Stack</option>
              <option value="Backend">Backend / Systems</option>
              <option value="Frontend">Frontend / UI</option>
              <option value="Data Science">Data Science / ML</option>
              <option value="Mobile App">Mobile App</option>
              <option value="DevOps/Cloud">DevOps / Cloud</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Difficulty Level</label>
            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Team Capacity (Max Members)</label>
            <input
              type="number"
              min="1"
              max="20"
              className="form-input"
              value={teamCapacity}
              onChange={(e) => setTeamCapacity(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Completion Deadline</label>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <div className="form-group">
            <label className="form-label">GitHub Repository URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://github.com/organization/repo"
              value={githubRepoUrl}
              onChange={(e) => setGithubRepoUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Demo / Architecture URL (Optional)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://preview.app"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic Skill Requirements Section */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Required Technical Skills & Importance
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Used by the weighted skill-matching algorithm to score candidate compatibility
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRequirement}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} /> Add Skill Need
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {requirements.map((req, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr 1fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                  background: 'var(--slate-50)',
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <div>
                  <select
                    className="form-select"
                    value={req.skillId}
                    onChange={(e) => handleRequirementChange(idx, 'skillId', e.target.value)}
                  >
                    <option value="">-- Standard Skill --</option>
                    {catalogSkills.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.category})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    className="form-select"
                    value={req.requiredProficiency}
                    onChange={(e) => handleRequirementChange(idx, 'requiredProficiency', e.target.value)}
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>

                <div>
                  <select
                    className="form-select"
                    value={req.weight}
                    onChange={(e) => handleRequirementChange(idx, 'weight', e.target.value)}
                  >
                    <option value="LOW">Low Weight (1x)</option>
                    <option value="MEDIUM">Medium Weight (2x)</option>
                    <option value="HIGH">High Weight (3x)</option>
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)' }}
                    title="Remove requirement"
                    disabled={requirements.length === 1}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2.5rem' }}>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : <><Plus size={16} /> Publish Project</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectCreatePage;
