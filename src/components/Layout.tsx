import { useState } from 'react';
import {
  Home,
  Map,
  Navigation,
  Footprints,
  Building2,
  ShieldAlert,
  MessageCircle,
  BarChart3,
  Settings,
  Menu,
  X,
  Wifi,
  WifiOff,
  BatteryLow,
  AlertTriangle,
  User,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { PageId } from '@/types';

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Explore Map', icon: Map },
  { id: 'plan', label: 'Plan Journey', icon: Navigation },
  { id: 'active', label: 'Active Journey', icon: Footprints },
  { id: 'places', label: 'Public Places', icon: Building2 },
  { id: 'safety', label: 'Safety Center', icon: ShieldAlert },
  { id: 'reports', label: 'My Reports', icon: AlertTriangle },
  { id: 'community', label: 'Community', icon: MessageCircle },
  { id: 'history', label: 'Route History', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const mobileBottomNav: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'explore', label: 'Routes', icon: Map },
  { id: 'reports', label: 'Reports', icon: AlertTriangle },
  { id: 'settings', label: 'Profile', icon: User },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, isOnline, settings, sosActive } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PageId) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-rose-50/30">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-rose-100 shrink-0 h-screen sticky top-0">
        <div className="p-5 border-b border-rose-100">
          <div className="flex items-center gap-2">
            <img
              src="https://imgland.net/i/m4OL3rl9/sheeshway_logo_edited.png"
              alt="SheeshWay"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">SheeshWay</h1>
              <p className="text-xs text-rose-400">Don't Just Go. Know.</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-rose-100 text-rose-700'
                    : 'text-gray-600 hover:bg-rose-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-rose-500' : 'text-gray-400'}`} />
                {item.label}
                {item.id === 'active' && sosActive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-rose-100 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {isOnline ? (
              <span className="flex items-center gap-1 text-green-600">
                <Wifi className="w-3 h-3" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600">
                <WifiOff className="w-3 h-3" /> Offline — Journey Capsule
              </span>
            )}
            {settings.lowBatteryMode && (
              <span className="flex items-center gap-1 text-amber-600">
                <BatteryLow className="w-3 h-3" /> Low Battery Mode
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-rose-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/SheeshWay_Logo.jpeg"
            alt="SheeshWay"
            className="w-8 h-8 rounded-lg object-cover"
          />
          <span className="font-bold text-gray-800">SheeshWay</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-rose-50"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-rose-100 shadow-lg max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <nav className="py-2 px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                    active ? 'bg-rose-100 text-rose-700' : 'text-gray-600'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-rose-500' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 md:pt-0 overflow-y-auto overflow-x-hidden h-screen pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-rose-100 flex items-center justify-around px-1 h-16 safe-area-inset-bottom">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all flex-1 ${
                active ? 'text-rose-600' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-rose-500' : 'text-gray-400'}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
