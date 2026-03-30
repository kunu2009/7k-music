import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function NetworkBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-14 sm:top-16 left-0 right-0 z-50 px-3 sm:px-4 safe-pad-top">
      <div className="mx-auto max-w-4xl bg-chathams-blue border border-calypso rounded-lg px-3 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <WifiOff className="w-4 h-4 text-timberwolf flex-shrink-0" />
          <p className="text-timberwolf text-xs sm:text-sm truncate">No internet connection. Playback and search may fail.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-calypso hover:bg-gable-green text-white rounded-md transition-colors text-xs sm:text-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      </div>
    </div>
  );
}
