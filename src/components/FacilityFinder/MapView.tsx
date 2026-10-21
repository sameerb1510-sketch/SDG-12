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
  selectedFacilityId: string | null;
  onSelectFacility: (id: string) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  userCoordinates,
  onMapClick,
  rankedResults,
  allFacilities,
  selectedCategory,
  selectedFacilityId,
  onSelectFacility
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

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
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
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

  // Update Markers & Visible Route whenever user location, results, or selected facility change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // Remove any existing route line
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // 1. User Location Marker
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="background-color: #0284c7; width: 28px; height: 28px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(2,132,199,0.8); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
          📍
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const userMarker = L.marker([userCoordinates.latitude, userCoordinates.longitude], {
      icon: userIcon,
      title: 'Your Location'
    }).addTo(markersGroup);

    userMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 13px; line-height: 1.4;">
        <strong style="color: #0369a1;">📍 Your Location</strong><br/>
        <span style="font-size: 11px; color: #64748b;">
          Lat: ${userCoordinates.latitude.toFixed(4)}, Lng: ${userCoordinates.longitude.toFixed(4)}
        </span><br/>
        <em style="font-size: 11px; color: #475569;">Click anywhere on the map to move your location pin.</em>
      </div>
    `);

    // Build lookup for top-3 matched facilities
    const matchLookup = new Map<string, FacilityMatchResult>();
    rankedResults.forEach((res) => {
      matchLookup.set(res.facility.id, res);
    });

    // Determine target facility for visible route line:
    // If user clicked a specific facility, use it; otherwise default to #1 nearest
    const targetFacilityId = selectedFacilityId || (rankedResults.length > 0 ? rankedResults[0].facility.id : null);
    let routeTargetFacility: FictionalFacility | null = null;

    // 2. Add Facility Markers
    allFacilities.forEach((facility) => {
      const isMatched = matchLookup.has(facility.id);
      const matchResult = matchLookup.get(facility.id);
      const isSelected = facility.id === targetFacilityId;

      if (isSelected) {
        routeTargetFacility = facility;
      }

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
      }

      const facilityIcon = L.divIcon({
        className: 'custom-facility-marker',
        html: `
          <div style="background-color: ${pinColor}; color: white; width: ${isSelected ? '36px' : (isMatched ? '30px' : '22px')}; height: ${isSelected ? '36px' : (isMatched ? '30px' : '22px')}; border-radius: 50%; border: ${isSelected ? '3px solid #fbbf24' : '2px solid white'}; box-shadow: ${isSelected ? '0 0 14px rgba(245, 158, 11, 0.9)' : '0 2px 6px rgba(0,0,0,0.3)'}; display: flex; align-items: center; justify-content: center; font-size: ${isMatched ? '12px' : '9px'}; font-weight: bold; transition: all 0.2s ease;">
            ${isMatched ? matchResult?.rank : '🏢'}
          </div>
        `,
        iconSize: isSelected ? [36, 36] : (isMatched ? [30, 30] : [22, 22]),
        iconAnchor: isSelected ? [18, 18] : (isMatched ? [15, 15] : [11, 11])
      });

      const marker = L.marker([facility.coordinates.latitude, facility.coordinates.longitude], {
        icon: facilityIcon,
        title: facility.name
      }).addTo(markersGroup);

      marker.on('click', () => {
        onSelectFacility(facility.id);
      });

      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 1.45; min-width: 220px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="background-color: #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px;">
              FACILITY
            </span>
            ${rankBadge ? `<span style="background-color: #dcfce7; color: #166534; font-size: 10px; font-weight: bold; padding: 2px 5px; border-radius: 4px;">${rankBadge}</span>` : ''}
          </div>
          <strong style="color: #0f172a; font-size: 14px;">${facility.name}</strong>
          <p style="color: #64748b; font-size: 11px; margin: 3px 0 6px;">${facility.address.replace(' (Demo Only)', '')}</p>
          
          <div style="background-color: #f1f5f9; padding: 6px 8px; border-radius: 6px; margin: 6px 0;">
            <div style="color: #0f172a; font-weight: bold; font-size: 12px;">
              📏 ${distanceKm} km <span style="color: #64748b; font-weight: normal;">(${distanceMiles} mi)</span>
            </div>
            <div style="font-size: 10px; color: #059669; font-weight: 600;">
              Visible Direct Route Active
            </div>
          </div>

          <div style="margin: 4px 0; font-size: 11px;">
            <strong>Hours:</strong> ${facility.openingHours}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
    });

    // 3. Draw Visible Route Polyline between User and Target Facility
    if (routeTargetFacility) {
      const targetCoords = (routeTargetFacility as FictionalFacility).coordinates;
      const { distanceKm } = calculateDistance(userCoordinates, targetCoords);

      const latlngs: L.LatLngExpression[] = [
        [userCoordinates.latitude, userCoordinates.longitude],
        [targetCoords.latitude, targetCoords.longitude]
      ];

      const polyline = L.polyline(latlngs, {
        color: '#059669', // Emerald Green route
        weight: 4,
        opacity: 0.85,
        dashArray: '8, 8',
        lineCap: 'round'
      }).addTo(map);

      // Bind route tooltip showing direct distance along the path
      polyline.bindTooltip(`📍 Route to ${(routeTargetFacility as FictionalFacility).name}: ${distanceKm} km`, {
        permanent: true,
        direction: 'center',
        className: 'route-distance-tooltip'
      });

      routeLayerRef.current = polyline;
    }
  }, [userCoordinates, rankedResults, allFacilities, selectedCategory, selectedFacilityId]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapContainerRef}
        className="map-container"
        role="region"
        aria-label="Interactive Map of E-Waste Recycling Facilities"
      />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#334155',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ width: '12px', height: '3px', background: '#059669', display: 'inline-block' }}></span>
        <strong>Green dashed line:</strong> Visible direct route to selected facility
      </div>
    </div>
  );
};
