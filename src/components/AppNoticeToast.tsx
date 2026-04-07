import { useEffect, useState } from 'react';
import { APP_NOTICE_EVENT, AppNoticeDetail } from '@/utils/appNotice';

export function AppNoticeToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleNotice = (event: Event) => {
      const customEvent = event as CustomEvent<AppNoticeDetail>;
      const nextMessage = customEvent.detail?.message?.trim();
      if (!nextMessage) return;
      setMessage(nextMessage);
    };

    window.addEventListener(APP_NOTICE_EVENT, handleNotice as EventListener);
    return () => window.removeEventListener(APP_NOTICE_EVENT, handleNotice as EventListener);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-12 sm:bottom-16 z-[80] px-4 pointer-events-none">
      <div className="bg-gable-green/95 border border-blue-200/35 rounded-lg px-4 py-2 shadow-lg">
        <p className="text-timberwolf text-xs sm:text-sm whitespace-nowrap">{message}</p>
      </div>
    </div>
  );
}