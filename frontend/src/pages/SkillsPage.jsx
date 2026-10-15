import React, { useState, useEffect } from 'react';
import { profileApi, skillsApi } from '../services/api';
import Modal from '../components/Modal';
import { ProficiencyBadge } from '../components/Badge';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  Cpu,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles
} from 'lucide-react';

const SkillsPage = () => {
  const [mySkills, setMySkills] = useState([]);
  const [allCatalogSkills, setAllCatalogSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customCategory, setCustomCategory] = useState('General');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');
  const [yearsOfExperience, setYearsOfExperience] = useState(1.0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [skillsRes, catalogRes] = await Promise.all([
        profileApi.getUserSkills(),
        skillsApi.getAllSkills()
      ]);

      if (skillsRes.success) {
        setMySkills(skillsRes.data || []);
      }
      if (catalogRes.success) {
        setAllCatalogSkills(catalogRes.data || []);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to load skills data' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let payload;
      if (selectedSkillId) {
        payload = {
          skillId: parseInt(selectedSkillId, 10),
          proficiency,
          yearsOfExperience: parseFloat(yearsOfExperience) || 0.0,
        };
      } else if (customSkillName.trim()) {
        payload = {
          skillName: customSkillName.trim(),
          category: customCategory,
          proficiency,
          yearsOfExperience: parseFloat(yearsOfExperience) || 0.0,
        };
      } else {
        throw new Error('Please select an existing skill or enter a new skill name.');
      }

      const res = await profileApi.addUserSkill(payload);
      if (res.success) {
        setIsModalOpen(false);
        setSelectedSkillId('');
        setCustomSkillName('');
        setMessage({ type: 'success', text: 'Skill saved successfully!' });
        loadData();
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to add skill' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to remove ${skillName} from your profile?`)) {
      return;
    }

    try {
      await profileApi.deleteUserSkill(skillId);
      setMessage({ type: 'success', text: `Removed ${skillName} from profile.` });
      setMySkills(mySkills.filter(s => s.skillId !== skillId));
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete skill' });
    }
  };

  const categories = ['ALL', ...new Set(mySkills.map(s => s.category || 'General'))];

  const filteredSkills = mySkills.filter((s) => {
    const matchesSearch = s.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || (s.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Technical Skills</h1>
          <p className="page-subtitle">
            Configure your technical proficiencies for accurate project matching and team recommendations
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setMessage({ type: '', text: '' }); }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Add Technical Skill
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

      {/* Filters & Search Row */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Filter skills by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>

        {/* Category Pill Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <LoadingSpinner text="Loading skill proficiencies..." />
      ) : filteredSkills.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title={searchQuery ? 'No matching skills found' : 'No technical skills added yet'}
          description={searchQuery ? 'Try clearing your search query or category filter.' : 'Add your programming languages, frameworks, and databases to discover projects tailored to you.'}
          actionText={searchQuery ? 'Clear Filters' : 'Add First Skill'}
          onAction={() => {
            if (searchQuery || selectedCategory !== 'ALL') {
              setSearchQuery('');
              setSelectedCategory('ALL');
            } else {
              setIsModalOpen(true);
            }
          }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredSkills.map((s) => (
            <div
              key={s.id}
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {s.skillName}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.category || 'General'}
                    </span>
                  </div>
                  <ProficiencyBadge level={s.proficiency} />
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                  Experience: <strong>{s.yearsOfExperience || 0} years</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => handleDeleteSkill(s.skillId, s.skillName)}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--danger)' }}
                  title="Remove Skill"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Skill Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Technical Skill"
      >
        <form onSubmit={handleAddSkill}>
          <div className="form-group">
            <label className="form-label">Select Standard Skill from Catalog</label>
            <select
              className="form-select"
              value={selectedSkillId}
              onChange={(e) => {
                setSelectedSkillId(e.target.value);
                if (e.target.value) setCustomSkillName('');
              }}
            >
              <option value="">-- Choose from standard catalog --</option>
              {allCatalogSkills.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'center', margin: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
            — OR ADD CUSTOM SKILL —
          </div>

          <div className="form-group">
            <label className="form-label">Custom Skill Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. FastAPI, Tailwind, PyTorch"
              value={customSkillName}
              onChange={(e) => {
                setCustomSkillName(e.target.value);
                if (e.target.value) setSelectedSkillId('');
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              disabled={!!selectedSkillId}
            >
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Database">Database</option>
              <option value="DevOps">DevOps</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/Data">AI/Data</option>
              <option value="Mobile">Mobile</option>
              <option value="General">General</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Proficiency Level *</label>
            <select
              className="form-select"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              required
            >
              <option value="BEGINNER">BEGINNER — Fundamental knowledge, starter tutorials</option>
              <option value="INTERMEDIATE">INTERMEDIATE — Practical experience, builds features</option>
              <option value="ADVANCED">ADVANCED — Deep architectural mastery, production ready</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Years of Practical Experience</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="20"
              className="form-input"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
            />
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
              {saving ? <div className="spinner" /> : 'Save to Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SkillsPage;
