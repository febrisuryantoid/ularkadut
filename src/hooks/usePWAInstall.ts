import { useState, useEffect, useCallback } from 'react';
import {
  getPWAInstallSnapshot,
  subscribePWAInstallState,
  triggerNativePWAInstall,
  recordInstallDismissed,
} from '../pwa';

export type PWAPlatform = 'ios' | 'android' | 'desktop';
export type PWABrowser = 'safari' | 'chromium' | 'firefox' | 'other';

export interface PlatformInstallEnvironment {
  platform: PWAPlatform;
  browser: PWABrowser;
  isSecure: boolean;
}

function detectEnvironment(): PlatformInstallEnvironment {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { platform: 'desktop', browser: 'other', isSecure: true };
  }

  const ua = navigator.userAgent || '';
  const isIPadOS =
    navigator.platform === 'MacIntel' && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1;
  const isIOS = /iPad|iPhone|iPod/i.test(ua) || isIPadOS;
  const isAndroid = /Android/i.test(ua);

  const platform: PWAPlatform = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';

  const isFirefox = /Firefox|FxiOS/i.test(ua);
  const isChromium =
    /Chrome|CriOS|Edg|EdgiOS|EdgA|OPR|SamsungBrowser|Brave/i.test(ua) && !isFirefox;
  const isSafari = /Safari/i.test(ua) && !isChromium && !isFirefox;

  const browser: PWABrowser = isSafari
    ? 'safari'
    : isChromium
      ? 'chromium'
      : isFirefox
        ? 'firefox'
        : 'other';

  const isSecure =
    Boolean(window.isSecureContext) ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  return { platform, browser, isSecure };
}

export function usePWAInstall() {
  const [snapshot, setSnapshot] = useState(() => getPWAInstallSnapshot());
  const [isDelayElapsed, setIsDelayElapsed] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [env] = useState<PlatformInstallEnvironment>(() => detectEnvironment());

  useEffect(() => {
    const sync = () => {
      const next = getPWAInstallSnapshot();
      setSnapshot(next);
      if (next.isInstalled) {
        setShowManualInstructions(false);
      }
    };
    sync();
    return subscribePWAInstallState(sync);
  }, []);

  // Show invitation widget automatically after page is ready with a short, polite delay
  useEffect(() => {
    if (snapshot.isInstalled || snapshot.isStandalone || snapshot.isDismissed) {
      return;
    }

    let timerId: number | null = null;

    const startTimer = () => {
      timerId = window.setTimeout(() => {
        setIsDelayElapsed(true);
      }, 1600);
    };

    if (typeof document !== 'undefined' && document.readyState === 'complete') {
      startTimer();
    } else if (typeof window !== 'undefined') {
      window.addEventListener('load', startTimer, { once: true });
    }

    return () => {
      if (timerId !== null) {
        window.clearTimeout(timerId);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('load', startTimer);
      }
    };
  }, [snapshot.isInstalled, snapshot.isStandalone, snapshot.isDismissed]);

  const handleInstallNow = useCallback(async () => {
    if (isPrompting || snapshot.isInstalled || snapshot.isStandalone) return;

    // If native beforeinstallprompt is available, invoke it on user click
    if (snapshot.hasNativePrompt) {
      setIsPrompting(true);
      try {
        const outcome = await triggerNativePWAInstall();
        if (outcome === 'unavailable') {
          // Fallback to manual install guide if native prompt couldn't be shown
          setShowManualInstructions(true);
        }
        // Note: If outcome === 'accepted', installation status is only confirmed
        // when 'appinstalled' fires or standalone mode is detected in src/pwa.ts.
      } finally {
        setIsPrompting(false);
      }
      return;
    }

    // Browser does not support native beforeinstallprompt (e.g. Safari/iOS, Firefox, or iframe):
    // open relevant manual installation instructions
    setShowManualInstructions(true);
  }, [isPrompting, snapshot.hasNativePrompt, snapshot.isInstalled, snapshot.isStandalone]);

  const handleDismiss = useCallback(() => {
    setShowManualInstructions(false);
    recordInstallDismissed();
  }, []);

  const handleBackFromInstructions = useCallback(() => {
    setShowManualInstructions(false);
  }, []);

  const shouldShowWidget =
    env.isSecure &&
    isDelayElapsed &&
    !snapshot.isInstalled &&
    !snapshot.isStandalone &&
    !snapshot.isDismissed;

  return {
    shouldShowWidget,
    isInstalled: snapshot.isInstalled,
    isStandalone: snapshot.isStandalone,
    hasNativePrompt: snapshot.hasNativePrompt,
    isPrompting,
    showManualInstructions,
    platform: env.platform,
    browser: env.browser,
    handleInstallNow,
    handleDismiss,
    handleBackFromInstructions,
  };
}
