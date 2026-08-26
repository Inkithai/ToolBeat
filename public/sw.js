/**
 * ConvertLab Service Worker
 *
 * Strategy: stale-while-revalidate for navigations, cache-first for static
 * assets. Tool pages are cached after first visit so returning users get
 * instant loads even offline. The cache is versioned so old entries are
 * purged on deploy.
 */
const CACHE = "convertlab-shell-v3";
const APP_SHELL = [
  "/",
  "/tools",
  "/icon.svg",
  "/apple-icon.png",
  "/favicon.ico",
];

// Install: cache the app shell immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for HTML navigations, cache-first for assets
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests (OpenAI API, CDN resources, etc.)
  if (url.origin !== self.location.origin) return;

  // HTML navigation requests: stale-while-revalidate
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  // Static assets (JS, CSS, images): cache-first with network fallback
  if (/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network-first with offline fallback
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/")))
  );
});
