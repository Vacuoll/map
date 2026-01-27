let CURRENT_CACHE = null;

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
// Загружаем информацию о сборке
async function loadBuildInfo() {
  try {
    const response = await fetch('./version.json');
    const buildInfo = await response.json();
    return buildInfo.cacheName;
  } catch (e) {
    console.warn('[SW] Не удалось загрузить version.json:', e);
    return 'app-cache-fallback';
  }
}
// Устанавливаем Service Worker
self.addEventListener('install', async (event) => {
  CURRENT_CACHE = await loadBuildInfo();
  console.log('[SW] Установка кэша:', CURRENT_CACHE);

  self.skipWaiting();

  event.waitUntil(
    caches.open(CURRENT_CACHE)
      .then((cache) => {
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
            if (cacheName !== CURRENT_CACHE) {
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
