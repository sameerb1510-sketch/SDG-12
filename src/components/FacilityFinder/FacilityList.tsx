import React from 'react';
import {
  Building2,
  Clock,
  Compass,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Navigation
} from 'lucide-react';
import { FacilityMatchResult, WasteCategory } from '../../types/waste';

interface FacilityListProps {
  results: FacilityMatchResult[];
  totalCompatible: number;
  totalInDataset: number;
  selectedCategory: WasteCategory;
  onChangeCategory: () => void;
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
  error?: string;
}

export const FacilityList: React.FC<FacilityListProps> = ({
  results,
  totalCompatible,
  totalInDataset,
  selectedCategory,
  onChangeCategory,
  selectedFacilityId,
  onSelectFacility,
  error
}) => {
  if (error) {
    return (
      <div style={{ background: 'var(--danger-light)', border: '1px solid var(--danger-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)', color: 'var(--danger-text)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          <AlertCircle size={18} />
          <span>Location or Query Error</span>
        </div>
        <p style={{ fontSize: '0.875rem' }}>{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
        <div className="feature-icon-wrapper" style={{ margin: '0 auto 1rem', background: 'var(--warning-light)', color: 'var(--warning)' }}>
          <AlertCircle size={24} />
        </div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          No Compatible Recycling Facilities Found
        </h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
          None of our {totalInDataset} facilities currently accept the category <strong>"{selectedCategory}"</strong>. In accordance with safety protocol, incompatible facilities are never recommended.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
          onClick={onChangeCategory}
        >
          Select Another Waste Category
        </button>
      </div>
    );
  }

  const activeTargetId = selectedFacilityId || (results.length > 0 ? results[0].facility.id : null);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong>{results.length}</strong> nearest of {totalCompatible} compatible facilities:
        </span>
        <span className="badge-pill" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}>
          Approx. Straight-Line Distance
        </span>
      </div>

      <div role="feed" aria-label="Nearest Compatible Facilities">
        {results.map((item) => {
          const isNearest = item.rank === 1;
          const { facility, distanceKm, distanceMiles, rank } = item;
          const isSelectedForRoute = facility.id === activeTargetId;

          return (
            <article
              key={facility.id}
              className={`facility-card ${isNearest ? 'nearest' : ''}`}
              style={{
                cursor: 'pointer',
                borderColor: isSelectedForRoute ? '#059669' : undefined,
                boxShadow: isSelectedForRoute ? '0 0 0 2px #059669' : undefined
              }}
              onClick={() => onSelectFacility(facility.id)}
              aria-labelledby={`facility-heading-${facility.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span className="facility-rank-tag">#{rank}</span>
                    <span className="demo-pill" style={{ fontSize: '0.65rem', backgroundColor: '#059669' }}>Collection Center</span>
                    {isNearest && (
                      <span className="badge-pill" style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.7rem' }}>
                        Nearest Match
                      </span>
                    )}
                    {isSelectedForRoute && (
                      <span className="badge-pill" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem' }}>
                        Active Route
                      </span>
                    )}
                  </div>
                  <h3 id={`facility-heading-${facility.id}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px' }}>
                    {facility.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    <MapPin size={13} />
                    <span>{facility.address.replace(' (Demo Only)', '')}</span>
                  </div>
                </div>

                <div className="facility-distance-badge" title="Straight-line distance calculated via Haversine formula">
                  {distanceKm} km
                  <div style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-subtle)' }}>
                    ({distanceMiles} mi)
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0', lineHeight: 1.45 }}>
                {facility.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                <Clock size={13} />
                <span><strong>Hours:</strong> {facility.openingHours}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="tags-wrap">
                  {facility.acceptedCategories.map((cat) => {
                    const isMatch = cat === selectedCategory;
                    return (
                      <span
                        key={cat}
                        className={`waste-tag ${isMatch ? 'match' : ''}`}
                      >
                        {isMatch && <CheckCircle2 size={10} style={{ display: 'inline', marginRight: '3px' }} />}
                        {cat}
                      </span>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className={`btn ${isSelectedForRoute ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(facility.id);
                  }}
                >
                  <Navigation size={12} />
                  <span>{isSelectedForRoute ? 'Route Active' : 'View Route'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', background: 'var(--surface-alt)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem' }}>
        ℹ️ Distances are calculated using spherical trigonometry (Haversine formula). Real driving or transit routes may differ.
      </div>
    </div>
  );
};
