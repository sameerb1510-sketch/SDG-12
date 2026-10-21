import React from 'react';
import { X, Award, Shield, Wifi, Code2, Globe } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverMode: string;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  serverMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-about-title">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} className="text-emerald-600" />
            <h2 id="modal-about-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              About EcoWaste Navigator
            </h2>
          </div>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem', lineHeight: 1.5, color: 'var(--text-muted)' }}>
          <p>
            <strong>EcoWaste Navigator</strong> is a student-level sustainability web application developed for college coursework and demonstration, directly supporting <strong>UN Sustainable Development Goal 12: Responsible Consumption and Production</strong>.
          </p>

          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Code2 size={16} className="text-emerald-600" />
              <span>Technical Architecture & Budget</span>
            </div>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li><strong>Zero Budget (₹0):</strong> Built entirely using free and open-source tooling.</li>
              <li><strong>Frontend:</strong> React 18, TypeScript, Vite, Lucide Icons, Leaflet map.</li>
              <li><strong>Backend:</strong> Node.js, Express, official Google Gen AI SDK (Gemini Free Tier).</li>
              <li><strong>Secrets Security:</strong> Gemini API keys exist strictly on the backend host. No credentials are sent to client browsers or committed to Git.</li>
              <li><strong>Classroom Wi-Fi Demo:</strong> Supports host serving on LAN (0.0.0.0) so peers can connect seamlessly via same-origin <code>/api</code> requests.</li>
            </ul>
          </div>

          <div style={{ background: '#fefce8', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #fef08a', color: '#854d0e' }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <Shield size={16} />
              <span>Academic Demonstration Transparency</span>
            </div>
            <span>
              All 20 facilities in the dataset represent synthetic, fictional records in Mumbai created solely to demonstrate filtering algorithms and straight-line spatial distance sorting.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-subtle)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
            <span>Current Server Mode: <strong>{serverMode}</strong></span>
            <span>Coursework Showcase Edition</span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
