import { useState, useMemo } from 'react';
import {
  Building2,
  Hospital,
  Coffee,
  ShoppingBag,
  Fuel,
  Shield,
  TramFront,
  MapPin,
  Navigation,
  Clock,
  Phone,
  Star,
  Zap,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SafetyMap from '@/components/SafetyMap';
import { samplePlaces, placeTypeLabels } from '@/data/sampleData';
import type { PublicPlace } from '@/types';

const typeIcons: Record<string, typeof Hospital> = {
  hospital: Hospital,
  cafe: Coffee,
  shop: ShoppingBag,
  petrol: Fuel,
  police: Shield,
  transport: TramFront,
  public: Building2,
};

export default function PublicPlacesPage() {
  const { settings, setCurrentPage } = useApp();
  const [filterType, setFilterType] = useState<string | null>(null);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [showGetMePublic, setShowGetMePublic] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PublicPlace | null>(null);

  const filteredPlaces = useMemo(() => {
    let result = samplePlaces;
    if (filterType) result = result.filter((p) => p.type === filterType);
    if (showOpenOnly) result = result.filter((p) => p.isOpen);
    return result.sort((a, b) => a.distance - b.distance);
  }, [filterType, showOpenOnly]);

  const getMePublicPlaces = useMemo(
    () =>
      samplePlaces
        .filter((p) => p.isOpen)
        .sort((a, b) => {
          const scoreA = a.distance * 10 - (a.accessible ? 5 : 0) - (a.rating || 0);
          const scoreB = b.distance * 10 - (b.accessible ? 5 : 0) - (b.rating || 0);
          return scoreA - scoreB;
        })
        .slice(0, 5),
    []
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Public Places</h1>
          <p className="text-sm text-gray-500">Safe, currently-open places near your route</p>
        </div>
        <button
          onClick={() => setShowGetMePublic(true)}
          className="bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold px-4 py-2.5 rounded-xl hover:opacity-90 flex items-center gap-2 text-sm"
        >
          <Zap className="w-4 h-4" /> Get Me Somewhere Public
        </button>
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl p-2 border border-rose-100 overflow-hidden">
        <div className="h-64 rounded-xl overflow-hidden">
          <SafetyMap
            places={filteredPlaces}
            showPlaces={true}
            mapStyle={settings.mapStyle}
            className="h-full w-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterType(null)}
          className={`px-3 py-2 rounded-lg text-xs font-medium ${
            filterType === null ? 'bg-rose-100 text-rose-600' : 'bg-white text-gray-500 border border-gray-100'
          }`}
        >
          All
        </button>
        {Object.entries(placeTypeLabels).map(([type, meta]) => {
          const Icon = typeIcons[type] || Building2;
          return (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
                filterType === type
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {meta.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowOpenOnly(!showOpenOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium ${
            showOpenOnly ? 'bg-green-50 text-green-600' : 'bg-white text-gray-500 border border-gray-100'
          }`}
        >
          {showOpenOnly ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
          Open Now
        </button>
      </div>

      {/* Places grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlaces.map((place) => {
          const Icon = typeIcons[place.type] || Building2;
          const meta = placeTypeLabels[place.type];
          return (
            <button
              key={place.id}
              onClick={() => setSelectedPlace(place)}
              className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-rose-200 transition-colors text-left space-y-2"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: meta.color + '20' }}
                >
                  <Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{place.name}</p>
                  <p className="text-xs text-gray-400">{meta.label} · {place.distance} km</p>
                </div>
                {place.isOpen ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                    Open
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                    Closed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {place.hours}
                </span>
                {place.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> {place.rating}
                  </span>
                )}
                {place.accessible && (
                  <span className="text-green-500 font-medium">Accessible</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Place detail modal */}
      {selectedPlace && (
        <div
          className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
          onClick={() => setSelectedPlace(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedPlace.name}</h3>
                <p className="text-sm text-gray-400">
                  {placeTypeLabels[selectedPlace.type].label}
                </p>
              </div>
              <button onClick={() => setSelectedPlace(null)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Status</p>
                <p className={`text-sm font-semibold ${selectedPlace.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedPlace.isOpen ? 'Open Now' : 'Closed'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Hours</p>
                <p className="text-sm font-semibold text-gray-700">{selectedPlace.hours}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Distance</p>
                <p className="text-sm font-semibold text-gray-700">{selectedPlace.distance} km</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400">Accessible</p>
                <p className={`text-sm font-semibold ${selectedPlace.accessible ? 'text-green-600' : 'text-gray-500'}`}>
                  {selectedPlace.accessible ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> {selectedPlace.address}
              </p>
              {selectedPlace.phone && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> {selectedPlace.phone}
                </p>
              )}
              {selectedPlace.rating && (
                <p className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> {selectedPlace.rating} / 5
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedPlace(null);
                setCurrentPage('explore');
              }}
              className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600 flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" /> Navigate Here
            </button>
          </div>
        </div>
      )}

      {/* Get Me Somewhere Public modal */}
      {showGetMePublic && (
        <div
          className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
          onClick={() => setShowGetMePublic(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-rose-400" /> Get Me Somewhere Public
              </h3>
              <button onClick={() => setShowGetMePublic(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Nearest open public places, ranked by distance, accessibility, and availability.
            </p>
            <div className="space-y-2">
              {getMePublicPlaces.map((place, i) => {
                const Icon = typeIcons[place.type] || Building2;
                const meta = placeTypeLabels[place.type];
                return (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place);
                      setShowGetMePublic(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-rose-200 transition-colors text-left"
                  >
                    <span className="text-sm font-bold text-rose-400 w-5">{i + 1}</span>
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: meta.color + '20' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{place.name}</p>
                      <p className="text-xs text-gray-400">
                        {place.distance} km · {place.hours}
                      </p>
                    </div>
                    {place.accessible && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
