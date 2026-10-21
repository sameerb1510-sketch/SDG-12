import React, { useState } from 'react';
import {
  ListFilter,
  FileText,
  Camera,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  AIIdentificationResult,
  WasteCategory
} from '../../types/waste';
import { identifyWasteItem } from '../../services/api';
import { ManualCategorySelector } from './ManualCategorySelector';
import { TextDescriptionInput } from './TextDescriptionInput';
import { PhotoUploader } from './PhotoUploader';
import { ClassificationResult } from './ClassificationResult';

type TabType = 'manual' | 'text' | 'photo';

interface WasteClassifierProps {
  onCategoryConfirmed: (category: WasteCategory) => void;
  activeConfirmedCategory: WasteCategory | null;
}

export const WasteClassifier: React.FC<WasteClassifierProps> = ({
  onCategoryConfirmed,
  activeConfirmedCategory
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('manual');
  const [manualSelection, setManualSelection] = useState<WasteCategory | null>(
    activeConfirmedCategory || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiResult, setApiResult] = useState<AIIdentificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Manual Category Selection: Proceed directly without AI
  const handleManualConfirm = () => {
    if (manualSelection) {
      onCategoryConfirmed(manualSelection);
    }
  };

  // 1b. Ask AI to review manual category selection
  const handleAskAIHelp = async () => {
    if (!manualSelection) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await identifyWasteItem({
        description: `Please verify handling advice, battery or electronic safety protocols for category: ${manualSelection}.`,
        userCategoryHint: manualSelection
      });
      setApiResult(result);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to consult AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Text Description submission
  const handleTextAnalyze = async (text: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await identifyWasteItem({ description: text });
      setApiResult(result);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to identify item.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Photo Upload submission
  const handlePhotoAnalyze = async (base64: string, mimeType: string, optionalNote?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await identifyWasteItem({
        imageBase64: base64,
        imageMimeType: mimeType,
        description: optionalNote
      });
      setApiResult(result);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to analyze photo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setApiResult(null);
    setErrorMessage(null);
  };

  return (
    <section className="card" id="classifier-section" aria-labelledby="classifier-title">
      <div className="card-header">
        <div>
          <h2 id="classifier-title" className="card-title">
            <Sparkles size={22} className="text-emerald-600" />
            <span>Step 1: Identify Your Electronic Waste</span>
          </h2>
          <p className="card-subtitle">
            Choose any of the three methods below. Manual selection works instantly without AI; text and photos feature optional Gemini AI assistance.
          </p>
        </div>

        {apiResult && (
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            onClick={handleReset}
          >
            <RotateCcw size={14} />
            <span>Reset Classification</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="method-tabs" role="tablist" aria-label="E-Waste Identification Methods">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'manual'}
          className={`method-tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('manual');
            handleReset();
          }}
        >
          <ListFilter size={18} />
          <span>1. Manual Category</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'text'}
          className={`method-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('text');
            handleReset();
          }}
        >
          <FileText size={18} />
          <span>2. Text Description</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'photo'}
          className={`method-tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('photo');
            handleReset();
          }}
        >
          <Camera size={18} />
          <span>3. Photo Upload</span>
        </button>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem', background: 'var(--danger-light)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* If AI has returned a result, display it */}
      {apiResult ? (
        <ClassificationResult
          result={apiResult}
          onConfirmCategory={(category) => {
            onCategoryConfirmed(category);
          }}
          onReset={handleReset}
        />
      ) : (
        <div>
          {activeTab === 'manual' && (
            <ManualCategorySelector
              selectedCategory={manualSelection}
              onSelectCategory={(cat) => setManualSelection(cat)}
              onConfirm={handleManualConfirm}
              onAskAIHelp={handleAskAIHelp}
              isLoadingAI={isLoading}
            />
          )}

          {activeTab === 'text' && (
            <TextDescriptionInput
              onAnalyze={handleTextAnalyze}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'photo' && (
            <PhotoUploader
              onAnalyze={handlePhotoAnalyze}
              isLoading={isLoading}
            />
          )}
        </div>
      )}
    </section>
  );
};
