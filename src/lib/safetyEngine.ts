import type { Route, RouteSegment, RoutePreferences, LatLng } from '@/types';
import { sampleRoutes } from '@/data/sampleData';

export function getTimeOfDayFactor(hour: number): number {
  if (hour >= 6 && hour < 9) return 1.0;
  if (hour >= 9 && hour < 17) return 1.1;
  if (hour >= 17 && hour < 20) return 1.2;
  if (hour >= 20 && hour < 23) return 0.85;
  return 0.55;
}

export function adjustScoreForTime(score: number, hour: number): number {
  const factor = getTimeOfDayFactor(hour);
  return Math.round(Math.min(100, Math.max(20, score * factor)));
}

export function calculateSegmentScore(
  segment: RouteSegment,
  hour: number,
  preferences: RoutePreferences
): number {
  let score = 0;
  const weights = {
    lighting: preferences.lighting / 100,
    populated: preferences.populated / 100,
    transport: preferences.transport / 100,
    accessibility: preferences.accessibility / 100,
    lowIsolation: preferences.lowIsolation / 100,
    publicPlaces: preferences.publicPlaces / 100,
  travelTime: preferences.travelTime / 100,
  mode: 1,
  timeOfDay: getTimeOfDayFactor(hour),
  avoidIsolation: preferences.avoidIsolation ? 1.5 : 1,
  avoidStairs: preferences.avoidStairs ? 1 : 0,
    wheelchair: preferences.wheelchairFriendly ? 1 : 0,
  easierCrossings: preferences.easierCrossings ? 1 : 0,
  modeFactor: 1,
  isolationFactor: 1,
    stairsFactor: 1,
    accessFactor: 1,
  crossingFactor: 1,
  wheelchairFactor: 1,
  modeWeight: 1,
    isolationWeight: 1,
    stairsWeight: 1,
    accessWeight: 1,
    crossingWeight: 1,
    wheelchairWeight: 1,
    lightingScore: 0,
    pedestrianScore: 0,
    transportScore: 0,
    accessScore: 0,
    isolationScore: 0,
    publicScore: 0,
    timeScore: 0,
    modeScore: 0,
    timeOfDayScore: 0,
    finalScore: 0,
  };

  const lightingMap = { low: 30, medium: 65, high: 95 };
  const pedestrianMap = { low: 35, medium: 65, high: 90 };
  const transportMap = { none: 20, limited: 50, good: 75, excellent: 95 };
  const accessMap = { poor: 25, fair: 55, good: 80, excellent: 95 };

  const lightingScore = lightingMap[segment.lighting];
  const pedestrianScore = pedestrianMap[segment.pedestrianActivity];
  const transportScore = transportMap[segment.transportAccess];
  const accessScore = accessMap[segment.accessibility];
  const isolationScore = segment.isIsolated ? 25 : 85;
  const publicScore = Math.min(95, 40 + segment.publicPlacesNearby * 8);
  const timeScore = 100 - Math.min(50, segment.length * 15);

  const modeWeights =
    preferences.mode === 'fastest'
      ? { lighting: 0.1, populated: 0.1, transport: 0.1, access: 0.1, isolation: 0.1, public: 0.1, time: 0.4 }
      : preferences.mode === 'balanced'
      ? { lighting: 0.2, populated: 0.2, transport: 0.1, access: 0.1, isolation: 0.15, public: 0.1, time: 0.15 }
      : { lighting: 0.25, populated: 0.25, transport: 0.1, access: 0.1, isolation: 0.2, public: 0.1, time: 0.0 };

  score =
    lightingScore * modeWeights.lighting * (0.5 + weights.lighting * 0.5) +
    pedestrianScore * modeWeights.populated * (0.5 + weights.populated * 0.5) +
    transportScore * modeWeights.transport * (0.5 + weights.transport * 0.5) +
    accessScore * modeWeights.access * (0.5 + weights.accessibility * 0.5) +
    isolationScore * modeWeights.isolation * (0.5 + weights.lowIsolation * 0.5) * weights.avoidIsolation +
    publicScore * modeWeights.public * (0.5 + weights.publicPlaces * 0.5) +
    timeScore * modeWeights.time * (0.5 + weights.travelTime * 0.5);

  if (preferences.avoidStairs && segment.hasStairs) score *= 0.5;
  if (preferences.wheelchairFriendly && segment.accessibility === 'poor') score *= 0.5;
  if (preferences.easierCrossings && segment.accessibility === 'poor') score *= 0.7;

  score = score * weights.timeOfDay;

  return Math.round(Math.min(100, Math.max(20, score)));
}

