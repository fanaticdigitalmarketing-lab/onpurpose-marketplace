const CACHE_VERSION = 'onpurpose-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// Assets to cache on install (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/services.html',
  '/dashboard.html',
  '/provider.html',
  '/contact.html',
  '/offline.html',
  '/assets/logo.png',
  '/assets/css/mobile.css',
  '/manifest.json',
];

// ── Install: cache app shell ──────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(k => k.startsWith('onpurpose-') && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for static ──────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Never intercept cross-origin or Stripe requests
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    // API: network-first, no caching (auth-protected data)
    event.respondWith(
      fetch(event.request).catch(() =>
        new Response(JSON.stringify({
          success: false,
          error: 'You appear to be offline. Please check your connection.'
        }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        })
      )
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200) return response;
            const clone = response.clone();
            caches.open(STATIC_CACHE)
              .then(cache => cache.put(event.request, clone));
            return response;
          })
          .catch(() => caches.match('/offline.html'));
      })
  );
});
