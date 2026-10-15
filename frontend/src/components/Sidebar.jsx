import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Cpu,
  FolderKanban,
  PlusCircle,
  Target,
  Users,
  UserCheck,
  CheckSquare,
  Compass,
  Bell,
  ShieldCheck,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/skills', label: 'Technical Skills', icon: Cpu },
    { to: '/projects', label: 'Explore Projects', icon: FolderKanban },
    { to: '/projects/create', label: 'Create Project', icon: PlusCircle },
    { to: '/skill-gap', label: 'Skill-Gap Analysis', icon: Target },
    { to: '/students', label: 'Find Teammates', icon: Users },
    { to: '/teams', label: 'Teams & Invites', icon: UserCheck },
    { to: '/tasks', label: 'Project Tasks', icon: CheckSquare },
    { to: '/goals', label: 'Learning Goals', icon: Compass },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin Console', icon: ShieldCheck, admin: true });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            zIndex: 998,
          }}
        />
      )}

      <aside style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '68px',
        bottom: 0,
        left: isOpen ? 0 : '-270px',
        zIndex: 999,
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOpen ? 'var(--shadow-lg)' : 'none',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '1.25rem 1rem 0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--slate-400)'
          }}>
            Platform Navigation
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.25rem',
              color: 'var(--slate-500)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <nav style={{ padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive
                    ? item.admin ? '#b91c1c' : 'var(--primary)'
                    : item.admin ? '#dc2626' : 'var(--slate-700)',
                  backgroundColor: isActive
                    ? item.admin ? 'var(--danger-light)' : 'var(--primary-light)'
                    : 'transparent',
                  transition: 'all var(--transition-fast)'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom helper card */}
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc, #eef2ff)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Target size={16} color="var(--primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Skill Gap Engine
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Compare your proficiency with any project requirements to generate custom learning roadmaps.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
