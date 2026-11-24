import { useCallback, useEffect, useState } from 'react';

export type NetworkConnectivityMode =
  | 'online'
  | 'offline_disconnected'
  | 'offline_unreachable'
  | 'offline_simulated';

export interface NetworkStatusState {
  browserOnline: boolean;
  serverReachable: boolean;
  offlineTestMode: boolean;
  isOnline: boolean;
  mode: NetworkConnectivityMode;
  lastCheckedAt: string | null;
  lastChangedAt: string | null;
  effectiveType: string | null;
  checkingReachability: boolean;
  verifyConnectivity: () => Promise<boolean>;
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

async function probeServerReachability(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3500);

  try {
    // Probe non-precached static check file so Service Worker precache never masks offline state
    const response = await fetch(`/connectivity-check.txt?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) return false;
    const text = (await response.text()).trim();
    return text === 'ok';
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useNetworkStatus(offlineTestMode: boolean): NetworkStatusState {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [serverReachable, setServerReachable] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [checkingReachability, setCheckingReachability] = useState<boolean>(false);
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [effectiveType, setEffectiveType] = useState<string | null>(() => getEffectiveType());

  const verifyConnectivity = useCallback(async () => {
    const navOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    setBrowserOnline(navOnline);
    setEffectiveType(getEffectiveType());

    if (!navOnline) {
      setServerReachable(false);
      setLastCheckedAt(new Date().toISOString());
      return false;
    }

    setCheckingReachability(true);
    try {
      const reachable = await probeServerReachability();
      setServerReachable(reachable);
      setLastCheckedAt(new Date().toISOString());
      return reachable;
    } finally {
      setCheckingReachability(false);
    }
  }, []);

  useEffect(() => {
    verifyConnectivity();

    const handleOnline = () => {
      setBrowserOnline(true);
      setLastChangedAt(new Date().toISOString());
      verifyConnectivity();
    };

    const handleOffline = () => {
      setBrowserOnline(false);
      setServerReachable(false);
      setLastChangedAt(new Date().toISOString());
      setLastCheckedAt(new Date().toISOString());
      setEffectiveType(getEffectiveType());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = window.setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine && !offlineTestMode) {
        verifyConnectivity();
      }
    }, 30000);

    const navWithConnection = navigator as Navigator & { connection?: NetworkInformationLike };
    const conn = navWithConnection.connection;
    const handleConnectionChange = () => setEffectiveType(getEffectiveType());
    conn?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(interval);
      conn?.removeEventListener?.('change', handleConnectionChange);
    };
  }, [offlineTestMode, verifyConnectivity]);

  const mode: NetworkConnectivityMode = offlineTestMode
    ? 'offline_simulated'
    : !browserOnline
      ? 'offline_disconnected'
      : !serverReachable
        ? 'offline_unreachable'
        : 'online';

  const isOnline = mode === 'online';

  return {
    browserOnline,
    serverReachable,
    offlineTestMode,
    isOnline,
    mode,
    lastCheckedAt,
    lastChangedAt,
    effectiveType,
    checkingReachability,
    verifyConnectivity,
  };
}
