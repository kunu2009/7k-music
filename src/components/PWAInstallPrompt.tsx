import { useState, useEffect } from 'react';
import { X, Download, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const iosDevice = /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !standaloneMode;

    setIsStandalone(standaloneMode);
    setIsIos(iosDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const dismissedVersion = localStorage.getItem('pwa-install-dismissed-v2');
      if (!dismissedVersion) {
        window.setTimeout(() => setShowPrompt(true), 3500);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (iosDevice) {
      const dismissedVersion = localStorage.getItem('pwa-install-dismissed-v2');
      if (!dismissedVersion) {
        window.setTimeout(() => setShowPrompt(true), 3500);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIos) {
      setShowPrompt(false);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed-v2', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-[#17557b] to-[#366e8d] rounded-2xl shadow-2xl p-4 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold mb-1">Install 7K Music</h3>
            <p className="text-white/80 text-sm mb-3">
              {isIos
                ? 'Use Share and then Add to Home Screen for a full app-like install.'
                : 'Get quick access and enjoy offline features.'}
            </p>
            
            <div className="flex gap-2">
              {!isIos ? (
                <button
                  onClick={handleInstall}
                  disabled={!deferredPrompt}
                  className="px-4 py-2 bg-[#a4d96c] hover:bg-[#b5e07d] disabled:opacity-50 text-black font-semibold rounded-lg transition text-sm"
                >
                  Install
                </button>
              ) : (
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 bg-[#a4d96c] hover:bg-[#b5e07d] text-black font-semibold rounded-lg transition text-sm inline-flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Use Share Menu
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition text-sm"
              >
                Not Now
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
        {isIos && (
          <div className="mt-3 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-white/85 text-xs leading-5">
            Tap <Share2 className="inline w-3.5 h-3.5 align-text-bottom" /> Share, then <PlusSquare className="inline w-3.5 h-3.5 align-text-bottom" /> Add to Home Screen.
          </div>
        )}
      </div>
    </div>
  );
}
