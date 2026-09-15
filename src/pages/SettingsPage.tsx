import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Vibrate,
  Volume2,
  Map as MapIcon,
  Satellite,
  BatteryLow,
  Share2,
  Bell,
  User,
  Shield,
  Info,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { UserSettings } from '@/types';
import ContributionSection from '@/components/ContributionSection';

export default function SettingsPage() {
  const { settings, setSettings } = useApp();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });

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

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Navigation, accessibility, and privacy preferences</p>
      </div>

      {/* Display name */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <User className="w-4 h-4 text-rose-400" /> Profile
        </h2>
        <div>
          <label className="text-xs text-gray-400">Display Name</label>
          <input
            value={settings.displayName}
            onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-rose-100 text-sm outline-none focus:border-rose-300 mt-1"
          />
        </div>
      </div>

      {/* Contribution / gamification section */}
      <ContributionSection />

      {/* Navigation feedback */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Vibrate className="w-4 h-4 text-rose-400" /> Navigation Feedback
        </h2>
        <SettingToggle
          icon={Vibrate}
          label="Vibration"
          description="Haptic feedback for navigation directions"
          value={settings.vibrationEnabled}
          onChange={(v) => setSettings({ ...settings, vibrationEnabled: v })}
        />
        <SettingToggle
          icon={Volume2}
          label="Sound"
          description="Voice and sound navigation instructions"
          value={settings.soundEnabled}
          onChange={(v) => setSettings({ ...settings, soundEnabled: v })}
        />
      </div>

      {/* Map settings */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-rose-400" /> Map
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSettings({ ...settings, mapStyle: 'street' })}
            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              settings.mapStyle === 'street'
                ? 'bg-rose-100 text-rose-600 border-2 border-rose-300'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent'
            }`}
          >
            <MapIcon className="w-4 h-4" /> Street Map
          </button>
          <button
            onClick={() => setSettings({ ...settings, mapStyle: 'satellite' })}
            className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
              settings.mapStyle === 'satellite'
                ? 'bg-rose-100 text-rose-600 border-2 border-rose-300'
                : 'bg-gray-50 text-gray-500 border-2 border-transparent'
            }`}
          >
            <Satellite className="w-4 h-4" /> Satellite
          </button>
        </div>
      </div>

      {/* Safety & battery */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" /> Safety & Battery
        </h2>
        <SettingToggle
          icon={BatteryLow}
          label="Low Battery Mode"
          description="Reduces features to prioritize emergency info"
          value={settings.lowBatteryMode}
          onChange={(v) => setSettings({ ...settings, lowBatteryMode: v })}
        />
        <SettingToggle
          icon={Share2}
          label="Share Location"
          description="Allow location sharing with trusted contacts"
          value={settings.shareLocation}
          onChange={(v) => setSettings({ ...settings, shareLocation: v })}
        />
        <SettingToggle
          icon={Bell}
          label="Notifications"
          description="Safety alerts and route change notifications"
          value={settings.notifications}
          onChange={(v) => setSettings({ ...settings, notifications: v })}
        />
      </div>

      {/* Trusted contacts */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" /> Trusted Contacts
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
            No trusted contacts. Add contacts for emergency alerts.
          </p>
        ) : (
          <div className="space-y-2">
            {settings.trustedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/50 border border-rose-50"
              >
                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-500" />
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
              placeholder="Relationship (optional)"
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

      {/* Privacy info */}
      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 space-y-2">
        <h2 className="font-bold text-blue-700 flex items-center gap-2">
          <Info className="w-4 h-4" /> Privacy
        </h2>
        <p className="text-sm text-blue-600">
          Your location is never shared publicly. It is only shared with trusted contacts you
          explicitly select, and only when you activate the SOS or trip sharing features.
          Community chat does not reveal your location.
        </p>
      </div>
    </div>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: typeof Vibrate;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50/50 transition-colors text-left"
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
        value ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'
      }`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${
          value ? 'bg-rose-400' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  );
}
