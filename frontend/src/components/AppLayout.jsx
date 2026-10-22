import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowRightLeft,
  BarChart3,
  CircleUser,
  FileText,
  Home,
  LogOut,
  Menu,
  Repeat2,
  Settings,
  ShieldCheck,
  Target,
  WalletCards,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuthContext from '../context/useAuthContext';
import useSettings from '../context/useSettings';

const navigation = [
  { path: '/', icon: Home, label: 'Overview', mobileLabel: 'Overview', primary: true },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions', mobileLabel: 'Activity', primary: true },
  { path: '/budget', icon: BarChart3, label: 'Budgets', mobileLabel: 'Budgets', primary: true },
  { path: '/goals', icon: Target, label: 'Goals', mobileLabel: 'Goals', primary: true },
  { path: '/accounts', icon: WalletCards, label: 'Accounts', desc: 'Cards and cash' },
  { path: '/reports', icon: FileText, label: 'Reports', desc: 'Your monthly story' },
  { path: '/subscriptions', icon: Repeat2, label: 'Subscriptions', desc: 'Repeating charges' },
];

const primaryNavigation = navigation.filter((item) => item.primary);
const secondaryNavigation = navigation.filter((item) => !item.primary);

const AppLayout = ({ children }) => {
  const { user, logout } = useAuthContext();
  const { settings } = useSettings();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarLabel = (user?.displayName || user?.email || 'U').trim().charAt(0).toUpperCase();
  const profileName = user?.displayName || 'Your account';
  const profileEmail = user?.email || 'Signed in with Firebase';

  useEffect(() => {
    if (!profileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setProfileMenuOpen(false);
    };
    const closeOnOutsidePress = (event) => {
      if (!event.target.closest('.topbar-actions')) setProfileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutsidePress);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutsidePress);
    };
  }, [profileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);
    await logout();
    window.location.replace('/');
  };

  const renderNav = (items = navigation, mobile = false) => items.map(({ path, icon: Icon, label, mobileLabel }) => (
    <NavLink
      key={path}
      to={path}
      end={path === '/'}
      aria-label={label}
      className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
    >
      <Icon size={mobile ? 20 : 18} strokeWidth={1.8} />
      {mobile
        ? <span className="mobile-nav-label">{mobileLabel || label}</span>
        : <span>{label}</span>}
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
          {renderNav(primaryNavigation, true)}
          <button
            type="button"
            className={`nav-link mobile-more-button ${mobileMenuOpen ? 'nav-link-active' : ''}`}
            onClick={() => setMobileMenuOpen((value) => !value)}
            aria-expanded={mobileMenuOpen}
            aria-label="More sections"
          >
            <Menu size={20} strokeWidth={1.8} />
            <span className="mobile-nav-label">More</span>
          </button>
        </nav>

        {mobileMenuOpen && (
          <>
            <button
              type="button"
              className="mobile-nav-backdrop"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="mobile-nav-sheet" role="dialog" aria-modal="true" aria-label="More sections">
              <div className="mobile-nav-sheet-head">
                <span>More in FlowAI</span>
                <button type="button" className="icon-button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              {secondaryNavigation.map(({ path, icon: Icon, label, desc }) => (
                <NavLink key={path} to={path} className="mobile-nav-sheet-link" onClick={() => setMobileMenuOpen(false)}>
                  <span className="mobile-nav-sheet-icon"><Icon size={18} /></span>
                  <span><strong>{label}</strong><small>{desc}</small></span>
                </NavLink>
              ))}
              <div className="mobile-nav-sheet-divider" />
              <NavLink to="/settings" className="mobile-nav-sheet-link" onClick={() => setMobileMenuOpen(false)}>
                <span className="mobile-nav-sheet-icon"><Settings size={18} /></span>
                <span><strong>Settings</strong><small>Theme, currency, and data</small></span>
              </NavLink>
              {settings.isAdmin && (
                <NavLink to="/admin" className="mobile-nav-sheet-link" onClick={() => setMobileMenuOpen(false)}>
                  <span className="mobile-nav-sheet-icon"><ShieldCheck size={18} /></span>
                  <span><strong>Admin workspace</strong><small>Users, plans, and quotes</small></span>
                </NavLink>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppLayout;
