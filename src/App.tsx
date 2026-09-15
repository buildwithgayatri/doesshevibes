import { AppProvider, useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import BadgeToast from '@/components/BadgeToast';
import NotificationToast from '@/components/NotificationToast';
import LocationPermissionGate from '@/components/LocationPermissionGate';
import HomePage from '@/pages/HomePage';
import ExploreMapPage from '@/pages/ExploreMapPage';
import PlanJourneyPage from '@/pages/PlanJourneyPage';
import ActiveJourneyPage from '@/pages/ActiveJourneyPage';
import PublicPlacesPage from '@/pages/PublicPlacesPage';
import SafetyCenterPage from '@/pages/SafetyCenterPage';
import CommunityChatPage from '@/pages/CommunityChatPage';
import RouteHistoryPage from '@/pages/RouteHistoryPage';
import SettingsPage from '@/pages/SettingsPage';
import ReportsPage from '@/pages/ReportsPage';

function PageRouter() {
  const { currentPage } = useApp();

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'explore':
      return <ExploreMapPage />;
    case 'plan':
      return <PlanJourneyPage />;
    case 'active':
      return <ActiveJourneyPage />;
    case 'places':
      return <PublicPlacesPage />;
    case 'safety':
      return <SafetyCenterPage />;
    case 'community':
      return <CommunityChatPage />;
    case 'history':
      return <RouteHistoryPage />;
    case 'reports':
      return <ReportsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <HomePage />;
  }
}

function App() {
  return (
    <AppProvider>
      <LocationPermissionGate />
      <Layout>
        <PageRouter />
      </Layout>
      <BadgeToast />
      <NotificationToast />
      <div
        id="visual-vibration-indicator"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(236, 72, 153, 0.15)',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'none',
          opacity: 0,
          transition: 'opacity 0.1s',
        }}
      />
    </AppProvider>
  );
}

export default App;
