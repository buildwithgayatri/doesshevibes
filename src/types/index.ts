export type PageId =
  | 'home'
  | 'explore'
  | 'plan'
  | 'active'
  | 'places'
  | 'safety'
  | 'community'
  | 'history'
  | 'settings'
  | 'reports';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  id: string;
  start: LatLng;
  end: LatLng;
  name: string;
  lighting: 'low' | 'medium' | 'high';
  pedestrianActivity: 'low' | 'medium' | 'high';
  transportAccess: 'none' | 'limited' | 'good' | 'excellent';
  accessibility: 'poor' | 'fair' | 'good' | 'excellent';
  hasStairs: boolean;
  isIsolated: boolean;
  publicPlacesNearby: number;
  length: number;
  safetyScore: number;
  timeOfDayFactor: number;
}

export interface Route {
  id: string;
  name: string;
  segments: RouteSegment[];
  totalDistance: number;
  travelTime: number;
  safetyScore: number;
  wellLit: 'low' | 'medium' | 'high';
  pedestrianActivity: 'low' | 'medium' | 'high';
  publicPlacesNearby: number;
  transportAccess: 'none' | 'limited' | 'good' | 'excellent';
  path: LatLng[];
  color: string;
}

export interface JourneyStop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'home' | 'work' | 'school' | 'shop' | 'cafe' | 'event' | 'other';
  plannedArrival: string;
  durationMinutes: number;
}

export interface PublicPlace {
  id: string;
  name: string;
  type: 'hospital' | 'cafe' | 'shop' | 'petrol' | 'police' | 'transport' | 'public';
  lat: number;
  lng: number;
  distance: number;
  isOpen: boolean;
  hours: string;
  address: string;
  phone?: string;
  rating?: number;
  accessible: boolean;
}

export interface CommunityReport {
  id: string;
  type: ReportType;
  description: string;
  lat: number;
  lng: number;
  location_name: string;
  reported_by: string;
  confirmations: number;
  status: 'active' | 'resolved' | 'outdated';
  created_at: string;
}

export type ReportType =
  | 'broken_streetlight'
  | 'blocked_road'
  | 'heavy_pedestrian'
  | 'transport_disruption'
  | 'unsafe_area'
  | 'road_construction'
  | 'other';

export interface RoutePreferences {
  mode: 'fastest' | 'balanced' | 'safety';
  lighting: number;
  populated: number;
  transport: number;
  accessibility: number;
  travelTime: number;
  publicPlaces: number;
  lowIsolation: number;
  avoidStairs: boolean;
  wheelchairFriendly: boolean;
  avoidIsolation: boolean;
  easierCrossings: boolean;
}

export interface UserSettings {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  mapStyle: 'street' | 'satellite';
  lowBatteryMode: boolean;
  shareLocation: boolean;
  notifications: boolean;
  trustedContacts: TrustedContact[];
  displayName: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
}

export interface ChatPresence {
  id: string;
  username: string;
  last_seen: string;
  is_online: boolean;
}

export interface JourneyHistory {
  id: string;
  date: string;
  routeName: string;
  stops: string[];
  safetyScore: number;
  travelTime: number;
  distance: number;
  completed: boolean;
  changes: RouteChange[];
}

export interface RouteChange {
  id: string;
  type: 'closure' | 'lighting_improved' | 'lighting_broken' | 'new_report' | 'construction' | 'score_change';
  description: string;
  segmentName: string;
  impact: 'positive' | 'negative' | 'neutral';
  timeAgo: string;
}

export interface TransportOption {
  id: string;
  provider: 'uber' | 'ola' | 'public' | 'walking';
  pickup: string;
  destination: string;
  estimatedTime: number;
  estimatedFare: number;
  available: boolean;
  eta: number;
}

export type ContributionType =
  | 'place_review'
  | 'photo'
  | 'route_review'
  | 'rating'
  | 'report'
  | 'accessibility'
  | 'helpful_vote';

export interface ContributionRecord {
  type: ContributionType;
  itemId: string;
  timestamp: string;
  points: number;
}

export interface GamificationState {
  totalPoints: number;
  contributions: ContributionRecord[];
  earnedBadgeIds: string[];
  helpfulVotesGiven: string[];
}

export type LevelId = 'explorer' | 'navigator' | 'guide' | 'pathfinder' | 'champion';

export interface LevelInfo {
  id: LevelId;
  name: string;
  threshold: number;
}

export interface BadgeInfo {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requirement: string;
  check: (state: GamificationState) => boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'success';
  createdAt: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  heading: number | null;
  accuracy: number | null;
}
