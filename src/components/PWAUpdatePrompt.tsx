import { useEffect, useState } from 'react';
import { RefreshCcw, X } from 'lucide-react';

type ServiceWorkerRegistrationWithWaiting = ServiceWorkerRegistration & {
  waiting: ServiceWorker | null;
};

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistrationWithWaiting | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    let active = true;

    const notifyIfWaiting = (nextRegistration: ServiceWorkerRegistrationWithWaiting | null) => {
      if (!active || !nextRegistration) return;
      if (nextRegistration.waiting) {
        setRegistration(nextRegistration);
        setShowPrompt(true);
      }
    };

    navigator.serviceWorker.getRegistration().then((currentRegistration) => {
      notifyIfWaiting(currentRegistration as ServiceWorkerRegistrationWithWaiting | null);

      if (!currentRegistration) {
        return;
      }

      const handleUpdateFound = () => {
        const installingWorker = currentRegistration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            notifyIfWaiting(currentRegistration as ServiceWorkerRegistrationWithWaiting);
          }
        });
      };

      currentRegistration.addEventListener('updatefound', handleUpdateFound);
      currentRegistration.update().catch(() => {
        // Ignore update check failures.
      });

      return () => currentRegistration.removeEventListener('updatefound', handleUpdateFound);
    });

    const handleControllerChange = () => {
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      active = false;
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleReload = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-36 left-4 right-4 z-[85] md:left-auto md:right-4 md:w-96">
      <div className="rounded-2xl border border-blue-200/25 bg-[#17345a]/95 shadow-2xl p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-white/12 flex items-center justify-center">
            <RefreshCcw className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold mb-1">Update ready</h3>
            <p className="text-white/78 text-sm mb-3">
              A newer version of 7K Music is available. Reload to get the latest fixes and features.
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleReload}
                className="px-4 py-2 bg-[#a4d96c] hover:bg-[#b5e07d] text-black font-semibold rounded-lg transition text-sm"
              >
                Reload
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition text-sm"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}