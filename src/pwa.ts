import { registerSW } from 'virtual:pwa-register';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const STORAGE_INSTALLED_KEY = 'ular_kadut_pwa_installed_v1';
const STORAGE_DISMISSED_AT_KEY = 'ular_kadut_pwa_dismissed_at_v1';
// Cooldown after user clicks "NANTI" or closes widget: 12 hours
const DISMISS_COOLDOWN_MS = 12 * 60 * 60 * 1000;

type Listener = () => void;

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
let isConfirmedInstalled = false;
let isSessionDismissed = false;
let isListenersInitialized = false;
const subscribers = new Set<Listener>();

function notifySubscribers() {
  subscribers.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('[PWA] Subscriber error:', err);
    }
  });
}

export function detectStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  const isStandaloneMedia =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.matchMedia?.('(display-mode: fullscreen)').matches ||
    window.matchMedia?.('(display-mode: minimal-ui)').matches ||
    window.matchMedia?.('(display-mode: window-controls-overlay)').matches;
  const isIOSStandalone = nav.standalone === true;
  const isAndroidTWA =
    typeof document !== 'undefined' && document.referrer.includes('android-app://');

  return Boolean(isStandaloneMedia || isIOSStandalone || isAndroidTWA);
}

function readStoredInstalledFlag(): boolean {
  try {
    return localStorage.getItem(STORAGE_INSTALLED_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStoredInstalledFlag(installed: boolean) {
  try {
    if (installed) {
      localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_INSTALLED_KEY);
    }
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function isDismissCooldownActive(): boolean {
  if (isSessionDismissed) return true;
  try {
    const raw = localStorage.getItem(STORAGE_DISMISSED_AT_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return false;
    return Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function recordInstallDismissed() {
  isSessionDismissed = true;
  try {
    localStorage.setItem(STORAGE_DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // Ignore storage errors
  }
  notifySubscribers();
}

export function initPWAInstallListeners() {
  if (typeof window === 'undefined' || isListenersInitialized) return;
  isListenersInitialized = true;

  if (detectStandaloneMode()) {
    isConfirmedInstalled = true;
    writeStoredInstalledFlag(true);
  } else if (readStoredInstalledFlag()) {
    isConfirmedInstalled = true;
  }

  // Check navigator.getInstalledRelatedApps if supported by Chromium browsers
  const nav = window.navigator as Navigator & {
    getInstalledRelatedApps?: () => Promise<Array<{ id?: string; platform?: string; url?: string }>>;
  };
  if (typeof nav.getInstalledRelatedApps === 'function') {
    nav
      .getInstalledRelatedApps()
      .then((apps) => {
        if (Array.isArray(apps) && apps.length > 0) {
          isConfirmedInstalled = true;
          writeStoredInstalledFlag(true);
          notifySubscribers();
        }
      })
      .catch(() => {});
  }

  // Capture beforeinstallprompt early so it is never missed
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredInstallPrompt = e as BeforeInstallPromptEvent;
    // If browser fires beforeinstallprompt, the app is currently not installed on this device
    if (!detectStandaloneMode()) {
      isConfirmedInstalled = false;
      writeStoredInstalledFlag(false);
    }
    notifySubscribers();
  });

  // Confirm installation only when appinstalled actually fires
  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    isConfirmedInstalled = true;
    writeStoredInstalledFlag(true);
    notifySubscribers();
  });

  // Watch display-mode changes dynamically (e.g. when user opens in standalone window)
  const standaloneQuery = window.matchMedia?.('(display-mode: standalone)');
  const fullscreenQuery = window.matchMedia?.('(display-mode: fullscreen)');

  const handleDisplayChange = () => {
    if (detectStandaloneMode()) {
      isConfirmedInstalled = true;
      deferredInstallPrompt = null;
      writeStoredInstalledFlag(true);
      notifySubscribers();
    }
  };

  standaloneQuery?.addEventListener?.('change', handleDisplayChange);
  fullscreenQuery?.addEventListener?.('change', handleDisplayChange);
}

export function subscribePWAInstallState(listener: Listener): () => void {
  initPWAInstallListeners();
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
}

export function getPWAInstallSnapshot() {
  initPWAInstallListeners();
  const standalone = detectStandaloneMode();
  return {
    isInstalled: standalone || isConfirmedInstalled,
    isStandalone: standalone,
    hasNativePrompt: Boolean(deferredInstallPrompt),
    isDismissed: isDismissCooldownActive(),
  };
}

export async function triggerNativePWAInstall(): Promise<
  'accepted' | 'dismissed' | 'unavailable'
> {
  if (!deferredInstallPrompt) {
    return 'unavailable';
  }

  const promptEvent = deferredInstallPrompt;
  try {
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    // A BeforeInstallPromptEvent can only be consumed once
    deferredInstallPrompt = null;
    notifySubscribers();
    return outcome;
  } catch (err) {
    console.warn('[PWA] Native install prompt failed:', err);
    deferredInstallPrompt = null;
    notifySubscribers();
    return 'unavailable';
  }
}

/**
 * PWA Service Worker Registration & Instant Auto-Update Engine
 * Guarantees that any deployment to Vercel or other hosts immediately updates
 * the client without requiring manual cache clearing.
 */
export function setupPWAAutoUpdate(onUpdateAvailable?: () => void) {
  if (typeof window === 'undefined') return;

  // Initialize install listeners immediately at startup
  initPWAInstallListeners();

  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('[PWA] New version detected! Automatically activating update...');
      if (onUpdateAvailable) {
        onUpdateAvailable();
      }
      // Instantly trigger skipWaiting and reload with new content
      updateSW(true);
    },
    onOfflineReady() {
      console.log('[PWA] Ular Kadut is ready for offline arcade play.');
    },
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        console.log('[PWA] Service Worker registered:', swUrl);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update().catch((err) => {
            console.debug('[PWA] Periodic update check skipped:', err);
          });
        }, 60 * 1000);

        // Immediately check for updates when user returns to or focuses the game
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update().catch((err) => {
              console.debug('[PWA] Visibility update check skipped:', err);
            });
          }
        });
      }
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration error:', error);
    },
  });

  // Listen for controller changes to ensure seamless transition
  if ('serviceWorker' in navigator) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('[PWA] Controller changed, refreshing to load newest version...');
        window.location.reload();
      }
    });
  }
}

