import React, { useState, useEffect } from 'react';
import {
  Recycle,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ArrowDown,
  Info,
  HelpCircle
} from 'lucide-react';
import { WasteCategory } from './types/waste';
import { checkServerHealth, ServerHealth } from './services/api';
import { NoticeBanner } from './components/NoticeBanner';
import { Navbar } from './components/Navbar';
import { WasteClassifier } from './components/WasteClassifier/WasteClassifier';
import { FacilityFinder } from './components/FacilityFinder/FacilityFinder';
import { HowItWorks } from './components/HowItWorks';
import { AboutModal } from './components/AboutModal';

export const App: React.FC = () => {
  const [confirmedCategory, setConfirmedCategory] = useState<WasteCategory | null>(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);

  // Check backend connectivity on mount
  useEffect(() => {
    checkServerHealth().then((health) => {
      if (health) setServerHealth(health);
    });
  }, []);

  const handleCategoryConfirmed = (category: WasteCategory) => {
    setConfirmedCategory(category);
    // Smooth scroll down to Step 2 Facility Finder
    setTimeout(() => {
      const finderEl = document.getElementById('finder-section');
      if (finderEl) {
        finderEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleChangeCategory = () => {
    const classifierEl = document.getElementById('classifier-section');
    if (classifierEl) {
      classifierEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-root">
      {/* 1. Academic Demonstration Notice Banner */}
      <NoticeBanner />

      {/* 2. Navigation Header */}
      <Navbar
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        aiConfigured={Boolean(serverHealth?.aiConfigured)}
        lanMode={serverHealth?.mode === 'LAN_DEMO'}
      />

      <main className="container" id="main-content">
        {/* 3. Hero Section */}
        <section className="hero-section">
          <h1 className="hero-title">
            EcoWaste Navigator
          </h1>
          <p className="hero-subtitle">
            A student sustainability platform to classify electronic waste and locate the nearest compatible demonstration recycling centers in Mumbai.
          </p>

          {/* Two Main Functions Overview Grid */}
          <div className="features-grid">
            <div className="feature-summary-card accent">
              <div className="feature-icon-wrapper">
                <Sparkles size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  1. Identify E-Waste
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Choose directly from 10 standard categories, describe defects in plain text, or upload photos with optional Gemini AI vision analysis.
                </p>
              </div>
            </div>

            <div className="feature-summary-card accent-alt">
              <div className="feature-icon-wrapper alt">
                <MapPin size={24} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ display: 'block', fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  2. Discover Nearest Facilities
                </strong>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Filter compatible fictional facilities and calculate straight-line distances using the Haversine formula on an interactive Leaflet map.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Step 1: Waste Classification */}
        <WasteClassifier
          onCategoryConfirmed={handleCategoryConfirmed}
          activeConfirmedCategory={confirmedCategory}
        />

        {/* Transition indicator */}
        {confirmedCategory && (
          <div style={{ textAlign: 'center', margin: '-1rem 0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary-hover)', fontWeight: 600, fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} />
            <span>Category Confirmed: "{confirmedCategory}"</span>
            <ArrowDown size={16} />
          </div>
        )}

        {/* 5. Step 2: Fictional Facility Discovery */}
        {confirmedCategory ? (
          <FacilityFinder
            confirmedCategory={confirmedCategory}
            onChangeCategory={handleChangeCategory}
          />
        ) : (
          <section className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--surface-alt)', borderStyle: 'dashed' }}>
            <div className="feature-icon-wrapper" style={{ margin: '0 auto 1rem', background: '#e2e8f0', color: '#64748b' }}>
              <MapPin size={26} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Step 2: Nearest Facilities Awaiting Category
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto' }}>
              Please select or identify an e-waste category in Step 1 above. Our distance-and-filtering algorithm will automatically find the 3 nearest compatible demo centers.
            </p>
          </section>
        )}

        {/* 6. Built-in Battery & Safety Callout */}
        <section style={{ margin: '2rem 0' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ShieldAlert size={24} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.25rem', color: '#78350f' }}>
                Universal Battery & Electronic Safety Guideline
              </strong>
              <span>
                Never crush, puncture, disassemble, or incinerate lithium-ion batteries or damaged power cells. If a battery is swollen or leaking, isolate it in a non-combustible container (e.g. sand or metal box) and hand it over to a qualified hazardous e-waste facility.
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="app-footer">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>EcoWaste Navigator</strong> — Student Sustainability Project
            <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
              Demonstration prototype with synthetic facility data in Mumbai. Zero commercial budget.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setIsHowItWorksOpen(true)}
            >
              How It Works
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
              onClick={() => setIsAboutOpen(true)}
            >
              Project Details
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <HowItWorks
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        serverMode={serverHealth?.mode || 'LOCAL_DEV'}
      />
    </div>
  );
};
