import React, { useState } from 'react';
import {
  Wrench,
  Gift,
  Recycle,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { DecisionPathwayDetails, DisposalPathway, WasteCategory } from '../../types/waste';

interface DecisionGuideWizardProps {
  selectedCategory: WasteCategory | null;
  onSelectPathway: (pathway: DisposalPathway) => void;
  onProceedToFacilities: (fallbackCat?: WasteCategory) => void;
}

export const DecisionGuideWizard: React.FC<DecisionGuideWizardProps> = ({
  selectedCategory,
  onSelectPathway,
  onProceedToFacilities
}) => {
  // State for the 3 diagnostic questions
  const [workingState, setWorkingState] = useState<'working' | 'minor_issue' | 'dead' | null>(null);
  const [deviceAge, setDeviceAge] = useState<'modern' | 'old' | null>(null);
  const [isHazardous, setIsHazardous] = useState<'safe' | 'hazardous' | null>(null);

  // Compute recommendation based on answers
  const calculateRecommendation = (): DecisionPathwayDetails | null => {
    if (!workingState) return null;

    // Rule 1: Hazardous items (swollen battery, leaks) MUST go to certified recycling
    if (isHazardous === 'hazardous') {
      return {
        pathway: 'RECYCLE',
        title: 'Authorized E-Waste Recycling (Safety Priority)',
        badgeLabel: '♻️ Recycle at Authorized Facility',
        rationale: 'Due to battery swelling, physical hazard, or toxic chemical risk, this item cannot be donated or safely repaired. It must be delivered to an authorized collection facility.',
        actionSteps: [
          'Do not attempt to puncture, charge, or open the device.',
          'Store in a non-flammable container away from heat and moisture.',
          'Drop off at one of our authorized collection points on the map below.'
        ]
      };
    }

    // Rule 2: Working & Modern -> Reuse / Donate
    if (workingState === 'working') {
      if (deviceAge === 'old') {
        return {
          pathway: 'REUSE_DONATE',
          title: 'Secondary Reuse or Community Donation',
          badgeLabel: '🎁 Donate / Secondary Reuse',
          rationale: 'The device powers on and functions properly. Even older functioning electronics provide huge value for schools, digital literacy initiatives, or secondary owners.',
          actionSteps: [
            'Back up any important personal data to cloud or external storage.',
            'Perform a full factory reset to wipe personal credentials and files.',
            'Bundle remaining power adapters or cables together for the recipient.'
          ]
        };
      }
      return {
        pathway: 'REUSE_DONATE',
        title: 'Reuse, Resell, or Donate',
        badgeLabel: '🎁 Reuse / Donate / Resell',
        rationale: 'Your item is functional and modern! Reusing or donating saves up to 80% of its lifecycle environmental footprint compared to buying new.',
        actionSteps: [
          'Erase personal accounts, iCloud/Google accounts, and perform a factory reset.',
          'Consider donating to a local student, charity, or community organization.',
          'Alternatively, consider trade-in or peer-to-peer second-hand exchange.'
        ]
      };
    }

    // Rule 3: Minor issue -> Repair
    if (workingState === 'minor_issue') {
      return {
        pathway: 'REPAIR',
        title: 'Repair & Refurbish',
        badgeLabel: '🛠️ Repair & Extend Lifespan',
        rationale: 'Minor defects such as cracked glass, weak battery, or missing chargers are economically repairable. Repairing prevents premature e-waste creation.',
        actionSteps: [
          'Check if an official or third-party battery/screen replacement is cost-effective.',
          'Visit a local electronics repair café or independent technician.',
          'Extending device usage by just 1 extra year cuts its annual carbon impact by ~30%.'
        ]
      };
    }

    // Rule 4: Completely dead / non-repairable -> Authorized Recycling
    return {
      pathway: 'RECYCLE',
      title: 'Authorized E-Waste Collection Point',
      badgeLabel: '♻️ Authorized E-Waste Recycling',
      rationale: 'The device is non-functional, obsolete, or beyond economical repair. Authorized collection ensures precious metals (gold, copper) are recovered and toxins are safely neutralized.',
      actionSteps: [
        'Disconnect any removable batteries if safe to do so.',
        'Do not place electronic items in regular household garbage bins.',
        'Drop off at one of the compatible authorized facilities shown on the map below.'
      ]
    };
  };

  const recommendation = calculateRecommendation();

  const handleReset = () => {
    setWorkingState(null);
    setDeviceAge(null);
    setIsHazardous(null);
  };

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
            <span style={{ color: '#059669' }}>Circular Decision Guide:</span>
            <span>Repair vs. Donate vs. Recycle</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Answer 3 quick questions about your item's condition to receive a tailored sustainable pathway recommendation.
          </p>
        </div>

        {recommendation && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            onClick={handleReset}
          >
            <RotateCcw size={13} />
            <span>Reset Questions</span>
          </button>
        )}
      </div>

      {/* 3 Interactive Diagnostic Questions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Q1: Operational Status */}
        <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            1. Does the device turn on?
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className={`btn ${workingState === 'working' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setWorkingState('working')}
            >
              ✅ Yes, fully operational
            </button>
            <button
              type="button"
              className={`btn ${workingState === 'minor_issue' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setWorkingState('minor_issue')}
            >
              ⚠️ Minor defect (broken screen/dead battery)
            </button>
            <button
              type="button"
              className={`btn ${workingState === 'dead' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setWorkingState('dead')}
            >
              ❌ Completely dead / No power
            </button>
          </div>
        </div>

        {/* Q2: Age */}
        <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            2. Approximate Device Age:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className={`btn ${deviceAge === 'modern' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setDeviceAge('modern')}
            >
              📱 Under 4-5 years old
            </button>
            <button
              type="button"
              className={`btn ${deviceAge === 'old' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setDeviceAge('old')}
            >
              ⏳ Older (6 to 10+ years old)
            </button>
          </div>
        </div>

        {/* Q3: Physical / Battery Safety */}
        <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <strong style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            3. Physical Safety Condition:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className={`btn ${isHazardous === 'safe' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setIsHazardous('safe')}
            >
              🛡️ Normal wear, intact casing
            </button>
            <button
              type="button"
              className={`btn ${isHazardous === 'hazardous' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => setIsHazardous('hazardous')}
            >
              🔥 Swollen battery / Leaking / Burn marks
            </button>
          </div>
        </div>
      </div>

      {/* Generated Recommendation Box */}
      {recommendation ? (
        <div
          style={{
            background: recommendation.pathway === 'REPAIR' ? '#f0f9ff' : (recommendation.pathway === 'REUSE_DONATE' ? '#f0fdf4' : '#fffbeb'),
            border: `1px solid ${recommendation.pathway === 'REPAIR' ? '#bae6fd' : (recommendation.pathway === 'REUSE_DONATE' ? '#bbf7d0' : '#fde68a')}`,
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginTop: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {recommendation.pathway === 'REPAIR' && <Wrench size={22} className="text-sky-600" style={{ color: '#0284c7' }} />}
              {recommendation.pathway === 'REUSE_DONATE' && <Gift size={22} className="text-emerald-600" style={{ color: '#059669' }} />}
              {recommendation.pathway === 'RECYCLE' && <Recycle size={22} className="text-amber-600" style={{ color: '#d97706' }} />}
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                {recommendation.title}
              </h4>
            </div>

            <span
              className="badge-pill"
              style={{
                backgroundColor: recommendation.pathway === 'REPAIR' ? '#e0f2fe' : (recommendation.pathway === 'REUSE_DONATE' ? '#dcfce7' : '#fef3c7'),
                color: recommendation.pathway === 'REPAIR' ? '#0369a1' : (recommendation.pathway === 'REUSE_DONATE' ? '#15803d' : '#92400e'),
                fontSize: '0.8rem'
              }}
            >
              {recommendation.badgeLabel}
            </span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.875rem' }}>
            {recommendation.rationale}
          </p>

          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
              Action Steps for this Pathway:
            </strong>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {recommendation.actionSteps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>{step}</li>
              ))}
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn ${recommendation.pathway === 'RECYCLE' ? 'btn-blinking-red' : 'btn-primary'}`}
              style={{
                fontSize: recommendation.pathway === 'RECYCLE' ? '1rem' : '0.9rem',
                padding: recommendation.pathway === 'RECYCLE' ? '0.75rem 1.4rem' : '0.625rem 1.25rem'
              }}
              onClick={() => onProceedToFacilities(selectedCategory || WasteCategory.OTHER_UNCERTAIN)}
            >
              <span>
                {recommendation.pathway === 'RECYCLE'
                  ? '🚨 Flagged for Disposal: View Authorized E-Waste Collection Facilities'
                  : 'View Authorized E-Waste Collection Facilities'}
              </span>
              <ArrowRight size={18} />
            </button>

            {selectedCategory ? (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                Active Category: <strong>{selectedCategory}</strong>
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                (Will show all general e-waste collection points in Mumbai)
              </span>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '0.75rem', fontSize: '0.85rem', color: 'var(--text-subtle)' }}>
          💡 Click an answer above to see whether you should <strong>Repair</strong>, <strong>Donate</strong>, or <strong>Recycle</strong> your electronic device.
        </div>
      )}
    </div>
  );
};
