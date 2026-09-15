import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BadgeToast() {
  const { newlyUnlockedBadges, clearBadgeToast } = useApp();

  useEffect(() => {
    if (newlyUnlockedBadges.length > 0) {
      const timers = newlyUnlockedBadges.map((badge) =>
        setTimeout(() => clearBadgeToast(badge.id), 5000)
      );
      return () => {
        timers.forEach((t) => clearTimeout(t));
      };
    }
  }, [newlyUnlockedBadges, clearBadgeToast]);

  if (newlyUnlockedBadges.length === 0) return null;

  return (
    <div className="fixed top-16 md:top-4 right-4 z-[4000] space-y-2 max-w-xs">
      {newlyUnlockedBadges.map((badge) => (
        <div
          key={badge.id}
          className="bg-white rounded-2xl shadow-2xl border-2 border-rose-200 p-4 flex items-center gap-3 animate-[slideIn_0.3s_ease-out]"
          style={{
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-2xl shrink-0">
            {badge.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-rose-500">Badge Unlocked!</p>
            <p className="text-sm font-bold text-gray-800">{badge.name}</p>
            <p className="text-xs text-gray-400">{badge.description}</p>
          </div>
          <button
            onClick={() => clearBadgeToast(badge.id)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
