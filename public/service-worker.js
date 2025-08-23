// Change version each time the service-worker.js code is changed!
const SW_VERSION = '2';
const CACHE_NAME = `thisweek-v${SW_VERSION}`;
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/32x32.png',
  '/icons/icon-192.png',
  '/icons/icon.png'
];

self.addEventListener("install", (event) => {
  console.log(`Service Worker ${SW_VERSION} installing`);

  // Precache essential files
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  console.log(`Service Worker ${SW_VERSION} activated`);

  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // If we got a valid response, clone it and update the cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache the fetched response for future use
              cache.put(request, responseToCache);
            });
        }

        return response;
      })
      .catch(() => {
        // Network failed, try to get from cache
        return caches.match(request)
          .then((response) => {
            if (response) {
              console.log('Serving from cache (offline):', request.url);
              return response;
            }

            // If it's a navigation request (HTML page), try to serve the app shell
            if (request.mode === 'navigate') {
              return caches.match('/') || caches.match('/index.html');
            }

            // For other requests that aren't cached, return a fallback error
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'UNREGISTER') {
    self.registration.unregister().then(() => {
      console.log('Service Worker unregistered');
    });
  }
});
