'use strict';
importScripts('./assets/catalog.js');
const VERSION = 'sapientia-arcade-v4';
const PREFIX = 'sapientia-arcade-';
const BASE = new URL('./', self.location.href).pathname;
// Only the library shell is installed ahead of time. Game files arrive when played.
const FILES = ['', 'index.html', 'style.css', 'app.js', 'assets/catalog.js', ...globalThis.ARCADE_GAMES.map(game => game.cover.slice(2))];
const GAMES = globalThis.ARCADE_GAMES.map(game => ({
  ...game,
  directory: new URL('./', new URL(game.path, self.location.href)).pathname,
  cache: `${PREFIX}game-${game.id}-${game.cacheVersion}`
}));
const currentCaches = new Set([VERSION, ...GAMES.map(game => game.cache)]);

self.addEventListener('install', event => event.waitUntil(
  caches.open(VERSION).then(cache => cache.addAll(FILES.map(path => new Request(BASE + path, { cache: 'reload' }))))
));
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) {
    if (key.startsWith(PREFIX) && !currentCaches.has(key)) await caches.delete(key);
  }
  await self.clients.claim();
})()));
self.addEventListener('message', event => {
  if (event.data?.type !== 'SKIP_WAITING') return;
  event.waitUntil((async () => {
    // Another tab may still be playing, even when this tab is in the library.
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (clients.some(client => GAMES.some(game => new URL(client.url).pathname.startsWith(game.directory)))) return;
    await self.skipWaiting();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  const relative = url.pathname.slice(BASE.length);
  const game = GAMES.find(candidate => url.pathname.startsWith(candidate.directory));
  if (!game && !FILES.includes(relative)) return;
  event.respondWith((async () => {
    const name = game ? game.cache : VERSION;
    let cache;
    try {
      cache = await caches.open(name);
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
    } catch { /* Cache availability never prevents a network visit. */ }
    const response = await fetch(new Request(event.request, { cache: 'reload' }));
    if (response.ok && response.status === 200 && cache) {
      try { await cache.put(url.pathname, response.clone()); } catch { /* Keep playing when device storage is full. */ }
    }
    return response;
  })());
});
