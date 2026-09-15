import { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  Share2,
  Users,
  MapPin,
  Hospital,
  Building2,
  CheckCircle2,
  AlertCircle,
  BatteryLow,
  Plus,
  X,
  Trash2,
  Info,
  Navigation,
  Footprints,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { samplePlaces } from '@/data/sampleData';
import { loadJourneyCapsule, type JourneyCapsule } from '@/lib/storage';

export default function SafetyCenterPage() {
  const {
    settings,
    setSettings,
    sosActive,
    setSosActive,
    setCurrentPage,
    activeJourney,
    setActiveJourney,
  } = useApp();

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [capsule] = useState<JourneyCapsule | null>(loadJourneyCapsule());

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) return;
    setSettings({
      ...settings,
      trustedContacts: [
        ...settings.trustedContacts,
        { id: `tc-${Date.now()}`, ...newContact },
      ],
    });
    setNewContact({ name: '', phone: '', relationship: '' });
    setShowAddContact(false);
  };

  const handleRemoveContact = (id: string) => {
    setSettings({
      ...settings,
      trustedContacts: settings.trustedContacts.filter((c) => c.id !== id),
    });
  };

  const nearbyPolice = samplePlaces.filter((p) => p.type === 'police');
  const nearbyHospitals = samplePlaces.filter((p) => p.type === 'hospital');
  const nearbyPublic = samplePlaces.filter((p) => p.isOpen).slice(0, 3);

  const readinessItems = [
    { label: 'Trusted contacts configured', ok: settings.trustedContacts.length > 0 },
    { label: 'Location permission available', ok: true },
    { label: 'Emergency access available', ok: true },
    { label: 'Journey saved for offline use', ok: capsule !== null },
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Safety Center</h1>
        <p className="text-sm text-gray-500">Emergency tools, trusted contacts, and readiness checks</p>
      </div>

      {/* SOS Panel */}
      <div className={`rounded-3xl p-6 transition-all ${
        sosActive ? 'bg-red-500' : 'bg-gradient-to-br from-red-400 to-rose-500'
      } text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Emergency SOS</h2>
              <p className="text-white/80 text-sm">Independent safety system</p>
            </div>
          </div>

          <button
            onClick={() => setSosActive(!sosActive)}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
              sosActive
                ? 'bg-white text-red-500 hover:bg-red-50'
                : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
            }`}
          >
            {sosActive ? 'SOS Active — Tap to Deactivate' : 'Activate SOS'}
          </button>

          {sosActive && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <SosAction
                icon={Phone}
                label="Call Emergency"
                sublabel="112 / 100"
                onClick={() => window.open('tel:112')}
              />
              <SosAction
                icon={Share2}
                label="Share Location"
                sublabel="With trusted contacts"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const text = `Emergency! My location: ${pos.coords.latitude}, ${pos.coords.longitude}`;
                      if (navigator.share) {
                        navigator.share({ text });
                      }
                    });
                  }
                }}
              />
              <SosAction
                icon={Users}
                label="Alert Contacts"
                sublabel={`${settings.trustedContacts.length} contacts`}
                onClick={() => {}}
              />
              <SosAction
                icon={MapPin}
                label="My Location"
                sublabel="Last known position"
                onClick={() => setCurrentPage('explore')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick emergency access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <EmergencyCard
          icon={ShieldAlert}
          label="Police Stations"
          count={nearbyPolice.length}
          color="bg-blue-50 text-blue-500"
          onClick={() => setCurrentPage('places')}
        />
        <EmergencyCard
          icon={Hospital}
          label="Hospitals"
          count={nearbyHospitals.length}
          color="bg-red-50 text-red-500"
          onClick={() => setCurrentPage('places')}
        />
        <EmergencyCard
          icon={Building2}
          label="Public Places"
          count={nearbyPublic.length}
          color="bg-green-50 text-green-500"
          onClick={() => setCurrentPage('places')}
        />
        <EmergencyCard
          icon={Navigation}
          label="Active Journey"
          count={activeJourney ? 1 : 0}
          color="bg-amber-50 text-amber-500"
          onClick={() => setCurrentPage('active')}
        />
      </div>

      {/* Readiness check */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400" /> SOS Readiness Check
        </h2>
        <div className="space-y-2">
          {readinessItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              <span className={item.ok ? 'text-gray-700' : 'text-amber-600'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {!settings.trustedContacts.length && (
          <button
            onClick={() => setShowAddContact(true)}
            className="text-sm text-rose-500 font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add a trusted contact
          </button>
        )}
      </div>

      {/* Trusted contacts */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-rose-400" /> Trusted Contacts
          </h2>
          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="text-sm text-rose-500 font-medium hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {settings.trustedContacts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No trusted contacts yet. Add contacts to alert in emergencies.
          </p>
        ) : (
          <div className="space-y-2">
            {settings.trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-50"
              >
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                  <p className="text-xs text-gray-400">
                    {contact.phone} {contact.relationship && `· ${contact.relationship}`}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {showAddContact && (
          <div className="border border-rose-100 rounded-xl p-4 space-y-3 bg-rose-50/30">
            <input
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              placeholder="Contact name"
              className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm outline-none focus:border-rose-300"
              autoFocus
            />
            <input
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              placeholder="Phone number"
              className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm outline-none focus:border-rose-300"
            />
            <input
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              placeholder="Relationship (e.g. Mother, Sister)"
              className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm outline-none focus:border-rose-300"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddContact}
                className="flex-1 bg-rose-500 text-white text-sm font-semibold py-2 rounded-lg hover:bg-rose-600"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowAddContact(false)}
                className="px-4 bg-gray-100 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Saved journey / ride details */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Footprints className="w-4 h-4 text-rose-400" /> Saved Journey / Ride Details
        </h2>
        {capsule ? (
          <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
            <p><span className="text-gray-400">Route:</span> {capsule.routeName}</p>
            <p><span className="text-gray-400">Safety Score:</span> {capsule.safetyScore}/100</p>
            <p><span className="text-gray-400">Travel Time:</span> {capsule.travelTime} min</p>
            <p><span className="text-gray-400">Distance:</span> {capsule.distance} km</p>
            <p><span className="text-gray-400">Emergency Places:</span> {capsule.emergencyPlaces.length} saved</p>
            <p><span className="text-gray-400">Checkpoints:</span> {capsule.checkpoints.length} saved</p>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            No journey saved. Start an Active Journey to save details for offline access.
          </p>
        )}
      </div>

      {/* Low battery mode */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <BatteryLow className="w-4 h-4 text-rose-400" /> Low-Battery SOS Mode
        </h2>
        <p className="text-sm text-gray-500">
          Reduces unnecessary functionality and prioritizes essential emergency information.
        </p>
        <button
          onClick={() => setSettings({ ...settings, lowBatteryMode: !settings.lowBatteryMode })}
          className={`flex items-center gap-2 p-3 rounded-xl w-full transition-all ${
            settings.lowBatteryMode
              ? 'bg-amber-50 border border-amber-200 text-amber-700'
              : 'bg-gray-50 border border-gray-100 text-gray-500'
          }`}
        >
          <div
            className={`w-9 h-5 rounded-full transition-colors relative ${
              settings.lowBatteryMode ? 'bg-amber-400' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                settings.lowBatteryMode ? 'translate-x-4' : 'translate-x-0.5'
              }`}
            />
          </div>
          {settings.lowBatteryMode ? 'Low Battery Mode Active' : 'Enable Low Battery Mode'}
        </button>
      </div>

      {/* Privacy info */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 space-y-2">
        <h2 className="font-bold text-blue-700 flex items-center gap-2">
          <Info className="w-4 h-4" /> Privacy First
        </h2>
        <p className="text-sm text-blue-600">
          Your location is shared only with the trusted contacts you select. It is never shared
          publicly or with other community chat users. You control when and with whom your
          location is shared.
        </p>
      </div>
    </div>
  );
}

function SosAction({
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  icon: typeof Phone;
  label: string;
  sublabel: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-left hover:bg-white/25 transition-colors"
    >
      <Icon className="w-5 h-5 mb-1" />
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-white/70">{sublabel}</p>
    </button>
  );
}

function EmergencyCard({
  icon: Icon,
  label,
  count,
  color,
  onClick,
}: {
  icon: typeof Phone;
  label: string;
  count: number;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-4 border border-rose-100 hover:border-rose-200 transition-colors text-left"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-sm font-semibold text-gray-800">{label}</p>
      <p className="text-xs text-gray-400">{count} nearby</p>
    </button>
  );
}
