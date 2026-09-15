import type {
  ContributionType,
  ContributionRecord,
  GamificationState,
  LevelInfo,
  BadgeInfo,
} from '@/types';
import { loadLocal, saveLocal } from '@/lib/storage';

const STORAGE_KEY = 'gamification';

export const POINT_VALUES: Record<ContributionType, number> = {
  place_review: 10,
  photo: 20,
  route_review: 20,
  rating: 15,
  report: 30,
  accessibility: 30,
  helpful_vote: 5,
};

export const LEVELS: LevelInfo[] = [
  { id: 'explorer', name: 'Explorer', threshold: 0 },
  { id: 'navigator', name: 'Navigator', threshold: 150 },
  { id: 'guide', name: 'Guide', threshold: 500 },
  { id: 'pathfinder', name: 'Pathfinder', threshold: 1500 },
  { id: 'champion', name: 'Community Champion', threshold: 5000 },
];

export const BADGES: BadgeInfo[] = [
  {
    id: 'dora',
    emoji: '🌱',
    name: 'Dora the Explorer',
    description: 'First contribution',
    requirement: 'Make your first contribution',
    check: (s) => s.contributions.length >= 1,
  },
  {
    id: 'local_legend',
    emoji: '🗺️',
    name: 'Local Legend',
    description: '5 routes reviewed',
    requirement: 'Review 5 routes',
    check: (s) => s.contributions.filter((c) => c.type === 'route_review').length >= 5,
  },
  {
    id: 'gps_gurl',
    emoji: '⭐',
    name: 'GPS Gurl',
    description: '10 helpful reviews',
    requirement: 'Get 10 helpful votes on your reviews',
    check: (s) => s.contributions.filter((c) => c.type === 'helpful_vote').length >= 10,
  },
  {
    id: 'wonder_woman',
    emoji: '🛡️',
    name: 'Wonder Woman',
    description: '5 safety or accessibility contributions',
    requirement: 'Make 5 safety reports or accessibility contributions',
    check: (s) =>
      s.contributions.filter((c) => c.type === 'report' || c.type === 'accessibility').length >= 5,
  },
  {
    id: 'spidey_sense',
    emoji: '🧭',
    name: 'Spidey Sense',
    description: '25 route contributions',
    requirement: 'Make 25 route contributions',
    check: (s) => s.contributions.filter((c) => c.type === 'route_review').length >= 25,
  },
  {
    id: 'sheesh',
    emoji: '🔥',
    name: 'Sheesh',
    description: '5,000 points',
    requirement: 'Earn 5,000 total points',
    check: (s) => s.totalPoints >= 5000,
  },
  {
    id: 'sheesh_goat',
    emoji: '👑',
    name: 'Sheesh GOAT',
    description: '10,000 points',
    requirement: 'Earn 10,000 total points',
    check: (s) => s.totalPoints >= 10000,
  },
];

const defaultState: GamificationState = {
  totalPoints: 0,
  contributions: [],
  earnedBadgeIds: [],
  helpfulVotesGiven: [],
};

export function loadGamificationState(): GamificationState {
  return loadLocal<GamificationState>(STORAGE_KEY) || { ...defaultState };
}

export function saveGamificationState(state: GamificationState): void {
  saveLocal(STORAGE_KEY, state);
}

export function getCurrentLevel(points: number): LevelInfo {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.threshold) current = level;
  }
  return current;
}

export function getNextLevel(points: number): LevelInfo | null {
  for (const level of LEVELS) {
    if (points < level.threshold) return level;
  }
  return null;
}

export function getPointsToNextLevel(points: number): number {
  const next = getNextLevel(points);
  if (!next) return 0;
  return next.threshold - points;
}

export function getProgressToNextLevel(points: number): number {
  const current = getCurrentLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.threshold - current.threshold;
  const earned = points - current.threshold;
  return Math.min(100, Math.round((earned / range) * 100));
}

interface AwardResult {
  awarded: boolean;
  newBadges: BadgeInfo[];
  points: number;
  reason: string;
}

export function awardPoints(
  state: GamificationState,
  type: ContributionType,
  itemId: string,
  content: string,
  voterId?: string
): { state: GamificationState; result: AwardResult } {
  // Anti-spam: require meaningful content
  const minLen =
    type === 'rating' ? 0 : type === 'photo' ? 0 : type === 'helpful_vote' ? 0 : 10;
  if (content.trim().length < minLen) {
    return {
      state,
      result: {
        awarded: false,
        newBadges: [],
        points: 0,
        reason: 'Content too short for points',
      },
    };
  }

  // Anti-spam: no duplicate awards for same action on same item
  if (type !== 'helpful_vote') {
    const alreadyAwarded = state.contributions.some(
      (c) => c.type === type && c.itemId === itemId
    );
    if (alreadyAwarded) {
      return {
        state,
        result: {
          awarded: false,
          newBadges: [],
          points: 0,
          reason: 'Already awarded for this item',
        },
      };
    }
  }

  // Anti-spam: helpful vote — only once per voter, no self-votes
  if (type === 'helpful_vote') {
    if (!voterId) {
      return {
        state,
        result: { awarded: false, newBadges: [], points: 0, reason: 'No voter ID' },
      };
    }
    const voteKey = `${itemId}:${voterId}`;
    if (state.helpfulVotesGiven.includes(voteKey)) {
      return {
        state,
        result: { awarded: false, newBadges: [], points: 0, reason: 'Already voted' },
      };
    }
  }

  const points = POINT_VALUES[type];
  const record: ContributionRecord = {
    type,
    itemId,
    timestamp: new Date().toISOString(),
    points,
  };

  const newState: GamificationState = {
    ...state,
    totalPoints: state.totalPoints + points,
    contributions: [...state.contributions, record],
    helpfulVotesGiven:
      type === 'helpful_vote' && voterId
        ? [...state.helpfulVotesGiven, `${itemId}:${voterId}`]
        : state.helpfulVotesGiven,
  };

  // Check for new badges
  const newBadges: BadgeInfo[] = [];
  for (const badge of BADGES) {
    if (!newState.earnedBadgeIds.includes(badge.id) && badge.check(newState)) {
      newBadges.push(badge);
      newState.earnedBadgeIds = [...newState.earnedBadgeIds, badge.id];
    }
  }

  return {
    state: newState,
    result: { awarded: true, newBadges, points, reason: 'Awarded' },
  };
}
