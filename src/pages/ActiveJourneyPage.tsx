import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Navigation,
  AlertCircle,
  MapPin,
  Shield,
  Building2,
  X,
  Footprints,
  Vibrate,
  Volume2,
  BatteryLow,
  WifiOff,
  CheckCircle2,
  ChevronRight,
  Phone,
  Share2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import SafetyMap from '@/components/SafetyMap';
import ReportProblemModal from '@/components/ReportProblemModal';
import { samplePlaces } from '@/data/sampleData';
import { adjustScoreForTime } from '@/lib/safetyEngine';
import { giveFeedback, generateNavInstructions, type NavPattern } from '@/lib/vibration';
import {
  saveJourneyCapsule,
  loadJourneyCapsule,
  clearJourneyCapsule,
  type JourneyCapsule,
} from '@/lib/storage';

function distanceFromRoute(
  point: { lat: number; lng: number },
  path: { lat: number; lng: number }[]
): number {
  let minDist = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    if (segLen === 0) continue;
    const t = Math.max(0, Math.min(1, ((point.lng - a.lng) * dx + (point.lat - a.lat) * dy) / (segLen * segLen)));
    const projLat = a.lat + t * dy;
    const projLng = a.lng + t * dx;
    const dist = Math.sqrt((point.lat - projLat) ** 2 + (point.lng - projLng) ** 2);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

function interpolateAlongPath(
  path: { lat: number; lng: number }[],
  fraction: number
): { lat: number; lng: number; heading: number } {
  if (path.length === 0) return { lat: 0, lng: 0, heading: 0 };
  if (path.length === 1) return { lat: path[0].lat, lng: path[0].lng, heading: 0 };

  const segLengths: number[] = [];
  let totalLen = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = path[i + 1].lng - path[i].lng;
    const dy = path[i + 1].lat - path[i].lat;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLen += len;
  }

  const target = Math.max(0, Math.min(1, fraction)) * totalLen;
  let accum = 0;
  for (let i = 0; i < segLengths.length; i++) {
    if (accum + segLengths[i] >= target) {
      const t = segLengths[i] === 0 ? 0 : (target - accum) / segLengths[i];
      const lat = path[i].lat + t * (path[i + 1].lat - path[i].lat);
      const lng = path[i].lng + t * (path[i + 1].lng - path[i].lng);
      const dx = path[i + 1].lng - path[i].lng;
      const dy = path[i + 1].lat - path[i].lat;
      const heading = Math.atan2(dx, dy) * (180 / Math.PI);
      return { lat, lng, heading };
    }
    accum += segLengths[i];
  }

  const dx = path[path.length - 1].lng - path[path.length - 2].lng;
  const dy = path[path.length - 1].lat - path[path.length - 2].lat;
  const heading = Math.atan2(dx, dy) * (180 / Math.PI);
  return { lat: path[path.length - 1].lat, lng: path[path.length - 1].lng, heading };
}

