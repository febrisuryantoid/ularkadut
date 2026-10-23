/**
 * Fullscreen and PWA display utilities for Ular Kadut.
 * Handles cross-browser fullscreen requests and auto-fullscreen for PWA standalone mode.
 */

export function isFullscreenActive(): boolean {
  if (typeof document === 'undefined') return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
  );
}

export function isStandalonePWA(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as any;
  return Boolean(
    window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      nav.standalone === true
  );
}

export async function requestFullscreenSafe(targetElement?: Element): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const el = (targetElement || document.documentElement) as any;

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    } else if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return true;
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return true;
    }
  } catch {
    // Some iframe environments or user gesture policies may reject fullscreen.
    return false;
  }
  return false;
}

export async function exitFullscreenSafe(): Promise<boolean> {
  if (typeof document === 'undefined') return false;
  const doc = document as any;

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
      return true;
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
      return true;
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
      return true;
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export async function toggleFullscreen(): Promise<boolean> {
  if (isFullscreenActive()) {
    return exitFullscreenSafe();
  } else {
    return requestFullscreenSafe();
  }
}

/**
 * Automatically triggers fullscreen mode in PWA standalone installations
 * on the very first user interaction if not already fullscreen.
 */
export function setupAutoFullscreenForPWA(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  // Attempt immediately on mount if in standalone mode
  if (isStandalonePWA() && !isFullscreenActive()) {
    requestFullscreenSafe().catch(() => {});
  }

  const triggerOnGesture = () => {
    if (isStandalonePWA() && !isFullscreenActive()) {
      requestFullscreenSafe().catch(() => {});
    }
    // Clean up once triggered
    window.removeEventListener('pointerdown', triggerOnGesture);
    window.removeEventListener('keydown', triggerOnGesture);
  };

  window.addEventListener('pointerdown', triggerOnGesture, { passive: true });
  window.addEventListener('keydown', triggerOnGesture, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', triggerOnGesture);
    window.removeEventListener('keydown', triggerOnGesture);
  };
}
