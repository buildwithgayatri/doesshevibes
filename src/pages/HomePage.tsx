import { useState, useMemo } from 'react';
import {
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
  Navigation,
  MapPin,
  Zap,
  Activity,
  ArrowRight,
  Sun,
  Moon,
  Sunset,
  Sunrise,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { rankRoutes, adjustScoreForTime } from '@/lib/safetyEngine';
import { samplePlaces, sampleReports } from '@/data/sampleData';

export default function HomePage() {
  const {
    routes,
    preferences,
    travelHour,
    setTravelHour,
    setCurrentPage,
    setSelectedRouteId,
    isOnline,
    reports,
  } = useApp();

  const [from, setFrom] = useState('Home — Connaught Place');
  const [to, setTo] = useState('College — Sansad Marg');

  const rankedRoutes = useMemo(
    () => rankRoutes(routes, travelHour, preferences),
    [routes, travelHour, preferences]
  );

  const topRoute = rankedRoutes[0];
  const activeReports = reports.filter((r) => r.status === 'active');
  const openPlaces = samplePlaces.filter((p) => p.isOpen);

  const timeIcon =
    travelHour >= 6 && travelHour < 18 ? (
      <Sun className="w-4 h-4 text-amber-400" />
    ) : travelHour >= 18 && travelHour < 20 ? (
      <Sunset className="w-4 h-4 text-orange-400" />
    ) : travelHour >= 5 && travelHour < 6 ? (
      <Sunrise className="w-4 h-4 text-amber-300" />
    ) : (
      <Moon className="w-4 h-4 text-indigo-400" />
    );

  const timeLabel = useMemo(() => {
    const h = travelHour;
    if (h >= 6 && h < 9) return 'Morning Rush';
    if (h >= 9 && h < 12) return 'Morning';
    if (h >= 12 && h < 17) return 'Afternoon';
    if (h >= 17 && h < 20) return 'Evening Rush';
    if (h >= 20 && h < 23) return 'Evening';
    return 'Late Night';
  }, [travelHour]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-400 via-pink-400 to-rose-500 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Plan your journey safely
          </h1>
          <p className="text-white/90 mb-6 max-w-lg">
            Smart navigation designed for women's safety — with time-aware scoring,
            community reports, and real-time conditions.
          </p>

          {/* Quick plan */}
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2.5">
              <MapPin className="w-4 h-4 text-white/80 shrink-0" />
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="From"
                className="bg-transparent text-white placeholder-white/60 text-sm outline-none flex-1"
              />
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2.5">
              <Navigation className="w-4 h-4 text-white/80 shrink-0" />
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="To"
                className="bg-transparent text-white placeholder-white/60 text-sm outline-none flex-1"
              />
            </div>
            <button
              onClick={() => setCurrentPage('plan')}
              className="w-full bg-white text-rose-500 font-semibold py-2.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              Plan Journey <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Top Route Safety</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {adjustScoreForTime(topRoute.safetyScore, travelHour)}
            <span className="text-sm text-gray-400">/100</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Travel Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {topRoute.travelTime}
            <span className="text-sm text-gray-400"> min</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Active Reports</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{activeReports.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-rose-100">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-rose-400" />
            <span className="text-xs text-gray-500">Open Places</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{openPlaces.length}</p>
        </div>
      </div>

      {/* Time slider */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {timeIcon}
            <span className="text-sm font-semibold text-gray-700">
              Travel Time: {timeLabel}
            </span>
          </div>
          <span className="text-sm font-bold text-rose-500">
            {travelHour.toString().padStart(2, '0')}:00
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={23}
          value={travelHour}
          onChange={(e) => setTravelHour(Number(e.target.value))}
          className="w-full accent-rose-400"
        />
        <p className="text-xs text-gray-400 mt-2">
          Safety scores adjust based on time of day. Late night routes score lower due to reduced lighting and pedestrian activity.
        </p>
      </div>

      {/* Route preview */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Recommended Routes</h2>
          <button
            onClick={() => setCurrentPage('explore')}
            className="text-sm text-rose-500 font-medium flex items-center gap-1 hover:underline"
          >
            View on map <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {rankedRoutes.slice(0, 3).map((route, i) => {
            const score = adjustScoreForTime(route.safetyScore, travelHour);
            const scoreColor =
              score >= 80 ? 'text-green-600 bg-green-50' : score >= 60 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
            return (
              <button
                key={route.id}
                onClick={() => {
                  setSelectedRouteId(route.id);
                  setCurrentPage('explore');
                }}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-rose-50 transition-colors text-left border border-gray-100"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${scoreColor}`}>
                  {score}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">
                    {i === 0 && <span className="text-rose-500 mr-1">Recommended</span>}
                    {route.name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {route.travelTime} min
                    </span>
                    <span>{route.totalDistance} km</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {route.publicPlacesNearby} places
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction
          icon={Shield}
          label="Safety Center"
          color="bg-red-50 text-red-500"
          onClick={() => setCurrentPage('safety')}
        />
        <QuickAction
          icon={Navigation}
          label="Plan Journey"
          color="bg-blue-50 text-blue-500"
          onClick={() => setCurrentPage('plan')}
        />
        <QuickAction
          icon={Activity}
          label="Community"
          color="bg-purple-50 text-purple-500"
          onClick={() => setCurrentPage('community')}
        />
        <QuickAction
          icon={Zap}
          label="Active Journey"
          color="bg-amber-50 text-amber-500"
          onClick={() => setCurrentPage('active')}
        />
      </div>

      {!isOnline && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-700">Offline Mode</p>
            <p className="text-xs text-amber-600">
              Showing saved Journey Capsule data. Connect to plan new routes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: typeof Shield;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-rose-300 transition-colors flex flex-col items-center gap-2"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </button>
  );
}
