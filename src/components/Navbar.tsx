import React from 'react';
import { Recycle, HelpCircle, BookOpen, Laptop, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenHowItWorks: () => void;
  onOpenAbout: () => void;
  aiConfigured: boolean;
  lanMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHowItWorks,
  onOpenAbout,
  aiConfigured,
  lanMode
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

        <nav className="nav-actions" aria-label="Main Navigation">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenHowItWorks}
            title="Learn how classification and facility matching work"
          >
            <HelpCircle size={16} />
            <span>How It Works</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenAbout}
            title="About the student project and demonstration architecture"
          >
            <BookOpen size={16} />
            <span>Project Info</span>
          </button>

          <div
            className="badge-pill"
            style={{
              backgroundColor: aiConfigured ? '#d1fae5' : '#fef3c7',
              color: aiConfigured ? '#065f46' : '#92400e',
              border: `1px solid ${aiConfigured ? '#a7f3d0' : '#fde68a'}`
            }}
            title={aiConfigured ? 'Gemini API is live and active' : 'Offline / Demo Fallback Mode'}
          >
            <Sparkles size={12} />
            <span>{aiConfigured ? 'Gemini Live' : 'Demo Mode'}</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
