import React from 'react';
import {
  Smartphone,
  Laptop,
  BatteryCharging,
  Zap,
  Tv,
  Home,
  Lightbulb,
  Cpu,
  Printer,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ALL_WASTE_CATEGORIES, WasteCategory } from '../../types/waste';

interface ManualCategorySelectorProps {
  selectedCategory: WasteCategory | null;
  onSelectCategory: (category: WasteCategory) => void;
  onConfirm: () => void;
  onAskAIHelp: () => void;
  isLoadingAI?: boolean;
}

const CATEGORY_ICONS: Record<WasteCategory, React.ReactNode> = {
  [WasteCategory.PHONES_TABLETS]: <Smartphone size={20} />,
  [WasteCategory.COMPUTERS_LAPTOPS]: <Laptop size={20} />,
  [WasteCategory.BATTERIES]: <BatteryCharging size={20} />,
  [WasteCategory.CABLES_CHARGERS]: <Zap size={20} />,
  [WasteCategory.AUDIO_VIDEO]: <Tv size={20} />,
  [WasteCategory.HOUSEHOLD_APPLIANCES]: <Home size={20} />,
  [WasteCategory.LIGHTING_DEVICES]: <Lightbulb size={20} />,
  [WasteCategory.CIRCUIT_BOARDS]: <Cpu size={20} />,
  [WasteCategory.PRINTERS_PERIPHERALS]: <Printer size={20} />,
  [WasteCategory.OTHER_UNCERTAIN]: <HelpCircle size={20} />
};

export const ManualCategorySelector: React.FC<ManualCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory,
  onConfirm,
  onAskAIHelp,
  isLoadingAI = false
}) => {
  return (
    <div>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Select your electronic waste type directly. Manual selection works instantly without requiring an AI call.
      </p>

      <div className="category-grid" role="radiogroup" aria-label="E-Waste Categories">
        {ALL_WASTE_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`category-card-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              <div className="category-card-icon">{CATEGORY_ICONS[cat]}</div>
              <span style={{ fontSize: '0.875rem' }}>{cat}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onConfirm}
          disabled={!selectedCategory}
        >
          <span>Find Compatible Sample Facilities</span>
          <ArrowRight size={16} />
        </button>

        <button
          type="button"
          className="btn btn-outline-primary"
          onClick={onAskAIHelp}
          disabled={!selectedCategory || isLoadingAI}
          title="Ask Gemini to verify handling notes and safety for this category"
        >
          <Sparkles size={16} />
          <span>{isLoadingAI ? 'Analyzing...' : 'Ask AI to Check Selection'}</span>
        </button>
      </div>
    </div>
  );
};
