import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import { StatusBadge, MatchBadge } from '../components/Badge';
import { EmptyState, LoadingSpinner } from '../components/EmptyState';
import {
  FolderKanban,
  Search,
  Filter,
  Plus,
  ArrowRight,
  Users,
  Target,
  Clock,
  Sparkles
} from 'lucide-react';

const ProjectDiscoveryPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadProjects();
  }, [query, status, difficulty, category, sortBy, page]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: 9,
        sortBy,
        direction: 'desc',
      };
      if (query.trim()) params.query = query.trim();
      if (status) params.status = status;
      if (difficulty) params.difficulty = difficulty;
      if (category && category !== 'ALL') params.category = category;

      const res = await projectsApi.searchProjects(params);
      if (res.success && res.data) {
        setProjects(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setQuery('');
    setStatus('');
    setDifficulty('');
    setCategory('');
    setSortBy('createdAt');
    setPage(0);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Explore Projects</h1>
          <p className="page-subtitle">
            Discover student projects, inspect required tech stacks, and find teams where your skills fit
          </p>
        </div>
        <Link to="/projects/create" className="btn btn-primary">
          <Plus size={16} /> Post New Project
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search title, skills..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>

          {/* Category */}
          <select
            className="form-select"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(0); }}
          >
            <option value="">All Categories</option>
            <option value="Full Stack">Full Stack</option>
            <option value="Data Science">Data Science</option>
            <option value="Mobile App">Mobile App</option>
            <option value="DevOps/Cloud">DevOps/Cloud</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="General">General</option>
          </select>

          {/* Difficulty */}
          <select
            className="form-select"
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setPage(0); }}
          >
            <option value="">All Difficulties</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          {/* Status */}
          <select
            className="form-select"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open for Teammates</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {(query || status !== 'OPEN' || difficulty || category) && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button
              onClick={handleClearFilters}
              style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Searching projects with compatibility calculations..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects match your filter criteria"
          description="Try broadening your search keywords or resetting your category and status filters."
          actionText="Reset All Filters"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {projects.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div className="card-header">
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <span className="badge badge-primary">{p.category}</span>
                    <span className="badge badge-neutral">{p.difficulty}</span>
                  </div>
                  <MatchBadge score={p.userMatchScore} />
                </div>

                <div className="card-body" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--slate-900)' }}>
                    {p.title}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>
                    Created by: <strong>{p.ownerName}</strong>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {p.description.length > 140 ? p.description.substring(0, 140) + '...' : p.description}
                  </p>

                  {/* Requirements Preview */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Required Technologies
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {p.skillRequirements?.map((r) => (
                        <span key={r.id} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {r.skillName} ({r.requiredProficiency})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meta stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} /> {p.currentMembersCount}/{p.teamCapacity} Members
                    </span>
                    {p.deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> Deadline: {p.deadline}
                      </span>
                    )}
                  </div>
                </div>

                <div className="card-footer" style={{ justifyContent: 'space-between' }}>
                  <Link
                    to={`/skill-gap?projectId=${p.id}`}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                  >
                    <Target size={15} /> Analyze Gap
                  </Link>
                  <Link to={`/projects/${p.id}`} className="btn btn-primary btn-sm">
                    View Project <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalElements > 9 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span style={{ padding: '0.375rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                Page {page + 1} of {Math.ceil(totalElements / 9)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={(page + 1) * 9 >= totalElements}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProjectDiscoveryPage;
