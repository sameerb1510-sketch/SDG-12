import React from 'react';
import { Recycle, Laptop, LogIn, User, LogOut, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  lanMode: boolean;
  currentUser: { name: string; email: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lanMode,
  currentUser,
  onOpenLogin,
  onLogout,
  theme,
  onToggleTheme
}) => {
  return (
    <header className="app-header">
      <div className="container nav-inner">
        <div className="brand-badge-group">
          <a href="#" className="brand-logo" aria-label="EcoWaste Navigator Home">
            <Recycle size={26} className="text-emerald-600" />
            <span>EcoWaste Navigator</span>
          </a>
          <span className="brand-tag">SDG 12: Responsible Consumption</span>
          {lanMode && (
            <span className="badge-pill" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
              <Laptop size={12} /> LAN Mode Active
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Dark / Light Mode Toggle Button */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-full)' }}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? (
              <Sun size={16} style={{ color: '#f59e0b' }} />
            ) : (
              <Moon size={16} style={{ color: '#64748b' }} />
            )}
            <span style={{ fontSize: '0.8rem', marginLeft: '2px' }}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="badge-pill" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary-text)', border: '1px solid var(--primary-border)' }}>
                <User size={13} />
                <span>{currentUser.name}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                onClick={onLogout}
                title="Sign out to Guest mode"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              onClick={onOpenLogin}
              title="Sign in to your account (optional)"
            >
              <LogIn size={14} />
              <span>Sign In (Optional)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
