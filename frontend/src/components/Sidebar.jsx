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
        width: '270px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f6f9fc 100%)',
        borderRight: '1.5px solid rgba(226, 232, 240, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '72px',
        bottom: 0,
        left: isOpen ? 0 : '-280px',
        zIndex: 999,
        transition: 'left 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isOpen ? 'var(--clay-card-shadow)' : '4px 0 20px rgba(15, 23, 42, 0.04)',
        overflowY: 'auto',
      }}>
        <div style={{
          padding: '1.35rem 1.25rem 0.65rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--slate-400)'
          }}>
            Platform Navigation
          </span>
          <button
            onClick={onClose}
            style={{
              padding: '0.35rem',
              color: 'var(--slate-500)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'var(--clay-pill-shadow)',
              background: '#ffffff',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <nav style={{ padding: '0.65rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
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
                  padding: '0.7rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive
                    ? item.admin ? '#e11d48' : 'var(--primary)'
                    : item.admin ? '#f43f5e' : 'var(--slate-700)',
                  background: isActive
                    ? item.admin ? 'linear-gradient(135deg, #fff1f2, #ffe4e6)' : 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)'
                    : 'transparent',
                  border: isActive
                    ? item.admin ? '1.5px solid #fecdd3' : '1.5px solid var(--primary-border)'
                    : '1.5px solid transparent',
                  boxShadow: isActive ? 'var(--clay-pill-shadow)' : 'none',
                  transform: isActive ? 'translateX(4px)' : 'none',
                  transition: 'var(--morph-transition)'
                })}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom helper card */}
        <div style={{ marginTop: 'auto', padding: '1.25rem' }}>
          <div style={{
            background: 'linear-gradient(150deg, #ffffff, #f1f5f9)',
            border: '1.5px solid var(--border-clay)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem',
            boxShadow: 'var(--clay-card-shadow)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem' }}>
              <Target size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                Skill Gap Engine
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, fontWeight: 500 }}>
              Compare your proficiency with project requirements to generate custom learning roadmaps.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
