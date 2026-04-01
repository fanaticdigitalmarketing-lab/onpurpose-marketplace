/**
 * OnPurpose Capacitor Native App Initialization
 * This file is loaded only in the native mobile app context.
 * It is never loaded on the website (guarded by window.Capacitor check).
 */

(async function initCapacitorFeatures() {
  // Only run inside Capacitor native context
  if (typeof window === 'undefined' || !window.Capacitor) return;

  const { Capacitor } = window;
  const platform = Capacitor.getPlatform(); // 'ios', 'android', or 'web'

  console.log('[Capacitor] Platform:', platform);

  // ── Status Bar ─────────────────────────────────────────────────────
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: Style.Light });
    if (platform === 'android') {
      await StatusBar.setBackgroundColor({ color: '#1a2744' });
    }
  } catch (e) { console.warn('[StatusBar]', e.message); }

  // ── Splash Screen ──────────────────────────────────────────────────
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.show({ autoHide: false });
    // Wait for page to be interactive then hide
    document.addEventListener('DOMContentLoaded', async () => {
      setTimeout(async () => {
        await SplashScreen.hide({ fadeOutDuration: 400 });
      }, 300);
    });
  } catch (e) { console.warn('[SplashScreen]', e.message); }

  // ── Hardware Back Button (Android) ─────────────────────────────────
  if (platform === 'android') {
    try {
      const { App } = await import('@capacitor/app');
      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    } catch (e) { console.warn('[App BackButton]', e.message); }
  }

  // ── App URL Open (deep links) ──────────────────────────────────────
  try {
    const { App } = await import('@capacitor/app');
    App.addListener('appUrlOpen', ({ url }) => {
      const slug = url.split('onpurpose.earth').pop();
      if (slug && slug !== '/') window.location.href = slug;
    });
  } catch (e) { console.warn('[App URLOpen]', e.message); }

  // ── Set CSS variable for status bar height ─────────────────────────
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    const info = await StatusBar.getInfo();
    document.documentElement.style.setProperty(
      '--cap-status-bar-height',
      (info?.height || 0) + 'px'
    );
  } catch {}

  console.log('[Capacitor] Initialization complete');

})();
