import { useCallback, useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface ServiceWorkerStatus {
  supported: boolean;
  registered: boolean;
  offlineReady: boolean;
  needRefresh: boolean;
  scope: string | null;
  error: string | null;
}

export function useServiceWorkerManager() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    supported: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    registered: false,
    offlineReady: false,
    needRefresh: false,
    scope: null,
    error: null,
  });
  const [updateRunner, setUpdateRunner] = useState<((reloadPage?: boolean) => Promise<void>) | null>(
    null
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        setStatus((prev) => ({ ...prev, needRefresh: true }));
      },
      onOfflineReady() {
        setStatus((prev) => ({ ...prev, offlineReady: true, registered: true }));
      },
      onRegisteredSW(_swUrl, registration) {
        setStatus((prev) => ({
          ...prev,
          registered: true,
          scope: registration?.scope ?? '/',
          error: null,
        }));
      },
      onRegisterError(error) {
        setStatus((prev) => ({
          ...prev,
          registered: false,
          error: error instanceof Error ? error.message : String(error),
        }));
      },
    });

    setUpdateRunner(() => updateSW);

    navigator.serviceWorker.ready
      .then((reg) => {
        setStatus((prev) => ({
          ...prev,
          registered: true,
          offlineReady: true,
          scope: reg.scope ?? '/',
        }));
      })
      .catch(() => {
        // Handled via onRegisterError if registration failed
      });
  }, []);

  const applyUpdate = useCallback(async () => {
    if (updateRunner) {
      await updateRunner(true);
    }
  }, [updateRunner]);

  const dismissUpdate = useCallback(() => {
    setStatus((prev) => ({ ...prev, needRefresh: false }));
  }, []);

  return {
    status,
    applyUpdate,
    dismissUpdate,
  };
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
