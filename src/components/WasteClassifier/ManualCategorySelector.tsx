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
  CheckCircle2,
  ArrowDown
} from 'lucide-react';
import { ALL_WASTE_CATEGORIES, WasteCategory } from '../../types/waste';

interface ManualCategorySelectorProps {
  selectedCategory: WasteCategory | null;
  onSelectCategory: (category: WasteCategory) => void;
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
  onSelectCategory
}) => {
  return (
    <div>
      <p style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
        Select your electronic item's category below:
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

      {selectedCategory && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontSize: '0.9rem' }}>
            <CheckCircle2 size={18} />
            <span>Category Selected: <strong>"{selectedCategory}"</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#047857', fontSize: '0.825rem', fontWeight: 600 }}>
            <span>Complete the Decision Guide below to find the right pathway</span>
            <ArrowDown size={14} />
          </div>
        </div>
      )}
    </div>
  );
};
