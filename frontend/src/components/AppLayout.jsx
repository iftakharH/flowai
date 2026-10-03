import React, { useState } from 'react';
import { Activity, ArrowRightLeft, BarChart3, CircleUser, Home, LogOut, Settings, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthContext from '../context/useAuthContext';
import useSettings from '../context/useSettings';

const navigation = [
  { path: '/', icon: Home, label: 'Overview' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { path: '/budget', icon: BarChart3, label: 'Budgets' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuthContext();
  const { settings } = useSettings();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const avatarLabel = (user?.displayName || user?.email || 'U').trim().charAt(0).toUpperCase();
  const profileName = user?.displayName || 'Your account';
  const profileEmail = user?.email || 'Signed in with Firebase';

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    await logout();
    window.location.replace('/');
  };

  const renderNav = (mobile = false) => navigation.map(({ path, icon: Icon, label }) => (
    <NavLink
      key={path}
      to={path}
      end={path === '/'}
      aria-label={label}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
    >
      <Icon size={mobile ? 21 : 18} strokeWidth={1.8} />
      {!mobile && <span>{label}</span>}
    </NavLink>
  ));

  return (
    <div className="app-shell flex">
      <aside className="desktop-sidebar">
        <NavLink to="/" className="brand-lockup" aria-label="FlowAI overview">
          <span className="brand-mark"><Activity size={18} strokeWidth={2} /></span>
          <span><span className="brand-name">FlowAI</span><span className="brand-note">personal finance</span></span>
        </NavLink>
        <nav className="desktop-nav" aria-label="Main navigation">{renderNav()}</nav>
      </aside>

      <div className="app-body">
        <header className="app-topbar">
          <div className="topbar-context">
            <span className="topbar-kicker">FlowAI</span>
            <span className="topbar-title">Your money, in plain view</span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="account-trigger topbar-account-trigger"
              onClick={() => setProfileMenuOpen((value) => !value)}
              aria-expanded={profileMenuOpen}
              aria-label="Open account menu"
            >
              <span className="avatar">{avatarLabel}</span>
              <span className="account-copy topbar-account-copy"><span className="account-name">{profileName}</span><span className="account-email">{profileEmail}</span></span>
              <CircleUser className="mobile-account-icon" size={20} strokeWidth={1.8} />
            </button>
            {profileMenuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-heading"><span className="avatar">{avatarLabel}</span><div><strong>{profileName}</strong><small>{profileEmail}</small></div></div>
                <NavLink to="/settings" onClick={() => setProfileMenuOpen(false)}><Settings size={16} /> Settings</NavLink>
                {settings.isAdmin && <NavLink to="/admin" onClick={() => setProfileMenuOpen(false)}><ShieldCheck size={16} /> Admin workspace</NavLink>}
                <button type="button" onClick={handleLogout}><LogOut size={16} /> Sign out</button>
              </div>
            )}
          </div>
        </header>

        <main className="app-main"><div className="content-frame">{children}</div></main>

        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {renderNav(true)}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
