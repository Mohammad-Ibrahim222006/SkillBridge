import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import {
  Sparkles,
  Bell,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
  Compass,
  FolderGit2,
  Users
} from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPublicMobileMenu, setShowPublicMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadUnreadCount = async () => {
    try {
      const res = await notificationsApi.getUnreadCount();
      if (res.success && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not load unread count:', err);
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    if (!showNotifications) {
      try {
        const res = await notificationsApi.getNotifications({ page: 0, size: 5 });
        if (res.success && res.data) {
          setNotifications(res.data.content || []);
        }
      } catch (err) {
        console.warn('Error loading notifications:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-fixed" style={{
      height: '72px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      zIndex: 1000,
      backgroundColor: '#ffffff',
      backdropFilter: 'none',
      borderBottom: '1.5px solid var(--border)',
      boxShadow: '0 4px 20px -2px rgba(5, 16, 59, 0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <button
            onClick={onToggleSidebar}
            style={{
              padding: '0.55rem',
              color: 'var(--slate-800)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              boxShadow: 'var(--spatial-pill-shadow)',
              background: '#ffffff',
              border: '1px solid var(--border)',
              transition: 'var(--morph-transition)',
            }}
            title="Toggle Menu"
          >
            <Menu size={20} />
          </button>
        ) : (
          <button
            onClick={() => setShowPublicMobileMenu(!showPublicMobileMenu)}
            style={{
              padding: '0.55rem',
              color: 'var(--slate-800)',
              borderRadius: 'var(--radius-sm)',
              alignItems: 'center',
              boxShadow: 'var(--spatial-pill-shadow)',
              background: '#ffffff',
              border: '1px solid var(--border)',
              transition: 'var(--morph-transition)',
            }}
            className="mobile-toggle-btn"
            title="Toggle Navigation"
          >
            {showPublicMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '14px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 6px 16px -2px rgba(17, 53, 207, 0.4), inset 0 2px 3px rgba(255, 255, 255, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.35)',
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--palette-navy)', letterSpacing: '-0.03em' }}>
              SkillBridge
            </span>
            <span style={{
              marginLeft: '0.45rem',
              fontSize: '0.675rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #eff5ff, #e0edff)',
              color: 'var(--palette-cobalt)',
              padding: '0.2rem 0.55rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              boxShadow: 'var(--spatial-badge-shadow)',
              border: '1px solid var(--primary-border)',
            }}>
              Core
            </span>
          </div>
        </Link>
      </div>

      {/* Center Links (when public) */}
      {!isAuthenticated && (
        <nav className="navbar-links">
          <Link to="/projects" style={{ fontWeight: 700, color: 'var(--slate-700)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
            Explore Projects
          </Link>
          <Link to="/students" style={{ fontWeight: 700, color: 'var(--slate-700)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
            Discover Peers
          </Link>
          <Link to="/skills" style={{ fontWeight: 700, color: 'var(--slate-700)', fontSize: '0.9rem', transition: 'color 0.2s' }}>
            Skill Catalog
          </Link>
        </nav>
      )}

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {isAuthenticated ? (
          <>
            {/* Notifications Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleOpenNotifications}
                style={{
                  position: 'relative',
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-sm)',
                  color: showNotifications ? 'var(--palette-cobalt)' : 'var(--slate-700)',
                  background: showNotifications ? 'linear-gradient(135deg, #eff5ff, #e0edff)' : '#ffffff',
                  boxShadow: 'var(--spatial-pill-shadow)',
                  border: '1px solid var(--border)',
                  transition: 'var(--morph-transition)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    backgroundColor: 'var(--danger)',
                    color: 'white',
                    borderRadius: '10px',
                    fontSize: '0.675rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 6px rgba(225, 29, 72, 0.4)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '125%',
                  width: '360px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--spatial-card-shadow)',
                  border: '1.5px solid var(--border)',
                  zIndex: 1200,
                  overflow: 'hidden',
                  animation: 'modalMorph 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  <div style={{
                    padding: '0.875rem 1rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--slate-50)'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--palette-navy)' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{ fontSize: '0.75rem', color: 'var(--palette-cobalt)', fontWeight: 700 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        No recent notifications
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setShowNotifications(false);
                            if (n.linkUrl) navigate(n.linkUrl);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--slate-100)',
                            backgroundColor: n.read ? 'white' : 'var(--primary-light)',
                            cursor: 'pointer',
                            fontSize: '0.825rem'
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{n.title}</div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '0.625rem',
                      background: 'var(--slate-50)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--palette-cobalt)',
                      borderTop: '1px solid var(--border)'
                    }}
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.4rem 0.85rem 0.4rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(145deg, #ffffff, #f0f5fc)',
                  boxShadow: 'var(--spatial-pill-shadow)',
                  border: '1.5px solid var(--border)',
                  transition: 'var(--morph-transition)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(17, 53, 207, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.5)'
                }}>
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="navbar-user-text" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--palette-navy)', letterSpacing: '-0.01em' }}>
                    {user.fullName || 'Student'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {isAdmin ? 'Administrator' : 'Student'}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--slate-500)" />
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '125%',
                  width: '220px',
                  backgroundColor: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--spatial-card-shadow)',
                  border: '1.5px solid var(--border)',
                  zIndex: 1200,
                  padding: '0.65rem 0',
                  animation: 'modalMorph 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--slate-800)',
                      fontWeight: 600
                    }}
                  >
                    <UserIcon size={16} /> My Profile
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowUserMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.625rem',
                        padding: '0.625rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--palette-cobalt)',
                        fontWeight: 700
                      }}
                    >
                      <ShieldCheck size={16} /> Admin Console
                    </Link>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.35rem 0' }} />

                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.625rem 1rem',
                      fontSize: '0.85rem',
                      color: 'var(--danger)',
                      fontWeight: 700,
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-outline btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register Free
            </Link>
          </div>
        )}
      </div>

      {/* Public Mobile Dropdown Menu */}
      {!isAuthenticated && showPublicMobileMenu && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderBottom: '2px solid var(--border)',
          boxShadow: 'var(--spatial-card-shadow)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <Link
            to="/projects"
            onClick={() => setShowPublicMobileMenu(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--slate-800)', padding: '0.5rem 0' }}
          >
            <FolderGit2 size={18} color="var(--palette-cobalt)" /> Explore Projects
          </Link>
          <Link
            to="/students"
            onClick={() => setShowPublicMobileMenu(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--slate-800)', padding: '0.5rem 0' }}
          >
            <Users size={18} color="var(--palette-cobalt)" /> Discover Peers
          </Link>
          <Link
            to="/skills"
            onClick={() => setShowPublicMobileMenu(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, color: 'var(--slate-800)', padding: '0.5rem 0' }}
          >
            <Compass size={18} color="var(--palette-cobalt)" /> Skill Catalog
          </Link>
          <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0.25rem 0' }} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link
              to="/login"
              onClick={() => setShowPublicMobileMenu(false)}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, textAlign: 'center' }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setShowPublicMobileMenu(false)}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, textAlign: 'center' }}
            >
              Register Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
