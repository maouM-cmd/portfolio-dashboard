const CACHE_NAME = 'portfolio-dashboard-v1';
const urlsToCache = [
    '/portfolio-dashboard/',
    '/portfolio-dashboard/index.html',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network-first strategy for API calls
    if (event.request.url.includes('api.') || event.request.url.includes('query1.finance')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first strategy for assets
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
