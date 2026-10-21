import React, { useState } from 'react';
import { MapPin, Navigation, RotateCcw, AlertCircle } from 'lucide-react';
import { Coordinates } from '../../types/waste';
import { isValidCoordinate } from '../../utils/haversine';

interface LocationControlsProps {
  userCoordinates: Coordinates;
  onUpdateCoordinates: (coords: Coordinates) => void;
  onResetToDefault: () => void;
  defaultCoordinates: Coordinates;
}

export const LocationControls: React.FC<LocationControlsProps> = ({
  userCoordinates,
  onUpdateCoordinates,
  onResetToDefault,
  defaultCoordinates
}) => {
  const [latInput, setLatInput] = useState(userCoordinates.latitude.toString());
  const [lngInput, setLngInput] = useState(userCoordinates.longitude.toString());
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Sync state if props change (e.g. user clicked map)
  React.useEffect(() => {
    setLatInput(userCoordinates.latitude.toFixed(4));
    setLngInput(userCoordinates.longitude.toFixed(4));
  }, [userCoordinates]);

  const handleUseMyLocation = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter coordinates manually.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        onUpdateCoordinates(newCoords);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError('Location permission denied. Continuing with demonstration coordinates.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError('Location information is unavailable. Using manual coordinates.');
            break;
          case error.TIMEOUT:
            setGeoError('Location request timed out. Using manual coordinates.');
            break;
          default:
            setGeoError('Could not retrieve location. Using manual coordinates.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeoError(null);
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);

    const testCoords = { latitude: parsedLat, longitude: parsedLng };
    if (!isValidCoordinate(testCoords)) {
      setGeoError('Invalid coordinates. Latitude must be between -90 and 90; longitude between -180 and 180.');
      return;
    }

    onUpdateCoordinates(testCoords);
  };

  const isAtDefault =
    Math.abs(userCoordinates.latitude - defaultCoordinates.latitude) < 0.0001 &&
    Math.abs(userCoordinates.longitude - defaultCoordinates.longitude) < 0.0001;

  return (
    <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={18} className="text-emerald-600" />
          <strong style={{ fontSize: '0.95rem' }}>Your Demonstration Location:</strong>
          {isAtDefault && (
            <span className="badge-pill" style={{ backgroundColor: '#e2e8f0', color: '#475569' }}>
              Default Mumbai Center
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            onClick={handleUseMyLocation}
            disabled={isLocating}
            title="Attempt browser geolocation"
          >
            <Navigation size={13} />
            <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
            onClick={onResetToDefault}
            disabled={isAtDefault}
            title="Reset coordinates back to Mumbai demo center"
          >
            <RotateCcw size={13} />
            <span>Reset to Demo Location</span>
          </button>
        </div>
      </div>

      {geoError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--warning-text)', background: 'var(--warning-light)', border: '1px solid var(--warning-border)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
          <AlertCircle size={15} />
          <span>{geoError}</span>
        </div>
      )}

      {/* Manual Coordinate Form */}
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '130px' }}>
          <label htmlFor="user-lat" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Latitude (-90 to 90)
          </label>
          <input
            id="user-lat"
            type="number"
            step="any"
            className="form-control"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
          />
        </div>

        <div style={{ flex: 1, minWidth: '130px' }}>
          <label htmlFor="user-lng" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
            Longitude (-180 to 180)
          </label>
          <input
            id="user-lng"
            type="number"
            step="any"
            className="form-control"
            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          Set Location
        </button>

        <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>
          (or click anywhere on the map)
        </span>
      </form>
    </div>
  );
};