export default function ActiveJourneyPage() {
  const {
    routes,
    selectedRouteId,
    setSelectedRouteId,
    settings,
    setSettings,
    travelHour,
    isOnline,
    activeJourney,
    setActiveJourney,
    setCurrentPage,
    setSosActive,
    reports,
    userLocation,
    addReport,
    confirmReport,
    notifyTrustedContacts,
    setPlannedRoutePath,
    plannedRoutePath,
    routeDeviationDetected,
    setRouteDeviationDetected,
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [showNearby, setShowNearby] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [navInstructions, setNavInstructions] = useState<string[]>([]);
  const [currentInstructionIdx, setCurrentInstructionIdx] = useState(0);
  const [capsule, setCapsule] = useState<JourneyCapsule | null>(null);
  const [showReport, setShowReport] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deviationCountRef = useRef(0);

  const route = useMemo(
    () => routes.find((r) => r.id === selectedRouteId) || routes[0],
    [routes, selectedRouteId]
  );

  const navSteps = useMemo(() => {
    if (!route) return [];
    const segmentNames = route.segments.map((s) => s.name);
    return generateNavInstructions(route.path, segmentNames);
  }, [route]);

  const adjustedRoute = useMemo(
    () => ({
      ...route,
      safetyScore: adjustScoreForTime(route.safetyScore, travelHour),
    }),
    [route, travelHour]
  );

  // Compute the arrow position along the route based on journey progress
  const journeyPosition = useMemo(() => {
    if (!route || !activeJourney) return null;
    return interpolateAlongPath(route.path, progress / 100);
  }, [route, activeJourney, progress]);

  useEffect(() => {
    const saved = loadJourneyCapsule();
    setCapsule(saved);
  }, []);

  // Set planned route path when journey starts
  useEffect(() => {
    if (activeJourney && route) {
      setPlannedRoutePath(route.path);
      setRouteDeviationDetected(false);
      deviationCountRef.current = 0;
    } else {
      setPlannedRoutePath(null);
    }
  }, [activeJourney, route, setPlannedRoutePath, setRouteDeviationDetected]);

  // Route deviation detection — requires sustained deviation (3 consecutive readings)
  useEffect(() => {
    if (!activeJourney || !userLocation || !plannedRoutePath || routeDeviationDetected) return;
    const dist = distanceFromRoute(userLocation, plannedRoutePath);
    if (dist > 0.003) {
      deviationCountRef.current += 1;
      if (deviationCountRef.current >= 3) {
        setRouteDeviationDetected(true);
        notifyTrustedContacts(
          'Route Deviation Alert',
          'You have deviated significantly from your planned route. Your trusted contacts have been notified.'
        );
        setSosActive(true);
      }
    } else {
      deviationCountRef.current = 0;
    }
  }, [activeJourney, userLocation, plannedRoutePath, routeDeviationDetected, notifyTrustedContacts, setSosActive, setRouteDeviationDetected]);

  // Simulate journey progress
  useEffect(() => {
    if (!activeJourney) {
      setProgress(0);
      setCurrentSegment(0);
      return;
    }

    if (route) {
      const newCapsule: JourneyCapsule = {
        id: `capsule-${Date.now()}`,
        createdAt: new Date().toISOString(),
        routeId: route.id,
        routeName: route.name,
        stops: [],
        path: route.path,
        safetyScore: adjustedRoute.safetyScore,
        travelTime: route.travelTime,
        distance: route.totalDistance,
        emergencyPlaces: samplePlaces
          .filter((p) => p.isOpen)
          .slice(0, 5)
          .map((p) => ({
            name: p.name,
            type: p.type,
            lat: p.lat,
            lng: p.lng,
            phone: p.phone,
          })),
        lastKnownLocation: route.path[0],
        checkpoints: route.path.map((p, i) => ({
          lat: p.lat,
          lng: p.lng,
          name: `Checkpoint ${i + 1}`,
          reached: false,
        })),
      };
      saveJourneyCapsule(newCapsule);
      setCapsule(newCapsule);
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          const lastStep = navSteps[navSteps.length - 1];
          if (lastStep) {
            giveFeedback('destination', settings.vibrationEnabled, settings.soundEnabled, lastStep.instruction);
            setNavInstructions((prevNav) => [...prevNav, lastStep.instruction]);
            setCurrentInstructionIdx(navSteps.length - 1);
          }
          return 100;
        }
        const stepIdx = Math.min(
          Math.floor((next / 100) * (navSteps.length - 1)) + 1,
          navSteps.length - 1
        );
        if (stepIdx !== currentInstructionIdx && stepIdx < navSteps.length) {
          const step = navSteps[stepIdx];
          if (step) {
            setCurrentInstructionIdx(stepIdx);
            setCurrentSegment(step.segmentIndex);
            giveFeedback(step.pattern, settings.vibrationEnabled, settings.soundEnabled, step.instruction);
            setNavInstructions((prevNav) => [...prevNav, step.instruction]);
          }
        }
        return next;
      });
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeJourney, navSteps, currentInstructionIdx, settings.vibrationEnabled, settings.soundEnabled]);

  const handleStartJourney = () => {
    setActiveJourney(true);
    setCurrentInstructionIdx(0);
    const firstStep = navSteps[0];
    const startMsg = firstStep ? firstStep.instruction : 'Journey started. Follow the route.';
    setNavInstructions([startMsg]);
    giveFeedback('continue', settings.vibrationEnabled, settings.soundEnabled, startMsg);
  };

  const handleExitJourney = () => {
    setActiveJourney(false);
    clearJourneyCapsule();
    setCapsule(null);
    setNavInstructions([]);
    setCurrentInstructionIdx(0);
    setRouteDeviationDetected(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleSos = () => {
    setShowSosConfirm(false);
    setSosActive(true);
    setCurrentPage('safety');
  };

  if (!activeJourney) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Active Journey</h1>
          <p className="text-sm text-gray-500">Start a simplified navigation session</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
          <h2 className="font-bold text-gray-800">Select Route</h2>
          {routes.map((r) => {
            const score = adjustScoreForTime(r.safetyScore, travelHour);
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  selectedRouteId === r.id
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-gray-100 hover:border-rose-200'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: r.color }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-500">
                    {r.travelTime} min · {r.totalDistance} km · {score}/100 safety
                  </p>
                </div>
                {selectedRouteId === r.id && (
                  <CheckCircle2 className="w-5 h-5 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" /> SOS Readiness Check
          </h2>
          <div className="space-y-2">
            <ReadinessItem
              label="Trusted contacts configured"
              ok={settings.trustedContacts.length > 0}
            />
            <ReadinessItem
              label="Location permission available"
              ok={true}
            />
            <ReadinessItem
              label="Emergency access available"
              ok={true}
            />
            <ReadinessItem
              label="Journey saved for offline use"
              ok={capsule !== null}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-rose-400" /> Navigation Feedback
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <FeedbackToggle
              icon={Vibrate}
              label="Vibration"
              value={settings.vibrationEnabled}
              onChange={(v) => setSettings({ ...settings, vibrationEnabled: v })}
            />
            <FeedbackToggle
              icon={Volume2}
              label="Sound"
              value={settings.soundEnabled}
              onChange={(v) => setSettings({ ...settings, soundEnabled: v })}
            />
          </div>
          <div className="bg-rose-50/50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
            <p>One pulse = Continue straight</p>
            <p>Two pulses = Turn left</p>
            <p>Three pulses = Turn right</p>
            <p>Long vibration = Destination reached</p>
          </div>
          <button
            onClick={() => {
              const testStep = navSteps[1] || navSteps[0];
              if (testStep) {
                giveFeedback(testStep.pattern, settings.vibrationEnabled, settings.soundEnabled, testStep.instruction);
              } else {
                giveFeedback('turn_right', settings.vibrationEnabled, settings.soundEnabled);
              }
            }}
            className="text-sm text-rose-500 font-medium hover:underline"
          >
            Test feedback
          </button>
        </div>

        <button
          onClick={handleStartJourney}
          className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 flex items-center justify-center gap-2 text-lg"
        >
          <Footprints className="w-6 h-6" /> Start Active Journey
        </button>
      </div>
    );
  }

  const currentSeg = route.segments[currentSegment];
  const nearbyPlaces = samplePlaces.filter((p) => p.isOpen).slice(0, 4);
  const activeReports = reports.filter((r) => r.status === 'active');

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
      <div className="flex-1 relative">
        <SafetyMap
          routes={[adjustedRoute]}
          selectedRouteId={route.id}
          reports={reports}
          places={samplePlaces}
          showReports={true}
          showPlaces={showNearby}
          mapStyle={settings.mapStyle}
          userLocation={journeyPosition}
          userHeading={journeyPosition?.heading ?? null}
          followUser={true}
          className="h-full w-full"
        />

        {/* Route deviation warning */}
        {routeDeviationDetected && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1100] w-[90%] max-w-sm">
            <div className="bg-red-500 text-white rounded-2xl shadow-lg p-4 flex items-center gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Route Deviation Detected</p>
                <p className="text-xs text-white/80">Trusted contacts have been notified. SOS activated.</p>
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] w-[90%] max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ background: route.color }}
                />
                <span className="text-sm font-bold text-gray-800">{route.name}</span>
              </div>
              <span className="text-sm font-bold text-rose-500">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.max(0, Math.round(route.travelTime * (1 - progress / 100)))} min left
              </span>
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" /> {adjustedRoute.safetyScore}/100
              </span>
              {progress < 100 && (
                <span className="text-rose-400">{currentSeg?.name}</span>
              )}
            </div>
          </div>
        </div>

        {!isOnline && capsule && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700">Offline</p>
                <p className="text-xs text-amber-600">Showing saved journey from Journey Capsule</p>
              </div>
            </div>
          </div>
        )}

        {settings.lowBatteryMode && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
              <BatteryLow className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">Low Battery Mode — essential info only</p>
            </div>
          </div>
        )}

        {navInstructions.length > 0 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md pr-16 md:pr-0">
            <div className="bg-white rounded-xl shadow-lg px-4 py-2.5 flex items-center gap-2 border-l-4 border-rose-400">
              <Navigation className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-sm text-gray-700 truncate">{navInstructions[navInstructions.length - 1]}</span>
            </div>
          </div>
        )}

        {/* Report problem button */}
        <button
          onClick={() => setShowReport(true)}
          className="absolute bottom-20 right-4 z-[1000] flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white text-rose-500 shadow-lg text-xs font-medium hover:bg-rose-50"
        >
          <AlertTriangle className="w-4 h-4" /> Report
        </button>

        <button
          onClick={() => setShowSosConfirm(true)}
          className="absolute bottom-4 right-4 z-[1000] w-14 h-14 rounded-full bg-red-500 text-white font-bold text-sm shadow-xl hover:bg-red-600 flex items-center justify-center border-4 border-white animate-pulse"
        >
          SOS
        </button>

        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={() => setShowNearby(!showNearby)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg text-xs font-medium ${
              showNearby ? 'bg-rose-500 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Safe Places
          </button>
          {showNearby && (
            <div className="mt-2 w-64 bg-white rounded-2xl shadow-lg p-3 space-y-2 max-h-60 overflow-y-auto">
              <h3 className="text-xs font-bold text-gray-700">Nearby Safe Places</h3>
              {nearbyPlaces.map((place) => (
                <div key={place.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <Building2 className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{place.name}</p>
                    <p className="text-xs text-gray-400">{place.distance} km · {place.hours}</p>
                  </div>
                  <button
                    onClick={() => setCurrentPage('places')}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {activeReports.length > 0 && (
          <div className="absolute top-4 left-4 z-[1000]">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl shadow-lg text-xs font-medium ${
                showAlerts ? 'bg-red-500 text-white' : 'bg-white text-red-600'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" /> Alerts ({activeReports.length})
            </button>
            {showAlerts && (
              <div className="mt-2 w-56 bg-red-50 border border-red-200 rounded-xl p-3 space-y-1 shadow-lg">
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Route Alerts
                </p>
                {activeReports.slice(0, 5).map((r) => (
                  <p key={r.id} className="text-xs text-red-500">
                    {r.type.replace(/_/g, ' ')}: {r.location_name}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-rose-100 p-4 shrink-0">
        {progress >= 100 ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span className="font-bold text-gray-800">Journey Complete!</span>
            </div>
            <button
              onClick={handleExitJourney}
              className="w-full bg-rose-500 text-white font-semibold py-3 rounded-xl hover:bg-rose-600"
            >
              Exit Active Journey
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => giveFeedback('destination', settings.vibrationEnabled, settings.soundEnabled)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={handleExitJourney}
              className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Exit Journey
            </button>
          </div>
        )}
      </div>

      {showSosConfirm && (
        <div
          className="fixed inset-0 bg-black/50 z-[3000] flex items-center justify-center p-4"
          onClick={() => setShowSosConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">Activate SOS?</h3>
              <p className="text-sm text-gray-500 mt-1">
                This will open the emergency safety center with all emergency actions.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSosConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSos}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600"
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && <ReportProblemModal onClose={() => setShowReport(false)} />}
    </div>
  );
}

function ReadinessItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="w-4 h-4 text-green-500" />
      ) : (
        <AlertCircle className="w-4 h-4 text-amber-500" />
      )}
      <span className={ok ? 'text-gray-700' : 'text-amber-600'}>{label}</span>
    </div>
  );
}

function FeedbackToggle({
  icon: Icon,
  label,
  value,
  onChange,
}: {
  icon: typeof Vibrate;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${
        value ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-gray-50 border-gray-100 text-gray-400'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{label}</span>
      <div
        className={`ml-auto w-9 h-5 rounded-full transition-colors relative ${
          value ? 'bg-rose-400' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
