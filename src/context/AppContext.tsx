import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import type {
  PageId,
  Route,
  RoutePreferences,
  UserSettings,
  JourneyStop,
  CommunityReport,
  ChatMessage,
  ChatPresence,
  GamificationState,
  ContributionType,
  AppNotification,
  UserLocation,
  BadgeInfo,
} from '@/types';
import { sampleRoutes, sampleReports } from '@/data/sampleData';
import { supabase } from '@/lib/supabase';
import { loadLocal, saveLocal } from '@/lib/storage';
import {
  loadGamificationState,
  saveGamificationState,
  awardPoints as doAwardPoints,
} from '@/lib/gamification';

interface AppState {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;

  routes: Route[];
  selectedRouteId: string | null;
  setSelectedRouteId: (id: string | null) => void;

  preferences: RoutePreferences;
  setPreferences: (p: RoutePreferences) => void;

  travelHour: number;
  setTravelHour: (h: number) => void;

  stops: JourneyStop[];
  setStops: (s: JourneyStop[]) => void;
  addStop: (stop: JourneyStop) => void;
  removeStop: (id: string) => void;

  settings: UserSettings;
  setSettings: (s: UserSettings) => void;

  reports: CommunityReport[];
  addReport: (r: CommunityReport) => void;
  confirmReport: (id: string) => void;
  updateReport: (id: string, updates: Partial<CommunityReport>) => void;
  deleteReport: (id: string) => void;
  currentUserId: string;

  isOnline: boolean;
  activeJourney: boolean;
  setActiveJourney: (v: boolean) => void;

  chatMessages: ChatMessage[];
  onlineUsers: ChatPresence[];
  sendMessage: (msg: string, username: string) => void;
  joinChat: (username: string) => void;
  leaveChat: (username: string) => void;
  chatUsername: string;
  setChatUsername: (name: string) => void;

  sosActive: boolean;
  setSosActive: (v: boolean) => void;

  gamification: GamificationState;
  awardContribution: (
    type: ContributionType,
    itemId: string,
    content: string,
    voterId?: string
  ) => { awarded: boolean; newBadges: BadgeInfo[]; points: number };
  newlyUnlockedBadges: BadgeInfo[];
  clearBadgeToast: (badgeId: string) => void;

  locationPermission: 'pending' | 'granted' | 'denied';
  userLocation: UserLocation | null;
  locationError: string | null;
  startLocationWatch: () => void;

  notifications: AppNotification[];
  pushNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;

  notifyTrustedContacts: (title: string, message: string) => void;
  plannedRoutePath: { lat: number; lng: number }[] | null;
  setPlannedRoutePath: (path: { lat: number; lng: number }[] | null) => void;
  routeDeviationDetected: boolean;
  setRouteDeviationDetected: (v: boolean) => void;
}

const defaultPreferences: RoutePreferences = {
  mode: 'balanced',
  lighting: 60,
  populated: 70,
  transport: 40,
  accessibility: 50,
  travelTime: 50,
  publicPlaces: 50,
  lowIsolation: 70,
  avoidStairs: false,
  wheelchairFriendly: false,
  avoidIsolation: false,
  easierCrossings: false,
};

