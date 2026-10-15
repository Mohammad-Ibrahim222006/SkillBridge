import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsApi, skillsApi } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  Target,
  Users,
  Compass,
  CheckCircle2,
  FolderKanban,
  Cpu,
  ShieldCheck,
  Code2,
  Layers,
  Award
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        const [projRes, skillRes] = await Promise.allSettled([
          projectsApi.searchProjects({ page: 0, size: 3 }),
          skillsApi.getAllSkills()
        ]);

        if (projRes.status === 'fulfilled' && projRes.value?.success) {
          setFeaturedProjects(projRes.value.data?.content || []);
        }
        if (skillRes.status === 'fulfilled' && skillRes.value?.success) {
          setSkillsList((skillRes.value.data || []).slice(0, 8));
        }
      } catch (err) {
        console.warn('Could not load landing preview:', err);
      }
    };

    loadPreviewData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        background: 'radial-gradient(ellipse at top, #f0f4ff 0%, #f8fafc 70%)',
        padding: '5rem 1.5rem 4rem',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.75rem',
            border: '1px solid var(--primary-border)'
          }}>
            <Sparkles size={16} /> Intelligent Student Collaboration & Skill Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            color: 'var(--slate-900)',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem'
          }}>
            Bridge Your Skills. Build Real Projects. <br />
            <span style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Find Complementary Teammates.
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--slate-600)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6
          }}>
            SkillBridge helps students understand their technical proficiencies, discover suitable academic and open-source projects, pinpoint skill gaps with deterministic algorithms, and collaborate on real deliverables.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Student Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Create Student Profile <ArrowRight size={18} />
                </Link>
                <Link to="/projects" className="btn btn-outline btn-lg">
                  Explore Active Projects
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Credentials Callout */}
          <div style={{
            marginTop: '2.5rem',
            padding: '0.875rem 1.25rem',
            background: 'white',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1.5rem',
            fontSize: '0.825rem',
            color: 'var(--slate-600)',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>Demo Access:</span>
            <span>Student: <code style={{ color: 'var(--primary)', fontWeight: 600 }}>alex@skillbridge.edu</code> / <code style={{ color: 'var(--primary)' }}>Student@123</code></span>
            <span>Admin: <code style={{ color: 'var(--danger)', fontWeight: 600 }}>admin@skillbridge.edu</code> / <code style={{ color: 'var(--danger)' }}>Admin@123</code></span>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Engineered for Modern Engineering Students
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1rem' }}>
            Everything you need for major projects, skill portfolios, and structured peer collaboration.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {/* Card 1 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Target size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--slate-900)' }}>
              Deterministic Skill Matching
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              No opaque black-box AI. Our transparent weighted algorithm calculates exact requirement coverage based on your verified proficiency level (Beginner, Intermediate, Advanced).
            </p>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Compass size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--slate-900)' }}>
              Actionable Gap Analysis
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Break down satisfied, improvable, and missing skills. Generate prioritized learning roadmaps with one-click conversion into tracked personal learning goals.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--warning-light)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--slate-900)' }}>
              Complementary Teammate Finder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Find peers whose skill sets cover your project’s missing requirements. Send validated team invitations with capacity safeguards and role assignments.
            </p>
          </div>

          {/* Card 4 */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#fdf2f8',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <FolderKanban size={24} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.625rem', color: 'var(--slate-900)' }}>
              Team Task Board & Progress
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Organize project deliverables with task assignments, priority levels, and due dates. Real-time project completion percentages computed directly from database entries.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      {featuredProjects.length > 0 && (
        <section style={{ backgroundColor: 'var(--slate-50)', padding: '5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Active Collaborative Projects
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Explore student initiatives currently seeking collaborators.
                </p>
              </div>
              <Link to="/projects" className="btn btn-outline btn-sm">
                View All Projects <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {featuredProjects.map((p) => (
                <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-header">
                    <div>
                      <span className="badge badge-primary">{p.category}</span>
                      <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>{p.difficulty}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Capacity: {p.currentMembersCount}/{p.teamCapacity}
                    </span>
                  </div>
                  <div className="card-body" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                      {p.description.length > 130 ? p.description.substring(0, 130) + '...' : p.description}
                    </p>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                        Required Skills:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                        {p.skillRequirements?.slice(0, 4).map((r) => (
                          <span key={r.id} className="badge badge-neutral">
                            {r.skillName} ({r.requiredProficiency})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link to={`/projects/${p.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                      Inspect Requirements & Match
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        backgroundColor: 'var(--slate-900)',
        color: 'var(--slate-400)',
        padding: '3rem 1.5rem',
        borderTop: '1px solid var(--slate-800)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 800, fontSize: '1.15rem' }}>
              <Sparkles size={18} color="#818cf8" /> SkillBridge
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: 'var(--slate-400)' }}>
              Full-Stack Student Skill, Project and Collaboration Platform.
            </p>
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            Built with Spring Boot 3, MySQL, and React.js
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
