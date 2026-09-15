import { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Route, CommunityReport, PublicPlace, LatLng } from '@/types';
import { reportTypeLabels, placeTypeLabels } from '@/data/sampleData';

// Fix default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createIcon(color: string, emoji?: string) {
  if (emoji) {
    return L.divIcon({
      html: `<div style="font-size: 24px; transform: translate(-50%, -50%);">${emoji}</div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }
  return L.divIcon({
    html: `<div style="width: 14px; height: 14px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4);"></div>`,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createReportIcon(color: string) {
  return L.divIcon({
    html: `<div style="width: 18px; height: 18px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 10px; color: white; font-weight: bold;">!</div>`,
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createPlaceIcon(color: string, emoji: string) {
  return L.divIcon({
    html: `<div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 14px;">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const placeEmojis: Record<string, string> = {
  hospital: 'H',
  cafe: 'C',
  shop: 'S',
  petrol: 'P',
  police: 'X',
  transport: 'T',
  public: 'B',
};

function createUserLocationIcon(heading: number | null) {
  const rotation = heading != null && !isNaN(heading) ? heading : 0;
  return L.divIcon({
    html: `
      <div style="position: relative; width: 28px; height: 28px;">
        <div style="position: absolute; inset: 0; border-radius: 50%; background: rgba(236, 72, 153, 0.2); border: 2px solid rgba(236, 72, 153, 0.4);"></div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(${rotation}deg); width: 0; height: 0; border-left: 7px solid transparent; border-right: 7px solid transparent; border-bottom: 14px solid #ec4899; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));"></div>
      </div>
    `,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function createStopIcon(number: number) {
  return L.divIcon({
    html: `<div style="width: 24px; height: 24px; border-radius: 50%; background: #ec4899; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 11px; color: white; font-weight: bold;">${number}</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function FollowUser({ location }: { location: LatLng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([location.lat, location.lng], Math.max(map.getZoom(), 15));
  }, [location.lat, location.lng, map]);
  return null;
}

function MapController({
  center,
  zoom,
}: {
  center: LatLng;
  zoom: number;
}) {
  const map = useMap();
  const centerRef = useRef(center);
  centerRef.current = center;

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom, map]);

  return null;
}

export interface SafetyMapProps {
  center?: LatLng;
  zoom?: number;
  routes?: Route[];
  selectedRouteId?: string | null;
  onSelectRoute?: (id: string) => void;
  reports?: CommunityReport[];
  places?: PublicPlace[];
  showReports?: boolean;
  showPlaces?: boolean;
  activeLayer?: 'none' | 'lighting' | 'pedestrian' | 'transport' | 'accessibility' | 'reports';
  mapStyle?: 'street' | 'satellite';
  userLocation?: LatLng | null;
  userHeading?: number | null;
  className?: string;
  onMapClick?: (lat: number, lng: number) => void;
  followUser?: boolean;
  stops?: { lat: number; lng: number; name: string }[];
}

export default function SafetyMap({
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 14,
  routes = [],
  selectedRouteId,
  onSelectRoute,
  reports = [],
  places = [],
  showReports = false,
  showPlaces = false,
  activeLayer = 'none',
  mapStyle = 'street',
  userLocation,
  userHeading = null,
  className,
  onMapClick,
  followUser = false,
  stops = [],
}: SafetyMapProps) {
  const layerColors: Record<string, string> = {
    lighting: '#f59e0b',
    pedestrian: '#3b82f6',
    transport: '#8b5cf6',
    accessibility: '#10b981',
    reports: '#ef4444',
  };

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (onMapClick) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  };

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={className || 'h-full w-full'}
      style={{ zIndex: 0 }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <MapController center={center} zoom={zoom} />
      <TileLayer
        key={mapStyle}
        url={
          mapStyle === 'satellite'
            ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        }
        attribution={
          mapStyle === 'satellite'
            ? 'Tiles &copy; Esri'
            : '&copy; OpenStreetMap contributors &copy; CARTO'
        }
        subdomains={'abcd'}
      />
      {onMapClick && (
        <MapClickHandler onClick={handleMapClick} />
      )}

      {routes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        const dimOpacity = selectedRouteId && !isSelected ? 0.25 : 1;

        return (
          <div key={route.id}>
            <Polyline
              positions={route.path.map((p) => [p.lat, p.lng] as [number, number])}
              pathOptions={{
                color: route.color,
                weight: isSelected ? 6 : 4,
                opacity: dimOpacity,
              }}
              eventHandlers={{
                click: () => onSelectRoute?.(route.id),
              }}
            />
            {route.segments.map((seg, i) => {
              if (activeLayer === 'none') return null;
              const color =
                activeLayer === 'lighting'
                  ? seg.lighting === 'high'
                    ? '#10b981'
                    : seg.lighting === 'medium'
                    ? '#f59e0b'
                    : '#ef4444'
                  : activeLayer === 'pedestrian'
                  ? seg.pedestrianActivity === 'high'
                    ? '#10b981'
                    : seg.pedestrianActivity === 'medium'
                    ? '#f59e0b'
                    : '#ef4444'
                  : activeLayer === 'transport'
                  ? seg.transportAccess === 'excellent'
                    ? '#10b981'
                    : seg.transportAccess === 'good'
                    ? '#f59e0b'
                    : seg.transportAccess === 'limited'
                    ? '#f97316'
                    : '#ef4444'
                  : activeLayer === 'accessibility'
                  ? seg.accessibility === 'excellent'
                    ? '#10b981'
                    : seg.accessibility === 'good'
                    ? '#f59e0b'
                    : seg.accessibility === 'fair'
                    ? '#f97316'
                    : '#ef4444'
                  : layerColors[activeLayer] || '#6b7280';

              return (
                <CircleMarker
                  key={seg.id}
                  center={[(seg.start.lat + seg.end.lat) / 2, (seg.start.lng + seg.end.lng) / 2]}
                  radius={8}
                  pathOptions={{ color, fillColor: color, fillOpacity: 0.6 }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{seg.name}</strong>
                      <br />
                      Safety: {seg.safetyScore}/100
                      <br />
                      Lighting: {seg.lighting}
                      <br />
                      Pedestrian: {seg.pedestrianActivity}
                      <br />
                      Transport: {seg.transportAccess}
                      <br />
                      Accessibility: {seg.accessibility}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </div>
        );
      })}

      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={createUserLocationIcon(userHeading)}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}

      {followUser && userLocation && (
        <FollowUser location={userLocation} />
      )}

      {stops.map((stop, i) => (
        <Marker
          key={`stop-${i}-${stop.lat}-${stop.lng}`}
          position={[stop.lat, stop.lng]}
          icon={createStopIcon(i + 1)}
        >
          <Popup>
            <div className="text-sm">
              <strong>Stop {i + 1}: {stop.name}</strong>
            </div>
          </Popup>
        </Marker>
      ))}

      {showReports &&
        reports.map((report) => {
          const meta = reportTypeLabels[report.type];
          return (
            <Marker
              key={report.id}
              position={[report.lat, report.lng]}
              icon={createReportIcon(meta.color)}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{meta.label}</strong>
                  <br />
                  {report.description}
                  <br />
                  <span className="text-gray-500">
                    {report.location_name} · {report.confirmations} confirmations
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* Routing fallback note — visible at bottom of map */}
      {routes.length > 0 && (
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control bg-white/90 text-gray-400 text-xs px-2 py-1 rounded shadow-sm mr-2 mb-1">
            Demo routes — live routing requires a configured provider
          </div>
        </div>
      )}

      {showPlaces &&
        places.map((place) => {
          const meta = placeTypeLabels[place.type];
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPlaceIcon(meta.color, placeEmojis[place.type] || '?')}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{place.name}</strong>
                  <br />
                  {meta.label}
                  <br />
                  {place.isOpen ? (
                    <span className="text-green-600 font-medium">Open</span>
                  ) : (
                    <span className="text-red-500 font-medium">Closed</span>
                  )}{' '}
                  · {place.hours}
                  <br />
                  {place.distance} km away
                  {place.phone && (
                    <>
                      <br />
                      {place.phone}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
}

function MapClickHandler({ onClick }: { onClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
    };
  }, [map, onClick]);
  return null;
}
