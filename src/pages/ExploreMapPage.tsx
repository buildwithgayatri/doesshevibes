import { useState, useMemo } from 'react';
import {
  Layers,
  Lightbulb,
  Users,
  TramFront,
  Accessibility,
  AlertTriangle,
  Building2,
  Map as MapIcon,
  Satellite,
  Navigation,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SafetyMap from '@/components/SafetyMap';
import { samplePlaces } from '@/data/sampleData';
import { adjustScoreForTime } from '@/lib/safetyEngine';
import type { CommunityReport } from '@/types';

type LayerType = 'none' | 'lighting' | 'pedestrian' | 'transport' | 'accessibility' | 'reports';

const layerOptions: { id: LayerType; label: string; icon: typeof Lightbulb }[] = [
  { id: 'none', label: 'None', icon: Layers },
  { id: 'lighting', label: 'Lighting', icon: Lightbulb },
  { id: 'pedestrian', label: 'Pedestrian', icon: Users },
  { id: 'transport', label: 'Transport', icon: TramFront },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'reports', label: 'Reports', icon: AlertTriangle },
];

export default function ExploreMapPage() {
  const {
    routes,
    selectedRouteId,
    setSelectedRouteId,
    reports,
    preferences,
    travelHour,
    settings,
    setSettings,
    setCurrentPage,
  } = useApp();

  const [activeLayer, setActiveLayer] = useState<LayerType>('none');
  const [showReports, setShowReports] = useState(true);
  const [showPlaces, setShowPlaces] = useState(true);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  const rankedRoutes = useMemo(
    () => routes.map((r) => ({
      ...r,
      safetyScore: adjustScoreForTime(r.safetyScore, travelHour),
    })),
    [routes, travelHour]
  );

  const selectedRoute = rankedRoutes.find((r) => r.id === selectedRouteId);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      {/* Map */}
      <div className="flex-1 relative">
        <SafetyMap
          routes={rankedRoutes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          reports={reports}
          places={samplePlaces}
          showReports={showReports}
          showPlaces={showPlaces}
          activeLayer={activeLayer}
          mapStyle={settings.mapStyle}
          className="h-full w-full"
        />

        {/* Top controls overlay */}
        <div className="absolute top-3 left-2 right-2 md:top-4 md:left-4 md:right-4 flex flex-wrap gap-1.5 md:gap-2 z-[1000]">
          {/* Layer toggle */}
          <div className="bg-white rounded-xl shadow-lg p-1.5 md:p-2 flex gap-0.5 md:gap-1 flex-wrap">
            {layerOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveLayer(opt.id)}
                  className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeLayer === opt.id
                      ? 'bg-rose-100 text-rose-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Map style toggle */}
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-1">
            <button
              onClick={() => setSettings({ ...settings, mapStyle: 'street' })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                settings.mapStyle === 'street'
                  ? 'bg-rose-100 text-rose-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" /> Map
            </button>
            <button
              onClick={() => setSettings({ ...settings, mapStyle: 'satellite' })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                settings.mapStyle === 'satellite'
                  ? 'bg-rose-100 text-rose-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite
            </button>
          </div>

          {/* Toggle reports/places */}
          <div className="bg-white rounded-xl shadow-lg p-2 flex gap-1">
            <button
              onClick={() => setShowReports(!showReports)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                showReports ? 'bg-red-50 text-red-500' : 'text-gray-400'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Reports
            </button>
            <button
              onClick={() => setShowPlaces(!showPlaces)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                showPlaces ? 'bg-blue-50 text-blue-500' : 'text-gray-400'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Places
            </button>
          </div>
        </div>

        {/* Route selector panel */}
        <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-auto md:w-80 z-[1000]">
          <div className="bg-white rounded-2xl shadow-lg p-3 md:p-4 space-y-2 md:space-y-3 max-h-60 md:max-h-72 overflow-y-auto">
            <h3 className="text-sm font-bold text-gray-800">Routes</h3>
            {rankedRoutes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              return (
                <button
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-gray-100 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: route.color }}
                    />
                    <span className="text-sm font-semibold text-gray-800">
                      {route.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-bold text-rose-500">
                      {route.safetyScore}/100
                    </span>
                    <span>{route.travelTime} min</span>
                    <span>{route.totalDistance} km</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected route detail */}
        {selectedRoute && (
          <div className="absolute bottom-4 right-4 hidden md:block w-72 z-[1000]">
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">
                  {selectedRoute.name}
                </h3>
                <button
                  onClick={() => setSelectedRouteId(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-400">Safety</span>
                  <p className="font-bold text-rose-500 text-base">
                    {selectedRoute.safetyScore}/100
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-400">Time</span>
                  <p className="font-bold text-gray-700 text-base">
                    {selectedRoute.travelTime} min
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {selectedRoute.segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-600">{seg.name}</span>
                    <span className="font-medium text-rose-400">
                      {seg.safetyScore}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage('active')}
                className="w-full bg-rose-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-rose-600 flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Start Journey
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reports list */}
      {showReports && (
        <div className="bg-white border-t border-rose-100 max-h-40 md:max-h-48 overflow-y-auto shrink-0">
          <div className="p-3 md:p-4 space-y-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Community Reports
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {reports.slice(0, 6).map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50 hover:bg-rose-50 transition-colors text-left"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {report.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {report.location_name} · {report.confirmations} confirmations
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report detail modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800">
                  {selectedReport.type.replace(/_/g, ' ')}
                </h3>
                <p className="text-xs text-gray-400">{selectedReport.location_name}</p>
              </div>
              <button onClick={() => setSelectedReport(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-600">{selectedReport.description}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>By {selectedReport.reported_by}</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" /> {selectedReport.confirmations} confirmations
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedReport(null);
                setCurrentPage('explore');
              }}
              className="w-full bg-rose-50 text-rose-500 text-sm font-medium py-2 rounded-lg hover:bg-rose-100"
            >
              View on map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
