import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Edit2,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import {
  ALL_WASTE_CATEGORIES,
  AIIdentificationResult,
  WasteCategory
} from '../../types/waste';

interface ClassificationResultProps {
  result: AIIdentificationResult;
  onConfirmCategory: (category: WasteCategory) => void;
  onReset: () => void;
}

export const ClassificationResult: React.FC<ClassificationResultProps> = ({
  result,
  onConfirmCategory,
  onReset
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory>(result.category);
  const [isEditing, setIsEditing] = useState(false);

  const getCertaintyClass = (level: AIIdentificationResult['certainty']) => {
    switch (level) {
      case 'High':
        return 'badge-certainty-high';
      case 'Medium':
        return 'badge-certainty-medium';
      case 'Low':
      case 'Uncertain':
      default:
        return 'badge-certainty-low';
    }
  };

  const handleConfirm = () => {
    onConfirmCategory(selectedCategory);
  };

  return (
    <div className={`result-box ${result.isFallbackDemo ? 'fallback' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={22} className="text-emerald-600" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
            {result.itemName}
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge-pill ${getCertaintyClass(result.certainty)}`}>
            Certainty: {result.certainty}
          </span>
          {result.isFallbackDemo && (
            <span
              className="badge-pill"
              style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              title="Predetermined offline sample result because no GEMINI_API_KEY was provided"
            >
              Demo Fallback
            </span>
          )}
        </div>
      </div>

      {/* Category confirmation & override row */}
      <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: isEditing ? '0.75rem' : '0' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Category: </span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary-hover)', marginLeft: '0.25rem' }}>
              {selectedCategory}
            </strong>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 size={13} />
            <span>{isEditing ? 'Cancel Edit' : 'Correct Category'}</span>
          </button>
        </div>

        {isEditing && (
          <div style={{ marginTop: '0.5rem' }}>
            <label htmlFor="category-override" className="form-label" style={{ fontSize: '0.8rem' }}>
              Select the correct category if the AI was inaccurate:
            </label>
            <select
              id="category-override"
              className="form-control"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as WasteCategory);
                setIsEditing(false);
              }}
            >
              {ALL_WASTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Explanation */}
      <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
        <strong>Rationale:</strong> {result.explanation}
      </p>

      {/* Follow-up question if uncertain */}
      {result.followUpQuestion && (
        <div style={{ background: '#f8fafc', borderLeft: '3px solid var(--secondary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <HelpCircle size={18} style={{ color: 'var(--secondary)', flexShrink: 0, marginTop: '2px' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
            <strong>Follow-up:</strong> {result.followUpQuestion}
          </span>
        </div>
      )}

      {/* Prominent Safety Guidance */}
      {result.safetyGuidance && result.safetyGuidance.length > 0 && (
        <div className={result.isHazardous ? 'safety-alert-card' : 'result-box'} style={{ padding: '1rem', marginTop: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="safety-alert-title" style={{ color: result.isHazardous ? 'var(--danger-text)' : 'var(--primary-text)' }}>
            {result.isHazardous ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
            <span>{result.isHazardous ? 'Critical Safety & Handling Protocol' : 'Handling & Transport Guidance'}</span>
          </div>
          <ul className="safety-list">
            {result.safetyGuidance.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleConfirm}
        >
          <span>Confirm & View Nearest Facilities</span>
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={onReset}
        >
          Start New Identification
        </button>
      </div>
    </div>
  );
};
