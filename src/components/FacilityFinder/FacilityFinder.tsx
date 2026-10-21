import React, { useState, useMemo } from 'react';
import { Map, RotateCcw } from 'lucide-react';
import { Coordinates, FictionalFacility, WasteCategory } from '../../types/waste';
import { findNearestFacilities } from '../../utils/facilityMatcher';
import rawFacilities from '../../data/facilities.json';
import { LocationControls } from './LocationControls';
import { MapView } from './MapView';
import { FacilityList } from './FacilityList';

const DEFAULT_MUMBAI_CENTER: Coordinates = {
  latitude: 19.0760,
  longitude: 72.8777
};

interface FacilityFinderProps {
  confirmedCategory: WasteCategory;
  onChangeCategory: () => void;
}

export const FacilityFinder: React.FC<FacilityFinderProps> = ({
  confirmedCategory,
  onChangeCategory
}) => {
  const [userCoords, setUserCoords] = useState<Coordinates>(DEFAULT_MUMBAI_CENTER);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Cast dataset to FictionalFacility[]
  const facilities = rawFacilities as unknown as FictionalFacility[];

  // Execute pure matching & distance ranking algorithm
  const matchResponse = useMemo(() => {
    return findNearestFacilities({
      userCoordinates: userCoords,
      category: confirmedCategory,
      facilities,
      maxResults: 3
    });
  }, [userCoords, confirmedCategory, facilities]);

  // Keep first facility selected by default if nothing selected or coordinates change
  React.useEffect(() => {
    if (matchResponse.results.length > 0) {
      const exists = matchResponse.results.some(r => r.facility.id === selectedFacilityId);
      if (!exists) {
        setSelectedFacilityId(matchResponse.results[0].facility.id);
      }
    } else {
      setSelectedFacilityId(null);
    }
  }, [matchResponse.results]);

  const handleUpdateCoordinates = (newCoords: Coordinates) => {
    setUserCoords(newCoords);
  };

  const handleResetCoordinates = () => {
    setUserCoords(DEFAULT_MUMBAI_CENTER);
  };

  return (
    <section className="card" id="finder-section" aria-labelledby="finder-title">
      <div className="card-header">
        <div>
          <h2 id="finder-title" className="card-title">
            <Map size={22} className="text-emerald-600" />
            <span>Step 2: Nearest Compatible Facilities</span>
          </h2>
          <p className="card-subtitle">
            Filtering for e-waste category: <strong style={{ color: 'var(--primary-hover)' }}>"{confirmedCategory}"</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          onClick={onChangeCategory}
          title="Return to Step 1 to select or classify a different item"
        >
          <RotateCcw size={14} />
          <span>Change Waste Category</span>
        </button>
      </div>

      {/* Location Selector Controls */}
      <LocationControls
        userCoordinates={userCoords}
        onUpdateCoordinates={handleUpdateCoordinates}
        onResetToDefault={handleResetCoordinates}
        defaultCoordinates={DEFAULT_MUMBAI_CENTER}
      />

      {/* Map & Facility Results Side-by-Side Grid */}
      <div className="finder-layout">
        <div>
          <MapView
            userCoordinates={userCoords}
            onMapClick={handleUpdateCoordinates}
            rankedResults={matchResponse.results}
            allFacilities={facilities}
            selectedCategory={confirmedCategory}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={(id) => setSelectedFacilityId(id)}
          />
        </div>

        <div>
          <FacilityList
            results={matchResponse.results}
            totalCompatible={matchResponse.totalCompatible}
            totalInDataset={matchResponse.totalInDataset}
            selectedCategory={confirmedCategory}
            onChangeCategory={onChangeCategory}
            selectedFacilityId={selectedFacilityId}
            onSelectFacility={(id) => setSelectedFacilityId(id)}
            error={matchResponse.error}
          />
        </div>
      </div>
    </section>
  );
};