const defaultSettings: UserSettings = {
  vibrationEnabled: true,
  soundEnabled: false,
  mapStyle: 'street',
  lowBatteryMode: false,
  shareLocation: false,
  notifications: true,
  trustedContacts: [],
  displayName: 'Guest User',
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [routes] = useState<Route[]>(sampleRoutes);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<RoutePreferences>(
    loadLocal('preferences') || defaultPreferences
  );
  const [travelHour, setTravelHour] = useState<number>(new Date().getHours());
  const [stops, setStops] = useState<JourneyStop[]>([]);
  const [settings, setSettings] = useState<UserSettings>(
    loadLocal('settings') || defaultSettings
  );
  const [reports, setReports] = useState<CommunityReport[]>(sampleReports);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [activeJourney, setActiveJourney] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatPresence[]>([]);
  const [chatUsername, setChatUsername] = useState<string>(
    loadLocal('chatUsername') || ''
  );
  const [gamification, setGamification] = useState<GamificationState>(
    loadGamificationState()
  );
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<BadgeInfo[]>([]);

  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [plannedRoutePath, setPlannedRoutePath] = useState<{ lat: number; lng: number }[] | null>(null);
  const [routeDeviationDetected, setRouteDeviationDetected] = useState(false);

  useEffect(() => {
    saveGamificationState(gamification);
  }, [gamification]);

  const awardContribution = useCallback(
    (
      type: ContributionType,
      itemId: string,
      content: string,
      voterId?: string
    ): { awarded: boolean; newBadges: BadgeInfo[]; points: number } => {
      let result = { awarded: false, newBadges: [] as BadgeInfo[], points: 0 };
      setGamification((prev) => {
        const { state: newState, result: awardResult } = doAwardPoints(
          prev,
          type,
          itemId,
          content,
          voterId
        );
        result = { awarded: awardResult.awarded, newBadges: awardResult.newBadges, points: awardResult.points };
        if (awardResult.newBadges.length > 0) {
          setNewlyUnlockedBadges((b) => [...b, ...awardResult.newBadges]);
        }
        return newState;
      });
      return result;
    },
    []
  );

  const clearBadgeToast = useCallback((badgeId: string) => {
    setNewlyUnlockedBadges((prev) => prev.filter((b) => b.id !== badgeId));
  }, []);

  useEffect(() => {
    saveLocal('preferences', preferences);
  }, [preferences]);

  useEffect(() => {
    saveLocal('settings', settings);
  }, [settings]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Geolocation watch
  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationPermission('granted');
        setLocationError(null);
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          heading: pos.coords.heading,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermission('denied');
          setLocationError('Location permission denied. Please enable location access.');
        } else {
          setLocationError(err.message);
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Load chat messages and set up realtime subscription
  const loadChatMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setChatMessages(data.reverse() as ChatMessage[]);
  }, []);

  const loadOnlineUsers = useCallback(async () => {
    const { data } = await supabase
      .from('chat_presence')
      .select('*')
      .eq('is_online', true);
    if (data) setOnlineUsers(data as ChatPresence[]);
  }, []);

  useEffect(() => {
    loadChatMessages();
    loadOnlineUsers();

    const msgChannel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'chat_messages' },
        () => loadChatMessages()
      )
      .subscribe();

    const presenceChannel = supabase
      .channel('chat_presence')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chat_presence' },
        () => loadOnlineUsers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [loadChatMessages, loadOnlineUsers]);

  const addStop = useCallback((stop: JourneyStop) => {
    setStops((prev) => [...prev, stop]);
  }, []);

  const removeStop = useCallback((id: string) => {
    setStops((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addReport = useCallback((r: CommunityReport) => {
    setReports((prev) => [r, ...prev]);
  }, []);

  const confirmReport = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, confirmations: r.confirmations + 1 } : r
      )
    );
  }, []);

  const updateReport = useCallback((id: string, updates: Partial<CommunityReport>) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updates, created_at: new Date().toISOString() }
          : r
      )
    );
  }, []);

  const deleteReport = useCallback((id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const sendMessage = useCallback(async (msg: string, username: string) => {
    await supabase.from('chat_messages').insert({ username, message: msg });
  }, []);

  const joinChat = useCallback(async (username: string) => {
    setChatUsername(username);
    saveLocal('chatUsername', username);
    await supabase
      .from('chat_presence')
      .upsert(
        {
          username,
          is_online: true,
          last_seen: new Date().toISOString(),
        },
        { onConflict: 'username' }
      );
    loadOnlineUsers();
  }, [loadOnlineUsers]);

  const leaveChat = useCallback(async (username: string) => {
    await supabase
      .from('chat_presence')
      .update({ is_online: false, last_seen: new Date().toISOString() })
      .eq('username', username);
    loadOnlineUsers();
  }, [loadOnlineUsers]);

  const pushNotification = useCallback((n: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const notif: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [...prev, notif]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notifyTrustedContacts = useCallback((title: string, message: string) => {
    const contactNames = settings.trustedContacts.map((c) => c.name).join(', ');
    const fullMessage = settings.trustedContacts.length > 0
      ? `${message}\nNotified: ${contactNames}`
      : `${message}\nNo trusted contacts configured. Add contacts in Settings.`;
    pushNotification({ title, message: fullMessage, type: 'alert' });
  }, [settings.trustedContacts, pushNotification]);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        routes,
        selectedRouteId,
        setSelectedRouteId,
        preferences,
        setPreferences,
        travelHour,
        setTravelHour,
        stops,
        setStops,
        addStop,
        removeStop,
        settings,
        setSettings,
        reports,
        addReport,
        confirmReport,
        updateReport,
        deleteReport,
        currentUserId: settings.displayName,
        isOnline,
        activeJourney,
        setActiveJourney,
        chatMessages,
        onlineUsers,
        sendMessage,
        joinChat,
        leaveChat,
        chatUsername,
        setChatUsername,
        sosActive,
        setSosActive,
        gamification,
        awardContribution,
        newlyUnlockedBadges,
        clearBadgeToast,
        locationPermission,
        userLocation,
        locationError,
        startLocationWatch,
        notifications,
        pushNotification,
        dismissNotification,
        notifyTrustedContacts,
        plannedRoutePath,
        setPlannedRoutePath,
        routeDeviationDetected,
        setRouteDeviationDetected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
