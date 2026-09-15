const PREFIX = 'safetynav_';

export function saveLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function loadLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function removeLocal(key: string): void {
  localStorage.removeItem(PREFIX + key);
}

export interface JourneyCapsule {
  id: string;
  createdAt: string;
  routeId: string;
  routeName: string;
  stops: { name: string; lat: number; lng: number }[];
  path: { lat: number; lng: number }[];
  safetyScore: number;
  travelTime: number;
  distance: number;
  emergencyPlaces: { name: string; type: string; lat: number; lng: number; phone?: string }[];
  lastKnownLocation: { lat: number; lng: number } | null;
  checkpoints: { lat: number; lng: number; name: string; reached: boolean }[];
}

export function saveJourneyCapsule(capsule: JourneyCapsule): void {
  saveLocal('journey_capsule', capsule);
}

export function loadJourneyCapsule(): JourneyCapsule | null {
  return loadLocal<JourneyCapsule>('journey_capsule');
}

export function clearJourneyCapsule(): void {
  removeLocal('journey_capsule');
}
