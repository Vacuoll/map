const CACHE_NAME = "VIZHU-visuals-projects-map-0.1.07";
// Файлы для предварительного кэширования
const PRECACHE_URLS = [
  './',
  './index.html',
  './TemplateData/favicon.ico',
  './Build/Build.loader.js',
  './Build/Build.data.unityweb',
  './Build/Build.framework.js.unityweb',
  './Build/Build.wasm.unityweb',
  './manifest.webmanifest'
];

// Устанавливаем Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Кэшируем основные ресурсы
        return cache.addAll(PRECACHE_URLS);
      })
  );
});

// Активируем Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Берём контроль над всеми открытыми вкладками
      clients.claim()
    ])
  );
});

// Обрабатываем запросы
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированный ресурс или делаем запрос
        return response || fetch(event.request);
      })
      .catch(() => {
        // Если нет сети и нет в кэше, показываем offline страницу
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_PAGE);
        }
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
// const contentToCache = [
//     "Build/Build.loader.js",
//     "Build/Build.framework.js.unityweb",
//     "Build/Build.data.unityweb",
//     "Build/Build.wasm.unityweb",
//     "TemplateData/style.css"

// ];

// self.addEventListener('install', function (e) {
//     console.log('[Service Worker] Install');
    
//     e.waitUntil((async function () {
//       const cache = await caches.open(cacheName);
//       console.log('[Service Worker] Caching all: app shell and content');
//       await cache.addAll(contentToCache);
//     })());
// });

// self.addEventListener('fetch', function (e) {
//     e.respondWith((async function () {
//       let response = await caches.match(e.request);
//       console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
//       if (response) { return response; }

//       response = await fetch(e.request);
//       const cache = await caches.open(cacheName);
//       console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
//       cache.put(e.request, response.clone());
//       return response;
//     })());
// });
