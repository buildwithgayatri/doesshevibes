import {
  Award,
  TrendingUp,
  Star,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  LEVELS,
  BADGES,
  getCurrentLevel,
  getNextLevel,
  getPointsToNextLevel,
  getProgressToNextLevel,
} from '@/lib/gamification';

export default function ContributionSection() {
  const { gamification } = useApp();
  const points = gamification.totalPoints;
  const currentLevel = getCurrentLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = getProgressToNextLevel(points);
  const pointsToNext = getPointsToNextLevel(points);

  const contributionCount = gamification.contributions.length;

  return (
    <div className="space-y-4">
      {/* Points & Level */}
      <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-5 h-5" />
            <h2 className="font-bold">Your Contributions</h2>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold">{points}</p>
              <p className="text-xs text-white/80">Total Points</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {currentLevel.name}
              </p>
              <p className="text-xs text-white/70">{contributionCount} contributions</p>
            </div>
          </div>

          {/* Progress bar */}
          {nextLevel ? (
            <div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white/80 mt-1.5">
                {pointsToNext} points to {nextLevel.name}
              </p>
            </div>
          ) : (
            <div>
              <div className="h-2 bg-white/30 rounded-full" />
              <p className="text-xs text-white/80 mt-1.5">Max level reached!</p>
            </div>
          )}

          {/* Level ladder */}
          <div className="flex items-center gap-1.5 mt-4">
            {LEVELS.map((level) => {
              const reached = points >= level.threshold;
              return (
                <div
                  key={level.id}
                  className={`flex-1 text-center py-1.5 px-1 rounded-lg text-xs font-medium ${
                    reached
                      ? 'bg-white/25 text-white'
                      : 'bg-white/10 text-white/50'
                  }`}
                >
                  {level.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Star className="w-4 h-4 text-rose-400" /> Badges
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {BADGES.map((badge) => {
            const earned = gamification.earnedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl p-3 border text-center transition-all ${
                  earned
                    ? 'bg-rose-50 border-rose-200'
                    : 'bg-gray-50 border-gray-100 opacity-60'
                }`}
              >
                <div className="text-2xl mb-1.5 relative">
                  {badge.emoji}
                  {!earned && (
                    <Lock className="w-3 h-3 text-gray-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <p className={`text-xs font-semibold ${earned ? 'text-rose-600' : 'text-gray-400'}`}>
                  {badge.name}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{badge.requirement}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Points guide */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 space-y-2">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-rose-400" /> How to Earn Points
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <PointRow label="Submit a place review" points={10} />
          <PointRow label="Add a photo" points={20} />
          <PointRow label="Add or review a route" points={20} />
          <PointRow label="Rate a place or route" points={15} />
          <PointRow label="Report incorrect/unsafe info" points={30} />
          <PointRow label="Add accessibility info" points={30} />
          <PointRow label="Review marked helpful" points={5} />
        </div>
      </div>
    </div>
  );
}

function PointRow({ label, points }: { label: string; points: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-gray-50">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-rose-500">+{points}</span>
    </div>
  );
}
