import { useState, useMemo } from 'react';
import {
  Plus,
  X,
  MapPin,
  Clock,
  Navigation,
  Lightbulb,
  Users,
  TramFront,
  Accessibility,
  Store,
  Shield,
  Sparkles,
  ArrowRight,
  Home,
  Building,
  GraduationCap,
  Coffee,
  Calendar,
  ShoppingBag,
  Zap,
  Gauge,
  Check,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { rankRoutes, adjustScoreForTime, interpretNaturalLanguage } from '@/lib/safetyEngine';
import SafetyMap from '@/components/SafetyMap';
import type { JourneyStop, RoutePreferences } from '@/types';

const stopIcons: Record<string, typeof Home> = {
  home: Home,
  work: Building,
  school: GraduationCap,
  cafe: Coffee,
  event: Calendar,
  shop: ShoppingBag,
  other: MapPin,
};

export default function PlanJourneyPage() {
  const {
    routes,
    preferences,
    setPreferences,
    travelHour,
    setTravelHour,
    stops,
    addStop,
    removeStop,
    selectedRouteId,
    setSelectedRouteId,
    setCurrentPage,
    settings,
  } = useApp();

  const [showAddStop, setShowAddStop] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newStopType, setNewStopType] = useState<JourneyStop['type']>('other');
  const [nlInput, setNlInput] = useState('');
  const [nlInterpreted, setNlInterpreted] = useState<Partial<RoutePreferences> | null>(null);
  const [showBookJourney, setShowBookJourney] = useState(false);

  const rankedRoutes = useMemo(
    () => rankRoutes(routes, travelHour, preferences),
    [routes, travelHour, preferences]
  );

  const handleInterpretNL = () => {
    if (!nlInput.trim()) return;
    const result = interpretNaturalLanguage(nlInput);
    setNlInterpreted(result);
  };

  const applyNLPreferences = () => {
    if (!nlInterpreted) return;
    setPreferences({ ...preferences, ...nlInterpreted });
    setNlInput('');
    setNlInterpreted(null);
  };

  const handleAddStop = () => {
    if (!newStopName.trim()) return;
    const lat = 28.6139 + (Math.random() - 0.5) * 0.02;
    const lng = 77.209 + (Math.random() - 0.5) * 0.02;
    addStop({
      id: `stop-${Date.now()}`,
      name: newStopName,
      address: 'Sample address',
      lat,
      lng,
      type: newStopType,
      plannedArrival: 'Flexible',
      durationMinutes: 30,
    });
    setNewStopName('');
    setShowAddStop(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Plan Your Journey</h1>
        <p className="text-sm text-gray-500">Multi-stop planning with time-aware safety scoring</p>
      </div>

      {/* Stops */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" /> Journey Stops
          </h2>
          <button
            onClick={() => setShowAddStop(!showAddStop)}
            className="flex items-center gap-1 text-sm text-rose-500 font-medium hover:underline"
          >
            <Plus className="w-4 h-4" /> Add Stop
          </button>
        </div>

        {stops.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No stops added yet. Add stops to plan your journey.
          </div>
        ) : (
          <div className="space-y-2">
            {stops.map((stop, i) => {
              const Icon = stopIcons[stop.type] || MapPin;
              return (
                <div
                  key={stop.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-50"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{stop.name}</p>
                    <p className="text-xs text-gray-400">{stop.address}</p>
                  </div>
                  <span className="text-xs text-gray-400">{i + 1}</span>
                  <button
                    onClick={() => removeStop(stop.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {showAddStop && (
          <div className="border border-rose-100 rounded-xl p-4 space-y-3 bg-rose-50/30">
            <input
              value={newStopName}
              onChange={(e) => setNewStopName(e.target.value)}
              placeholder="Stop name (e.g. College, Café, Event)"
              className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm outline-none focus:border-rose-300"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(stopIcons) as JourneyStop['type'][]).map((type) => {
                const Icon = stopIcons[type];
                return (
                  <button
                    key={type}
                    onClick={() => setNewStopType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                      newStopType === type
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {type}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddStop}
                className="flex-1 bg-rose-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-rose-600"
              >
                Add Stop
              </button>
              <button
                onClick={() => setShowAddStop(false)}
                className="px-4 bg-gray-100 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Time slider */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-400" /> Planned Travel Time
          </span>
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
          Safety scores update based on the time you plan to travel.
        </p>
      </div>

      {/* Mode selector */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-rose-400" /> Route Mode
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {(['fastest', 'balanced', 'safety'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setPreferences({ ...preferences, mode })}
              className={`p-3 rounded-xl text-sm font-medium capitalize transition-all ${
                preferences.mode === mode
                  ? 'bg-rose-100 text-rose-600 border-2 border-rose-300'
                  : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-rose-50'
              }`}
            >
              {mode === 'safety' ? 'Safety First' : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Preferences sliders */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-4">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" /> Personalized Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PrefSlider
            icon={Lightbulb}
            label="Better Lighting"
            value={preferences.lighting}
            onChange={(v) => setPreferences({ ...preferences, lighting: v })}
          />
          <PrefSlider
            icon={Users}
            label="Populated Roads"
            value={preferences.populated}
            onChange={(v) => setPreferences({ ...preferences, populated: v })}
          />
          <PrefSlider
            icon={TramFront}
            label="Public Transport"
            value={preferences.transport}
            onChange={(v) => setPreferences({ ...preferences, transport: v })}
          />
          <PrefSlider
            icon={Accessibility}
            label="Accessibility"
            value={preferences.accessibility}
            onChange={(v) => setPreferences({ ...preferences, accessibility: v })}
          />
          <PrefSlider
            icon={Clock}
            label="Travel Time"
            value={preferences.travelTime}
            onChange={(v) => setPreferences({ ...preferences, travelTime: v })}
          />
          <PrefSlider
            icon={Store}
            label="Nearby Public Places"
            value={preferences.publicPlaces}
            onChange={(v) => setPreferences({ ...preferences, publicPlaces: v })}
          />
          <PrefSlider
            icon={Shield}
            label="Lower Isolation"
            value={preferences.lowIsolation}
            onChange={(v) => setPreferences({ ...preferences, lowIsolation: v })}
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <PrefToggle
            label="Avoid Isolation"
            value={preferences.avoidIsolation}
            onChange={(v) => setPreferences({ ...preferences, avoidIsolation: v })}
          />
          <PrefToggle
            label="Avoid Stairs"
            value={preferences.avoidStairs}
            onChange={(v) => setPreferences({ ...preferences, avoidStairs: v })}
          />
          <PrefToggle
            label="Wheelchair Friendly"
            value={preferences.wheelchairFriendly}
            onChange={(v) => setPreferences({ ...preferences, wheelchairFriendly: v })}
          />
          <PrefToggle
            label="Easier Crossings"
            value={preferences.easierCrossings}
            onChange={(v) => setPreferences({ ...preferences, easierCrossings: v })}
          />
        </div>
      </div>

      {/* AI natural language input */}
      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-400" /> AI Preference Interpreter
        </h2>
        <p className="text-xs text-gray-500">
          Describe your preferences in natural language. The AI will interpret and apply them.
        </p>
        <div className="flex gap-2">
          <input
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInterpretNL()}
            placeholder="e.g. I can take 10 extra minutes, just avoid quiet streets"
            className="flex-1 px-3 py-2.5 rounded-lg border border-rose-100 bg-white text-sm outline-none focus:border-rose-300"
          />
          <button
            onClick={handleInterpretNL}
            className="px-4 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600"
          >
            Interpret
          </button>
        </div>

        {nlInterpreted && (
          <div className="bg-white rounded-xl p-4 border border-rose-100 space-y-2">
            <p className="text-xs font-semibold text-gray-600">Interpreted Preferences:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nlInterpreted).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs bg-rose-50 text-rose-600 px-2 py-1 rounded-md"
                >
                  {key}: {String(value)}
                </span>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={applyNLPreferences}
                className="flex items-center gap-1.5 bg-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-rose-600"
              >
                <Check className="w-3.5 h-3.5" /> Apply
              </button>
              <button
                onClick={() => setNlInterpreted(null)}
                className="text-gray-400 text-xs font-medium px-3 py-1.5 hover:text-gray-600"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Route results */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-rose-400" /> Recommended Routes
        </h2>
        <div className="space-y-3">
          {rankedRoutes.map((route, i) => {
            const score = adjustScoreForTime(route.safetyScore, travelHour);
            const isSelected = selectedRouteId === route.id;
            const scoreColor =
              score >= 80 ? 'bg-green-50 text-green-600' : score >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600';
            return (
              <div
                key={route.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected ? 'border-rose-300 bg-rose-50' : 'border-gray-100 hover:border-rose-200'
                }`}
                onClick={() => setSelectedRouteId(route.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${scoreColor}`}>
                    {score}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">
                      {i === 0 && <span className="text-rose-500 mr-1">Recommended</span>}
                      {route.name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span>{route.travelTime} min</span>
                      <span>{route.totalDistance} km</span>
                      <span>{route.publicPlacesNearby} places</span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <RouteMetric icon={Lightbulb} label="Well-lit" value={route.wellLit} />
                  <RouteMetric icon={Users} label="Pedestrian" value={route.pedestrianActivity} />
                  <RouteMetric icon={TramFront} label="Transport" value={route.transportAccess} />
                  <RouteMetric icon={Store} label="Places" value={`${route.publicPlacesNearby} nearby`} />
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setShowBookJourney(true)}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 flex items-center justify-center gap-2"
        >
          <Zap className="w-4 h-4" /> Book My Journey
        </button>
      </div>

      {/* Map preview */}
      {selectedRouteId && (
        <div className="bg-white rounded-2xl p-2 border border-rose-100 overflow-hidden">
          <div className="h-64 rounded-xl overflow-hidden">
            <SafetyMap
              routes={rankedRoutes}
              selectedRouteId={selectedRouteId}
              mapStyle={settings.mapStyle}
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Book Journey Modal */}
      {showBookJourney && (
        <BookJourneyModal onClose={() => setShowBookJourney(false)} />
      )}
    </div>
  );
}

function PrefSlider({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Home;
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-rose-400" />
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs text-gray-400 ml-auto">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-rose-400 h-1.5"
      />
    </div>
  );
}

function PrefToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium transition-all ${
        value ? 'bg-rose-100 text-rose-600' : 'bg-gray-50 text-gray-400'
      }`}
    >
      <div
        className={`w-8 h-4 rounded-full transition-colors relative ${
          value ? 'bg-rose-400' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      {label}
    </button>
  );
}

function RouteMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-gray-500">
      <Icon className="w-3 h-3 text-gray-400" />
      <span className="text-gray-400">{label}:</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

function BookJourneyModal({ onClose }: { onClose: () => void }) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<'none' | 'booking' | 'booked'>('none');

  const options = [
    { id: 'uber', name: 'Uber', fare: 185, time: 28, eta: 4, color: 'bg-gray-900' },
    { id: 'ola', name: 'Ola', fare: 165, time: 32, eta: 6, color: 'bg-green-600' },
    { id: 'public', name: 'Public Transport', fare: 30, time: 45, eta: 8, color: 'bg-blue-600' },
    { id: 'walking', name: 'Walking', fare: 0, time: 28, eta: 0, color: 'bg-amber-500' },
  ];

  const handleBook = () => {
    setBookingStatus('booking');
    setTimeout(() => setBookingStatus('booked'), 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Zap className="w-5 h-5 text-rose-400" /> Book My Journey
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {bookingStatus === 'booked' ? (
          <div className="space-y-4 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-gray-800">Ride Details Saved</p>
              <p className="text-sm text-gray-500 mt-1">
                Trip information has been saved locally for offline access.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-1">
              <p><span className="text-gray-400">Provider:</span> {options.find(o => o.id === selectedProvider)?.name}</p>
              <p><span className="text-gray-400">Pickup:</span> Current Location</p>
              <p><span className="text-gray-400">Destination:</span> Destination</p>
              <p><span className="text-gray-400">Est. Time:</span> {options.find(o => o.id === selectedProvider)?.time} min</p>
              <p><span className="text-gray-400">Est. Fare:</span> Rs {options.find(o => o.id === selectedProvider)?.fare}</p>
            </div>
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              Demo mode: No actual ride has been booked. This simulates the booking flow for prototype purposes.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-rose-500 text-white font-semibold py-2.5 rounded-lg hover:bg-rose-600"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedProvider(opt.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    selectedProvider === opt.id
                      ? 'border-rose-300 bg-rose-50'
                      : 'border-gray-100 hover:border-rose-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${opt.color} flex items-center justify-center text-white font-bold text-xs`}>
                    {opt.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{opt.name}</p>
                    <p className="text-xs text-gray-500">
                      {opt.time} min{opt.eta > 0 ? ` · ETA ${opt.eta} min` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-700">
                    {opt.fare === 0 ? 'Free' : `Rs ${opt.fare}`}
                  </span>
                </button>
              ))}
            </div>
            {selectedProvider && (
              <button
                onClick={handleBook}
                disabled={bookingStatus === 'booking'}
                className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookingStatus === 'booking' ? 'Saving...' : 'Book Ride'}
                {bookingStatus === 'none' && <ArrowRight className="w-4 h-4" />}
              </button>
            )}
            <p className="text-xs text-gray-400 text-center">
              Demo integration — real booking APIs can be connected here.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
