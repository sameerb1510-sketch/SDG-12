import React from 'react';
import { X, Cpu, Compass, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-how-title">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <h2 id="modal-how-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            How EcoWaste Navigator Works
          </h2>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.5rem', borderRadius: '50%' }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Section 1: AI vs Deterministic Code */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="feature-icon-wrapper" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Cpu size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                1. AI Assistance for Waste Classification
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                When you provide a text description or upload a photo, Google's Gemini multimodal model evaluates the physical attributes, device type, and hazard signs. It maps the item into one of 10 fixed canonical e-waste categories and suggests safety precautions.
              </p>
              <div style={{ fontSize: '0.8rem', background: 'var(--surface-alt)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', marginTop: '0.4rem' }}>
                💡 <em>Decoupled Architecture:</em> Manual category selection works completely offline without making an AI API call.
              </div>
            </div>
          </div>

          {/* Section 2: Haversine Algorithm */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="feature-icon-wrapper" style={{ background: '#f0f9ff', color: '#0284c7' }}>
              <Compass size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                2. Algorithmic Filtering & Haversine Distance
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Once your category is confirmed, our deterministic algorithm filters a local JSON dataset of 20 fictional facilities in Mumbai. Incompatible centers are immediately excluded. Then, the straight-line spherical distance from your coordinates is calculated using the Haversine formula:
              </p>
              <code style={{ display: 'block', background: '#f1f5f9', padding: '0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', margin: '0.4rem 0', fontFamily: 'monospace' }}>
                d = 2R · atan2(√a, √(1-a))  where  a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
              </code>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-subtle)' }}>
                The compatible facilities are sorted ascending by distance and the top 3 are displayed on the interactive OpenStreetMap Leaflet map.
              </p>
            </div>
          </div>

          {/* Section 3: Safety Checks */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="feature-icon-wrapper" style={{ background: '#fef2f2', color: '#dc2626' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                3. Safety Rules Engine
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Lithium batteries with swelling, chemical leaks, smoke, or frayed high-voltage wiring trigger priority safety warnings. The application advises non-puncture containment and certified professional reclamation.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Got it, Back to App
          </button>
        </div>
      </div>
    </div>
  );
};
