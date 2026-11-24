import { useEffect, useState } from 'react';

export interface NetworkStatusState {
  isOnline: boolean;
  lastChangedAt: string | null;
  effectiveType: string | null;
}

interface NetworkInformationLike {
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

function getEffectiveType(): string | null {
  if (typeof navigator === 'undefined') return null;
  const navWithConnection = navigator as Navigator & { connection?: NetworkInformationLike };
  return navWithConnection.connection?.effectiveType ?? null;
}

export function useNetworkStatus(): NetworkStatusState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [effectiveType, setEffectiveType] = useState<string | null>(() => getEffectiveType());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastChangedAt(new Date().toISOString());
      setEffectiveType(getEffectiveType());
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastChangedAt(new Date().toISOString());
      setEffectiveType(getEffectiveType());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const navWithConnection = navigator as Navigator & { connection?: NetworkInformationLike };
    const conn = navWithConnection.connection;
    const handleConnectionChange = () => setEffectiveType(getEffectiveType());
    conn?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      conn?.removeEventListener?.('change', handleConnectionChange);
    };
  }, []);

  return {
    isOnline,
    lastChangedAt,
    effectiveType,
  };
}
