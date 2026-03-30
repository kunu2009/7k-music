import React from 'react';

interface PlayerToastProps {
  message: string | null;
}

export const PlayerToast: React.FC<PlayerToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-24 sm:bottom-28 z-[70] px-4">
      <div className="bg-chathams-blue border border-calypso rounded-lg px-4 py-2 shadow-lg">
        <p className="text-timberwolf text-xs sm:text-sm whitespace-nowrap">{message}</p>
      </div>
    </div>
  );
};
