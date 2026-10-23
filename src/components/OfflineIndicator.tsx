import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-xl bg-[#203126] text-white px-3.5 py-2 text-xs font-semibold shadow-lg border border-white/20 animate-in fade-in slide-in-from-bottom-2"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#FFC928]" />
      <span>Mode Offline — Game tetap dapat dimainkan!</span>
    </div>
  );
};
