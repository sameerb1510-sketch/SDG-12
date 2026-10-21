import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ArrowDown,
  Wrench,
  Gift,
  Recycle
} from 'lucide-react';
import { WasteCategory } from './types/waste';
import { checkServerHealth, ServerHealth } from './services/api';
import { Navbar } from './components/Navbar';
import { WasteClassifier } from './components/WasteClassifier/WasteClassifier';
import { FacilityFinder } from './components/FacilityFinder/FacilityFinder';
import { DecisionGuideWizard } from './components/DecisionGuide/DecisionGuideWizard';
import { LoginModal } from './components/Auth/LoginModal';

export const App: React.FC = () => {
  const [confirmedCategory, setConfirmedCategory] = useState<WasteCategory | null>(null);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [showFacilities, setShowFacilities] = useState(false);

  // Dark Mode Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ecowaste_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Apply theme to <html> document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ecowaste_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Check backend connectivity on mount
  useEffect(() => {
    checkServerHealth().then((health) => {
      if (health) setServerHealth(health);
    });
  }, []);

  const handleCategoryConfirmed = (category: WasteCategory) => {
    setConfirmedCategory(category);
  };

  const handleChangeCategory = () => {
    const classifierEl = document.getElementById('classifier-section');
    if (classifierEl) {
      classifierEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToFacilities = (fallbackCategory?: WasteCategory) => {
    if (!confirmedCategory) {
      setConfirmedCategory(fallbackCategory || WasteCategory.OTHER_UNCERTAIN);
    }
    setShowFacilities(true);
    setTimeout(() => {
      const finderEl = document.getElementById('finder-section');
      if (finderEl) {
        finderEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="app-root">
      {/* Navigation Header with Dark Mode Toggle */}
      <Navbar
        lanMode={serverHealth?.mode === 'LAN_DEMO'}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onLogout={() => setCurrentUser(null)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="container" id="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            EcoWaste Navigator
          </h1>
          <p className="hero-subtitle">
            <strong>Circular Electronics Decision Guide:</strong> Decide whether to <strong>Repair</strong>, <strong>Reuse / Donate</strong>, or <strong>Recycle</strong> your electronic devices at authorized collection centers in Mumbai.
          </p>

          {/* Three Circular Pathways Overview Grid */}
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <div className="feature-summary-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div className="feature-icon-wrapper" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <Wrench size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  1. Repair & Fix
                </strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Replace screens, batteries, or faulty cords to extend your device's working life.
                </p>
              </div>
            </div>

            <div className="feature-summary-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="feature-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Gift size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  2. Reuse & Donate
                </strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Wipe data and pass working electronics to students, NGOs, or secondary owners.
                </p>
              </div>
            </div>

            <div className="feature-summary-card" style={{ borderLeft: '4px solid #d97706' }}>
              <div className="feature-icon-wrapper" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#d97706' }}>
                <Recycle size={22} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  3. Authorized Recycling
                </strong>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  Safely recycle obsolete or non-functional items at authorized collection points.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 1: Waste Classification (Manual & Photo) */}
        <WasteClassifier
          onCategoryConfirmed={handleCategoryConfirmed}
          activeConfirmedCategory={confirmedCategory}
        />

        {/* Transition indicator */}
        {confirmedCategory && (
          <div style={{ textAlign: 'center', margin: '-1rem 0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} />
            <span>Category Selected: "{confirmedCategory}"</span>
            <ArrowDown size={16} />
          </div>
        )}

        {/* Decision Guide Wizard: Repair vs Donate vs Recycle */}
        <section id="decision-guide-section">
          <DecisionGuideWizard
            selectedCategory={confirmedCategory}
            onSelectPathway={() => {}}
            onProceedToFacilities={handleProceedToFacilities}
          />
        </section>

        {/* Step 2: Authorized Facility Discovery & Visible Route */}
        <div id="finder-section">
          {showFacilities ? (
            <FacilityFinder
              confirmedCategory={confirmedCategory || WasteCategory.OTHER_UNCERTAIN}
              onChangeCategory={handleChangeCategory}
            />
          ) : (
            <section className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--surface-alt)', borderStyle: 'dashed' }}>
              <div className="feature-icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--border)', color: 'var(--text-subtle)' }}>
                <MapPin size={26} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                Step 2: Authorized E-Waste Facility Locations & Route
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
                Facility locations are protected until you complete the Decision Guide above. If your device is flagged for dumping/recycling, click the button above to unlock the nearest authorized collection points and view your route.
              </p>
            </section>
          )}
        </div>

        {/* Built-in Battery & Safety Callout */}
        <section style={{ margin: '2rem 0' }}>
          <div style={{ background: 'rgba(217, 119, 6, 0.12)', border: '1px solid rgba(217, 119, 6, 0.35)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem', color: '#f59e0b' }}>
                Universal Battery & Electronic Safety Guideline
              </strong>
              <span style={{ color: 'var(--text-muted)' }}>
                Never crush, puncture, disassemble, or incinerate lithium-ion batteries or damaged power cells. If a battery is swollen or leaking, isolate it in a non-combustible container (e.g. sand or metal box) and hand it over to a qualified hazardous e-waste facility.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>EcoWaste Navigator</strong> — Circular Electronics Decision Guide
            <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Empowering circular choices: Repair, Reuse, Donate, and Authorized E-Waste Recycling in Mumbai.
            </div>
          </div>

          {!currentUser && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setIsLoginOpen(true)}
            >
              Sign In (Optional)
            </button>
          )}
        </div>
      </footer>

      {/* Optional Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={(name, email) => setCurrentUser({ name, email })}
      />
    </div>
  );
};
