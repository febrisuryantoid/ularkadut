import { registerSW } from 'virtual:pwa-register';

/**
 * PWA Service Worker Registration & Instant Auto-Update Engine
 * Guarantees that any deployment to Vercel or other hosts immediately updates
 * the client without requiring manual cache clearing.
 */

export function setupPWAAutoUpdate(onUpdateAvailable?: () => void) {
  if (typeof window === 'undefined') return;

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
