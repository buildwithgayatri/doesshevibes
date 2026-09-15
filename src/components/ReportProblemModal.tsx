import { useState } from 'react';
import { X, AlertTriangle, MapPin, Check, Navigation } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SafetyMap from '@/components/SafetyMap';
import { reportTypeLabels } from '@/data/sampleData';
import type { ReportType, CommunityReport } from '@/types';

export default function ReportProblemModal({ onClose }: { onClose: () => void }) {
  const { addReport, awardContribution, userLocation, settings } = useApp();
  const [selectedType, setSelectedType] = useState<ReportType>('broken_streetlight');
  const [description, setDescription] = useState('');
  const [markerPos, setMarkerPos] = useState<{ lat: number; lng: number } | null>(
    userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : { lat: 28.6139, lng: 77.209 }
  );

  const reportTypes = Object.keys(reportTypeLabels) as ReportType[];

  const handleSubmit = () => {
    if (!markerPos || !description.trim()) return;
    const report: CommunityReport = {
      id: `report-${Date.now()}`,
      type: selectedType,
      description: description.trim(),
      lat: markerPos.lat,
      lng: markerPos.lng,
      location_name: `${markerPos.lat.toFixed(4)}, ${markerPos.lng.toFixed(4)}`,
      reported_by: settings.displayName,
      confirmations: 1,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    addReport(report);
    awardContribution('report', report.id, report.description);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-rose-100 p-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" /> Report a Problem
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Problem Type</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {reportTypes.map((type) => {
                const meta = reportTypeLabels[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedType === type
                        ? 'border-rose-300 bg-rose-50 text-rose-600'
                        : 'border-gray-100 text-gray-500 hover:border-rose-200'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: meta.color }}
                    />
                    <span className="truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" /> Mark Location on Map
            </p>
            <p className="text-xs text-gray-400 mb-2">
              {userLocation
                ? 'Your current location is pre-marked. Tap anywhere on the map to adjust.'
                : 'Tap on the map to mark the exact location of the problem.'}
            </p>
            <div className="h-64 rounded-xl overflow-hidden border border-rose-100">
              <SafetyMap
                center={markerPos || { lat: 28.6139, lng: 77.209 }}
                zoom={16}
                userLocation={userLocation}
                onMapClick={(lat, lng) => setMarkerPos({ lat, lng })}
                className="h-full w-full"
              />
            </div>
            {markerPos && (
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <Navigation className="w-3 h-3 text-rose-400" />
                Marked at: {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the problem (e.g. Streetlight has been out for 3 days...)"
              className="w-full px-3 py-2.5 rounded-xl border border-rose-100 text-sm outline-none focus:border-rose-300 resize-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!description.trim() || !markerPos}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