export function calculateRouteScore(
  route: Route,
  hour: number,
  preferences: RoutePreferences
): Route {
  const adjustedSegments = route.segments.map((seg) => ({
    ...seg,
    safetyScore: calculateSegmentScore(seg, hour, preferences),
    timeOfDayFactor: getTimeOfDayFactor(hour),
  }));

  const avgScore = Math.round(
    adjustedSegments.reduce((sum, s) => sum + s.safetyScore, 0) / adjustedSegments.length
  );

  const wellLit =
    adjustedSegments.every((s) => s.lighting === 'high')
      ? 'high'
      : adjustedSegments.some((s) => s.lighting === 'low')
      ? 'low'
      : 'medium';

  const pedestrianActivity =
    adjustedSegments.every((s) => s.pedestrianActivity === 'high')
      ? 'high'
      : adjustedSegments.some((s) => s.pedestrianActivity === 'low')
      ? 'low'
      : 'medium';

  return {
    ...route,
    segments: adjustedSegments,
    safetyScore: avgScore,
    wellLit,
    pedestrianActivity,
    publicPlacesNearby: adjustedSegments.reduce((sum, s) => sum + s.publicPlacesNearby, 0),
  };
}

export function rankRoutes(
  routes: Route[],
  hour: number,
  preferences: RoutePreferences
): Route[] {
  return routes
    .map((r) => calculateRouteScore(r, hour, preferences))
    .sort((a, b) => b.safetyScore - a.safetyScore);
}

export function interpretNaturalLanguage(input: string): Partial<RoutePreferences> {
  const lower = input.toLowerCase();
  const result: Partial<RoutePreferences> = {};

  if (lower.match(/avoid.*quiet|no.*quiet|avoid.*isolat|less.*empty/)) {
    result.lowIsolation = 100;
    result.avoidIsolation = true;
    result.populated = 80;
  }
  if (lower.match(/well.?lit|good.*light|bright|lighting/)) {
    result.lighting = 90;
  }
  if (lower.match(/avoid.*dark|no.*dark|poorly.*lit/)) {
    result.lighting = 95;
    result.lowIsolation = 80;
  }
  if (lower.match(/fast|quick|shortest|asap|in a hurry/)) {
    result.mode = 'fastest';
    result.travelTime = 90;
  }
  if (lower.match(/safe|safest|secure|careful/)) {
    result.mode = 'safety';
    result.lighting = 80;
    result.lowIsolation = 80;
    result.populated = 70;
  }
  if (lower.match(/wheelchair|accessible|disab/)) {
    result.wheelchairFriendly = true;
    result.avoidStairs = true;
    result.accessibility = 90;
  }
  if (lower.match(/stairs|steps/)) {
    result.avoidStairs = true;
  }
  if (lower.match(/transport|metro|bus|train/)) {
    result.transport = 80;
  }
  if (lower.match(/(\d+)\s*(extra\s*)?min|take\s*(\d+)\s*min/)) {
    const match = lower.match(/(\d+)\s*(?:extra\s*)?min/);
    if (match) {
      result.travelTime = 60;
      result.mode = 'balanced';
    }
  }
  if (lower.match(/cafe|shop|public\s*place|open\s*place/)) {
    result.publicPlaces = 80;
  }
  if (lower.match(/balanced|moderate/)) {
    result.mode = 'balanced';
  }

  return result;
}

export function getWhatChanged(
  route: Route,
  reports: { lat: number; lng: number; type: string; description: string; created_at: string }[]
): { description: string; impact: 'positive' | 'negative' | 'neutral' }[] {
  const changes: { description: string; impact: 'positive' | 'negative' | 'neutral' }[] = [];

  for (const report of reports) {
    if (report.type === 'broken_streetlight') {
      changes.push({
        description: `Safety score decreased because a streetlight was reported broken.`,
        impact: 'negative',
      });
    }
    if (report.type === 'road_construction') {
      changes.push({
        description: `Your usual route may be slower because of road construction.`,
        impact: 'negative',
      });
    }
    if (report.type === 'blocked_road') {
      changes.push({
        description: `A road segment is blocked, adding detour time.`,
        impact: 'negative',
      });
    }
    if (report.type === 'transport_disruption') {
      changes.push({
        description: `Public transport disruption may affect your journey.`,
        impact: 'negative',
      });
    }
    if (report.type === 'heavy_pedestrian') {
      changes.push({
        description: `Heavy pedestrian activity detected — more people around, which can improve safety.`,
        impact: 'positive',
      });
    }
  }

  return changes;
}

export { sampleRoutes };
