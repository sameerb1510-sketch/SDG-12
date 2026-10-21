import React, { useState } from 'react';
import { Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

interface TextDescriptionInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const SAMPLE_PROMPTS = [
  'My old laptop does not turn on and the fan makes noise',
  'I have a damaged phone charger with slightly frayed wires',
  'Old AA and rechargeable lithium power bank that feels warm',
  'Broken LED tube light from the kitchen ceiling',
  'Obsolete dot-matrix printer and spare ink cartridges'
];

export const TextDescriptionInput: React.FC<TextDescriptionInputProps> = ({
  onAnalyze,
  isLoading
}) => {
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter a short description of your electronic item first.');
      return;
    }
    setError(null);
    onAnalyze(description.trim());
  };

  const handleSelectSample = (sample: string) => {
    setDescription(sample);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="waste-desc" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MessageSquare size={16} />
          <span>Describe your electronic item in plain language:</span>
        </label>
        <textarea
          id="waste-desc"
          rows={4}
          className="form-control"
          placeholder="e.g. 'My old laptop does not turn on' or 'I have a damaged phone charger with bent pins'..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (error) setError(null);
          }}
          disabled={isLoading}
          maxLength={1000}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.25rem' }}>
          <span>Tip: Mention any physical damage, swelling, or leaks so safety alerts can be generated.</span>
          <span>{description.length}/1000</span>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Quick sample chips */}
      <div style={{ marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Examples: </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="waste-tag"
              style={{ cursor: 'pointer', background: 'var(--surface-alt)' }}
              onClick={() => handleSelectSample(prompt)}
            >
              "{prompt.slice(0, 36)}..."
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading || !description.trim()}
      >
        <Sparkles size={16} />
        <span>{isLoading ? 'Consulting Gemini AI...' : 'Identify with AI'}</span>
      </button>
    </form>
  );
};
