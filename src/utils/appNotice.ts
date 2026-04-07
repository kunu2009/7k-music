export const APP_NOTICE_EVENT = 'app-notice-event';

export interface AppNoticeDetail {
  message: string;
}

export function emitAppNotice(message: string) {
  if (typeof window === 'undefined' || !message.trim()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<AppNoticeDetail>(APP_NOTICE_EVENT, {
      detail: { message: message.trim() },
    })
  );
}