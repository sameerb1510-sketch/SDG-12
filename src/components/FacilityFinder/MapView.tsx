import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, FacilityMatchResult, FictionalFacility, WasteCategory } from '../../types/waste';
import { calculateDistance } from '../../utils/haversine';

interface MapViewProps {
  userCoordinates: Coordinates;
  onMapClick: (coords: Coordinates) => void;
  rankedResults: FacilityMatchResult[];
  allFacilities: FictionalFacility[];
  selectedCategory: WasteCategory;
}

export const MapView: React.FC<MapViewProps> = ({
  userCoordinates,
  onMapClick,
  rankedResults,
  allFacilities,
  selectedCategory
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [userCoordinates.latitude, userCoordinates.longitude],
        zoom: 11,
        minZoom: 9,
        maxZoom: 18
      });

      // OpenStreetMap Tile Layer with required attribution
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | Fictional Demo Facility Layer',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click to update user location
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick({
          latitude: Math.round(e.latlng.lat * 10000) / 10000,
          longitude: Math.round(e.latlng.lng * 10000) / 10000
        });
      });
    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers whenever user location, results, or category change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. User Location Marker (distinctive icon)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="background-color: #0284c7; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(2,132,199,0.7); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">
          📍
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    const userMarker = L.marker([userCoordinates.latitude, userCoordinates.longitude], {
      icon: userIcon,
      title: 'Your Demonstration Location'
    }).addTo(markersGroup);

    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
        <strong style="color: #0369a1;">📍 Your Demonstration Location</strong><br/>
        <span style="font-size: 11px; color: #64748b;">
          Lat: ${userCoordinates.latitude.toFixed(4)}, Lng: ${userCoordinates.longitude.toFixed(4)}
        </span><br/>
        <em style="font-size: 11px; color: #475569;">Click anywhere on the map to move your demo location.</em>
      </div>
    `);

    // Build lookup for top-3 matched facilities
    const matchLookup = new Map<string, FacilityMatchResult>();
    rankedResults.forEach((res) => {
      matchLookup.set(res.facility.id, res);
    });

    // 2. Add Facility Markers
    allFacilities.forEach((facility) => {
      const isMatched = matchLookup.has(facility.id);
      const matchResult = matchLookup.get(facility.id);
      const acceptsCurrentCategory = facility.acceptedCategories.includes(selectedCategory);

      // Compute exact distance from user location
      const { distanceKm, distanceMiles } = matchResult
        ? { distanceKm: matchResult.distanceKm, distanceMiles: matchResult.distanceMiles }
        : calculateDistance(userCoordinates, facility.coordinates);

      let pinColor = '#94a3b8'; // default non-match slate
      let rankBadge = '';

      if (isMatched && matchResult) {
        if (matchResult.rank === 1) {
          pinColor = '#16a34a'; // Emerald for #1 nearest
          rankBadge = '#1 Nearest';
        } else if (matchResult.rank === 2) {
          pinColor = '#059669';
          rankBadge = '#2 Nearest';
        } else if (matchResult.rank === 3) {
          pinColor = '#0d9488';
          rankBadge = '#3 Nearest';
        }
      } else if (acceptsCurrentCategory) {
        pinColor = '#64748b'; // Compatible but beyond top 3
      }

      const facilityIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="background-color: ${pinColor}; color: white; width: ${isMatched ? '30px' : '22px'}; height: ${isMatched ? '30px' : '22px'}; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: ${isMatched ? '11px' : '9px'}; font-weight: bold;">
            ${isMatched ? matchResult?.rank : '🏢'}
          </div>
        `,
        iconSize: isMatched ? [30, 30] : [22, 22],
        iconAnchor: isMatched ? [15, 15] : [11, 11]
      });

      const marker = L.marker([facility.coordinates.latitude, facility.coordinates.longitude], {
        icon: facilityIcon,
        title: `${facility.name} (Demo Record)`
      }).addTo(markersGroup);

      // Popup Content (using exact same distance calculation)
      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.45; min-width: 220px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background-color: #fef08a; color: #854d0e; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px;">
              DEMO RECORD
            </span>
            ${rankBadge ? `<span style="background-color: #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px;">${rankBadge}</span>` : ''}
          </div>
          <strong style="color: #0f172a; font-size: 14px;">${facility.name}</strong>
          <p style="color: #64748b; font-size: 11px; margin: 3px 0 6px;">${facility.address}</p>
          
          <div style="background-color: #f1f5f9; padding: 6px 8px; border-radius: 6px; margin: 6px 0;">
            <div style="color: #0f172a; font-weight: bold; font-size: 12px;">
              📏 ${distanceKm} km <span style="color: #64748b; font-weight: normal;">(${distanceMiles} mi)</span>
            </div>
            <div style="font-size: 10px; color: #64748b;">
              Approximate straight-line distance
            </div>
          </div>

          <div style="margin: 4px 0; font-size: 11px;">
            <strong>Hours:</strong> ${facility.openingHours}
          </div>

          <div style="margin-top: 6px;">
            <span style="font-size: 11px; color: #475569; font-weight: 600;">Accepted Waste:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 3px; margin-top: 3px;">
              ${facility.acceptedCategories.map(cat => `
                <span style="font-size: 9px; padding: 1px 4px; border-radius: 3px; border: 1px solid ${cat === selectedCategory ? '#10b981' : '#cbd5e1'}; background-color: ${cat === selectedCategory ? '#ecfdf5' : '#ffffff'}; color: ${cat === selectedCategory ? '#065f46' : '#64748b'}; font-weight: ${cat === selectedCategory ? 'bold' : 'normal'};">
                  ${cat}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
    });
  }, [userCoordinates, rankedResults, allFacilities, selectedCategory]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapContainerRef}
        className="map-container"
        role="region"
        aria-label="Interactive Map of Fictional Demo E-Waste Facilities"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#475569',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
        }}
      >
        💡 Click any point on the map to change demo location
      </div>
    </div>
  );
};
