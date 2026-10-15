import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { projectsApi, goalsApi } from '../services/api';
import { MatchBadge, ProficiencyBadge } from '../components/Badge';
import { LoadingSpinner } from '../components/EmptyState';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  BookOpen,
  Plus,
  ArrowRight,
  TrendingUp,
  FolderKanban
} from 'lucide-react';

const SkillGapAnalysisPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addingGoalId, setAddingGoalId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    projectsApi.searchProjects({ size: 30, status: 'OPEN' }).then((res) => {
      if (res.success && res.data) {
        setProjectsList(res.data.content || []);
        if (!selectedProjectId && res.data.content?.length > 0) {
          setSelectedProjectId(String(res.data.content[0].id));
        }
      }
    }).catch(console.warn);
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadGapAnalysis(selectedProjectId);
      setSearchParams({ projectId: selectedProjectId });
    }
  }, [selectedProjectId]);

  const loadGapAnalysis = async (projectId) => {
    setLoading(true);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await projectsApi.getSkillGap(projectId);
      if (res.success && res.data) {
        setGapData(res.data);
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to analyze skill gap' });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertGoal = async (suggestion, index) => {
    setAddingGoalId(index);
    setActionMessage({ type: '', text: '' });

    try {
      const res = await goalsApi.createGoal({
        title: suggestion.suggestedTitle,
        description: `${suggestion.reason}\n\nRecommended Action: ${suggestion.suggestedAction}`,
        targetSkillId: suggestion.skillId,
        targetSkillName: suggestion.skillName,
        status: 'NOT_STARTED',
        progressPercentage: 0,
      });

      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `Goal "${suggestion.suggestedTitle}" created and saved to your Learning Goals!`
        });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create goal' });
    } finally {
      setAddingGoalId(null);
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'MINIMAL':
        return <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>Minimal Gap (Ready to Build)</span>;
      case 'MODERATE':
        return <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>Moderate Gap (Minor Learning Needed)</span>;
      case 'HIGH':
        return <span className="badge badge-warning" style={{ fontSize: '0.85rem', color: '#ea580c' }}>High Gap (Targeted Study Advised)</span>;
      case 'CRITICAL':
      default:
        return <span className="badge badge-danger" style={{ fontSize: '0.85rem' }}>Significant Gap (Foundational Prep Needed)</span>;
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deterministic Skill-Gap Engine</h1>
          <p className="page-subtitle">
            Compare your proficiencies against target project specifications and generate prioritized learning goals
          </p>
        </div>
      </div>

      {actionMessage.text && (
        <div style={{
          padding: '0.875rem 1.25rem',
          backgroundColor: actionMessage.type === 'success' ? 'var(--accent-light)' : 'var(--danger-light)',
          color: actionMessage.type === 'success' ? 'var(--accent)' : 'var(--danger)',
          border: `1px solid ${actionMessage.type === 'success' ? 'var(--accent-border)' : 'var(--danger-border)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}>
          {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {actionMessage.text}
        </div>
      )}

      {/* Project Selector Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-700)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FolderKanban size={18} color="var(--primary)" /> Select Target Project:
          </label>
          <select
            className="form-select"
            style={{ flex: 1, minWidth: '260px' }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projectsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.category} • {p.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Computing weighted requirement coverage and gap breakdown..." />
      ) : !gapData ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Please select a project to analyze requirements.
        </div>
      ) : (
        <>
          {/* Analysis KPI Summary */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem', background: 'var(--bg-glass-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    {gapData.projectTitle}
                  </span>
                  {getSeverityBadge(gapData.overallGapSeverity)}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Satisfied: <strong>{gapData.satisfiedRequirementsCount}</strong> • Proficiency Gaps: <strong>{gapData.improvableRequirementsCount}</strong> • Missing: <strong>{gapData.missingRequirementsCount}</strong>
                </p>
              </div>

              {/* Coverage Gauge */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Weighted Coverage
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  color: gapData.coveragePercentage >= 75 ? 'var(--accent)' : (gapData.coveragePercentage >= 50 ? 'var(--warning)' : 'var(--danger)')
                }}>
                  {gapData.coveragePercentage}%
                </div>
              </div>
            </div>

            <div className="progress-bar-container" style={{ height: '10px', marginTop: '1.25rem' }}>
              <div
                className={`progress-bar-fill ${gapData.coveragePercentage >= 75 ? 'progress-success' : (gapData.coveragePercentage >= 50 ? 'progress-warning' : 'progress-danger')}`}
                style={{ width: `${gapData.coveragePercentage}%` }}
              />
            </div>
          </div>

          {/* 3 Column Requirement Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Column 1: Satisfied Skills */}
            <div className="card">
              <div className="card-header" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} color="var(--accent)" />
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>
                    Satisfied Requirements ({gapData.satisfiedRequirements?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="card-body">
                {(!gapData.satisfiedRequirements || gapData.satisfiedRequirements.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    None of the required skills are currently satisfied at the required proficiency.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {gapData.satisfiedRequirements.map((r, i) => (
                      <div key={i} style={{ padding: '0.75rem', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--accent-border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#065f46' }}>
                          {r.skillName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>
                          Your Level: <strong>{r.userProficiency}</strong> (Meets {r.requiredProficiency}) • Weight: {r.weight}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Proficiency Gaps */}
            <div className="card">
              <div className="card-header" style={{ borderLeft: '4px solid var(--warning)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="var(--warning)" />
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>
                    Proficiency Improvement Needed ({gapData.improvableRequirements?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="card-body">
                {(!gapData.improvableRequirements || gapData.improvableRequirements.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    No partial matches. All skills you have already meet the required level.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {gapData.improvableRequirements.map((r, i) => (
                      <div key={i} style={{ padding: '0.75rem', background: 'var(--warning-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--warning-border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#92400e' }}>
                          {r.skillName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '2px' }}>
                          Have <strong>{r.userProficiency}</strong>, needs <strong>{r.requiredProficiency}</strong> (Weight: {r.weight})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Missing Skills */}
            <div className="card">
              <div className="card-header" style={{ borderLeft: '4px solid var(--danger)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <XCircle size={18} color="var(--danger)" />
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>
                    Missing Technical Skills ({gapData.missingRequirements?.length || 0})
                  </h3>
                </div>
              </div>
              <div className="card-body">
                {(!gapData.missingRequirements || gapData.missingRequirements.length === 0) ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    No missing skills! You have at least some level in every required technology.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {gapData.missingRequirements.map((r, i) => (
                      <div key={i} style={{ padding: '0.75rem', background: 'var(--danger-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--danger-border)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#991b1b' }}>
                          {r.skillName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>
                          Requires: <strong>{r.requiredProficiency}</strong> • Importance: {r.weight}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actionable Learning Suggestions & Conversion */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Prioritized Learning Recommendations</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Generated using deterministic gap rules based on project weight and proficiency difference
                </p>
              </div>
              <Link to="/goals" className="btn btn-outline btn-sm">
                View My Saved Goals <ArrowRight size={14} />
              </Link>
            </div>
            <div className="card-body">
              {(!gapData.learningSuggestions || gapData.learningSuggestions.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--accent)' }}>
                  <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontWeight: 700 }}>Zero skill gaps! You fully satisfy this project's requirements.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {gapData.learningSuggestions.map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1.25rem',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.975rem', color: 'var(--slate-900)' }}>
                            {s.suggestedTitle}
                          </span>
                          <span className={`badge ${s.priority === 'HIGH' ? 'badge-danger' : (s.priority === 'MEDIUM' ? 'badge-warning' : 'badge-neutral')}`}>
                            {s.priority} Priority
                          </span>
                        </div>
                        <p style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '0.5rem' }}>
                          {s.reason}
                        </p>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', background: 'var(--slate-50)', padding: '0.4rem 0.65rem', borderRadius: '4px' }}>
                          💡 <strong>Recommended Path:</strong> {s.suggestedDescription}
                        </div>
                      </div>

                      <button
                        onClick={() => handleConvertGoal(s, idx)}
                        disabled={addingGoalId === idx}
                        className="btn btn-outline btn-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {addingGoalId === idx ? (
                          <div className="spinner" />
                        ) : (
                          <><Plus size={14} /> Add to Learning Goals</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SkillGapAnalysisPage;
