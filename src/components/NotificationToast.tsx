import { useEffect } from 'react';
import { Bell, AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function NotificationToast() {
  const { notifications, dismissNotification, settings } = useApp();

  if (!settings.notifications) return null;

  return (
    <div className="fixed top-16 md:top-4 left-1/2 -translate-x-1/2 z-[4000] w-[90%] max-w-md space-y-2 pointer-events-none">
      {notifications.map((notif) => (
        <NotificationCard
          key={notif.id}
          notif={notif}
          onDismiss={() => dismissNotification(notif.id)}
        />
      ))}
    </div>
  );
}

function NotificationCard({
  notif,
  onDismiss,
}: {
  notif: { id: string; title: string; message: string; type: 'info' | 'alert' | 'success'; createdAt: string };
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const config = {
    alert: {
      icon: AlertCircle,
      bg: 'bg-red-50 border-red-200',
      iconColor: 'text-red-500',
      titleColor: 'text-red-700',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50 border-green-200',
      iconColor: 'text-green-500',
      titleColor: 'text-green-700',
    },
    info: {
      icon: Info,
      bg: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-700',
    },
  }[notif.type];

  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border rounded-2xl shadow-lg p-4 pointer-events-auto animate-slide-down`}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${config.titleColor}`}>{notif.title}</p>
          <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{notif.message}</p>
        </div>
        <button onClick={onDismiss} className="shrink-0 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2 h-1 bg-black/5 rounded-full overflow-hidden">
        <div
          className={`h-full ${notif.type === 'alert' ? 'bg-red-400' : notif.type === 'success' ? 'bg-green-400' : 'bg-blue-400'} animate-shrink`}
          style={{ animationDuration: '10s', animationFillMode: 'forwards' }}
        />
      </div>
    </div>
  );
}
