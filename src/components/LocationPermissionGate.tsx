import { useState } from 'react';
import { MapPin, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LocationPermissionGate() {
  const { locationPermission, locationError, startLocationWatch, userLocation } = useApp();
  const [requesting, setRequesting] = useState(false);

  if (locationPermission === 'granted') return null;

  const handleRequest = () => {
    setRequesting(true);
    startLocationWatch();
    setTimeout(() => setRequesting(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[5000] bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/images/SheeshWay_Logo.jpeg"
            alt="SheeshWay"
            className="w-20 h-20 rounded-2xl mx-auto mb-4 object-cover shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-1">SheeshWay</h1>
          <p className="text-sm text-rose-500 font-medium">Don't Just Go. Know.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-rose-100 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6 text-rose-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Enable Location Access</h2>
              <p className="text-sm text-gray-500 mt-1">
                SheeshWay needs your location to show your live position on the map,
                provide sound navigation, detect route deviations, and alert your
                trusted contacts in emergencies.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <BenefitRow icon={MapPin} text="Live pink arrow showing your real-time position" />
            <BenefitRow icon={ShieldCheck} text="Automatic alerts to trusted contacts if you deviate from your route" />
            <BenefitRow icon={AlertCircle} text="SOS activation when significant route deviation is detected" />
          </div>

          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{locationError}</p>
            </div>
          )}

          <button
            onClick={handleRequest}
            disabled={requesting || locationPermission === 'denied'}
            className="w-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {requesting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Requesting...
              </>
            ) : locationPermission === 'denied' ? (
              'Location Denied — Check browser settings'
            ) : (
              <>
                <MapPin className="w-5 h-5" /> Allow Location Access
              </>
            )}
          </button>

          {locationPermission === 'denied' && (
            <p className="text-xs text-gray-400 text-center">
              Please enable location permissions in your browser settings and reload the page.
            </p>
          )}

          {!userLocation && locationPermission === 'pending' && !requesting && (
            <p className="text-xs text-gray-400 text-center">
              Your location is only shared with trusted contacts you choose, and only during emergencies.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ icon: Icon, text }: { icon: typeof MapPin; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-rose-400" />
      </div>
      <span>{text}</span>
    </div>
  );
}
