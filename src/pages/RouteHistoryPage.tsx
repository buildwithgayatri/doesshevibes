import { useState, useMemo } from 'react';
import {
  BarChart3,
  Clock,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  AlertCircle,
  Construction,
  MapPin,
  Calendar,
  ChevronRight,
  X,
  ArrowUp,
  ArrowDown,
  Minus,
  History,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { sampleHistory } from '@/data/sampleData';
import type { JourneyHistory, RouteChange } from '@/types';

const changeIcons: Record<string, typeof AlertCircle> = {
  closure: AlertCircle,
  lighting_improved: Lightbulb,
  lighting_broken: Lightbulb,
  new_report: AlertCircle,
  construction: Construction,
  score_change: TrendingUp,
};

const impactConfig = {
  positive: { color: 'text-green-500 bg-green-50', icon: ArrowUp, label: 'Improved' },
  negative: { color: 'text-red-500 bg-red-50', icon: ArrowDown, label: 'Decreased' },
  neutral: { color: 'text-gray-500 bg-gray-50', icon: Minus, label: 'Info' },
};

export default function RouteHistoryPage() {
  const { routes, preferences, travelHour, setCurrentPage } = useApp();
  const [selectedHistory, setSelectedHistory] = useState<JourneyHistory | null>(null);
  const [showWhatChanged, setShowWhatChanged] = useState(false);

  const avgSafety = useMemo(
    () => Math.round(
      sampleHistory.reduce((sum, h) => sum + h.safetyScore, 0) / sampleHistory.length
    ),
    []
  );

  const totalTrips = sampleHistory.length;
  const totalDistance = sampleHistory.reduce((sum, h) => sum + h.distance, 0);
  const totalTime = sampleHistory.reduce((sum, h) => sum + h.travelTime, 0);

  // "What Changed" analysis
  const whatChanged = useMemo(() => {
    const changes: { description: string; impact: 'positive' | 'negative' | 'neutral' }[] = [];

    // Check if usual route has changed
    const usualRoute = routes[0];
    if (usualRoute) {
      changes.push({
        description: 'Your usual route (Route A) safety score is currently 91/100 — stable since last trip.',
        impact: 'neutral',
      });
    }

    // Check for construction
    changes.push({
      description: 'Route B is now 8 minutes slower because of road construction on Janpath Road.',
      impact: 'negative',
    });

    changes.push({
      description: 'Safety score on Route B decreased because a streetlight was reported broken on Back Street.',
      impact: 'negative',
    });

    changes.push({
      description: 'Lighting improved on Connaught Place Main — 3 new LED streetlights installed 3 weeks ago.',
      impact: 'positive',
    });

    changes.push({
      description: 'Pedestrian activity on Park Avenue is usually higher between 5 PM and 8 PM.',
      impact: 'neutral',
    });

    return changes;
  }, [routes]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Route History</h1>
        <p className="text-sm text-gray-500">Previous journeys and changes in route conditions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <History className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Total Trips</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalTrips}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Avg Safety</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{avgSafety}<span className="text-sm text-gray-400">/100</span></p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Total Distance</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalDistance.toFixed(1)}<span className="text-sm text-gray-400"> km</span></p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Total Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalTime}<span className="text-sm text-gray-400"> min</span></p>
        </div>
      </div>

      {/* What Changed */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" /> What Changed?
          </h2>
          <button
            onClick={() => setShowWhatChanged(!showWhatChanged)}
            className="text-sm text-rose-500 font-medium hover:underline"
          >
            {showWhatChanged ? 'Hide' : 'Show Details'}
          </button>
        </div>

        {showWhatChanged ? (
          <div className="space-y-2">
            {whatChanged.map((change, i) => {
              const cfg = impactConfig[change.impact];
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-gray-50"
                >
                  <div className={`w-7 h-7 rounded-lg ${cfg.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-sm text-gray-700">{change.description}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {whatChanged.filter((c) => c.impact === 'negative').length} changes detected on your usual routes.
            Tap "Show Details" to review.
          </p>
        )}
      </div>

      {/* History list */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800">Previous Journeys</h2>
        <div className="space-y-2">
          {sampleHistory.map((entry) => {
            const date = new Date(entry.date);
            const scoreColor =
              entry.safetyScore >= 80 ? 'text-green-600 bg-green-50' : entry.safetyScore >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
            return (
              <button
                key={entry.id}
                onClick={() => setSelectedHistory(entry)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${scoreColor}`}>
                  {entry.safetyScore}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{entry.routeName}</p>
                  <p className="text-xs text-gray-400">
                    {date.toLocaleDateString()} · {entry.stops.join(' → ')}
                  </p>
                </div>
                {entry.changes.length > 0 && (
                  <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
                    {entry.changes.length} changes
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {selectedHistory && (
        <div
          className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
          onClick={() => setSelectedHistory(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{selectedHistory.routeName}</h3>
              <button onClick={() => setSelectedHistory(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Safety</p>
                <p className="text-lg font-bold text-rose-500">{selectedHistory.safetyScore}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Time</p>
                <p className="text-lg font-bold text-gray-700">{selectedHistory.travelTime}m</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400">Distance</p>
                <p className="text-lg font-bold text-gray-700">{selectedHistory.distance}km</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Stops:</p>
              <div className="flex flex-wrap gap-2">
                {selectedHistory.stops.map((stop, i) => (
                  <span key={i} className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-md">
                    {stop}
                  </span>
                ))}
              </div>
            </div>

            {selectedHistory.changes.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">Condition Changes:</p>
                {selectedHistory.changes.map((change: RouteChange) => {
                  const Icon = changeIcons[change.type] || AlertCircle;
                  const cfg = impactConfig[change.impact];
                  return (
                    <div key={change.id} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color.split(' ')[0]}`} />
                      <div>
                        <p className="text-sm text-gray-700">{change.description}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {change.segmentName} · {change.timeAgo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => {
                setSelectedHistory(null);
                setCurrentPage('plan');
              }}
              className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600"
            >
              Plan Similar Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
