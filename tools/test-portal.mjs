import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const catalogSource = read('assets/catalog.js');
const catalogContext = vm.createContext({});
vm.runInContext(catalogSource, catalogContext);
const games = catalogContext.ARCADE_GAMES;
const html = read('index.html');
const ids = [...html.matchAll(/<article[^>]+data-game="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(games.map(game => game.id)).size, games.length, 'Unique catalog IDs');
assert.deepEqual(ids, Array.from(games, game => game.id), 'Catalog and cards agree');
for (const game of games) {
  assert.match(game.path, /^\.\/games\/[a-z0-9-]+\/index\.html$/);
  assert.match(game.cacheVersion, /^[a-zA-Z0-9.-]+$/);
  assert.ok(existsSync(resolve(root, game.path)), `Game exists: ${game.path}`);
  assert.ok(existsSync(resolve(root, game.cover)), `Cover exists: ${game.cover}`);
  for (const language of ['zh', 'en']) {
    for (const key of ['title', 'badge', 'category', 'description', 'hint']) assert.ok(game[key][language], `${game.id}: ${key}/${language}`);
    assert.ok(game.instructions[language].length > 0, `${game.id}: instructions/${language}`);
  }
  assert.ok(html.includes(`data-play="${game.id}"`), `Play control: ${game.id}`);
  assert.ok(html.includes(`data-help="${game.id}"`), `Help control: ${game.id}`);
}
for (const [, attribute, value] of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
  if (value.startsWith('#')) {
    assert.ok(html.includes(`id="${value.slice(1)}"`), `Anchor target: ${value}`);
    continue;
  }
  assert.ok(value.startsWith('./'), `Relative ${attribute}: ${value}`);
  assert.ok(existsSync(resolve(root, value)), `Linked file exists: ${value}`);
}
const translations = [...html.matchAll(/data-i="([^"]+)"/g)].map(match => match[1]);
const app = read('app.js');
for (const key of new Set(translations)) assert.match(app, new RegExp(`\\b${key}:`), `English translation: ${key}`);

const origin = 'https://example.test';
const base = '/sapientia-arcade/';
const handlers = new Map(), stores = new Map(), network = [], installs = [];
let networkStatus = 200, storageFails = false, writeFails = false, openClients = [], skipped = 0, claimed = 0;
const caches = {
  async open(name) {
    if (storageFails) throw Error('Storage disabled');
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async match(key) { return entries.get(key)?.clone(); },
      async put(key, response) { if (writeFails) throw Error('Quota exceeded'); entries.set(key, response.clone()); },
      async addAll(requests) {
        for (const request of requests) {
          const path = new URL(request.url).pathname;
          installs.push(path);
          entries.set(path, new Response(path));
        }
      }
    };
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); }
};
const self = {
  location: new URL(`${origin}${base}sw.js`),
  addEventListener(type, handler) { handlers.set(type, handler); },
  clients: { async claim() { claimed++; }, async matchAll() { return openClients; } },
  async skipWaiting() { skipped++; }
};
class LocalRequest extends Request {
  constructor(url, options) { super(typeof url === 'string' ? new URL(url, origin) : url, options); }
}
const context = vm.createContext({
  self, caches, URL, Request: LocalRequest, Response,
  async fetch(request) { network.push(request); return new Response(`Network: ${request.url}`, { status: networkStatus }); },
  importScripts(path) { assert.equal(path, './assets/catalog.js'); vm.runInContext(catalogSource, context); }
});
vm.runInContext(read('sw.js'), context);
async function event(type, values = {}) {
  const pending = [];
  let response;
  handlers.get(type)({ ...values, waitUntil(promise) { pending.push(promise); }, respondWith(promise) { response = promise; } });
  await Promise.all(pending);
  return response;
}
const request = (path, method = 'GET') => new Request(new URL(path, origin), { method });
await event('install');
assert.ok(installs.includes(`${base}index.html`));
assert.ok(installs.includes(`${base}assets/catalog.js`));
assert.ok(!installs.some(path => path.includes('/games/')), 'Install only caches shell');
const currentGameCaches = games.map(game => `sapientia-arcade-game-${game.id}-${game.cacheVersion}`);
assert.ok(!currentGameCaches.some(name => stores.has(name)), 'Games stay unloaded until played');
assert.equal(await event('fetch', { request: request('https://elsewhere.test/a.js') }), undefined);
assert.equal(await event('fetch', { request: request('/other-page/') }), undefined);
assert.equal(await event('fetch', { request: request(`${base}api/save`, 'POST') }), undefined);
assert.equal(await event('fetch', { request: request(`${base}unknown-file.js`) }), undefined);

for (const game of games) {
  const path = `${base}${game.path.slice(2)}`;
  const cacheName = `sapientia-arcade-game-${game.id}-${game.cacheVersion}`;
  let before = network.length;
  assert.equal((await event('fetch', { request: request(`${path}?arcade-version=${game.cacheVersion}`) })).status, 200);
  assert.equal(network.length, before + 1, 'First play fetches game');
  assert.equal(network.at(-1).cache, 'reload', 'New version bypasses the HTTP cache');
  assert.ok(stores.get(cacheName).has(path), 'First play populates the game-specific cache');
  await event('fetch', { request: request(`${path}?arcade-version=${game.cacheVersion}&lang=en`) });
  assert.equal(network.length, before + 1, 'Query variants reuse the correct versioned cache');
  const asset = path.replace('index.html', 'art/test.webp');
  await event('fetch', { request: request(asset) });
  assert.ok(stores.get(cacheName).has(asset), 'Nested resources are cached lazily');
}
networkStatus = 404;
const missing = `${base}games/hexfront/missing.js`;
assert.equal((await event('fetch', { request: request(missing) })).status, 404);
assert.ok(!stores.get(currentGameCaches.find(name => name.includes('hexfront'))).has(missing), 'Failed responses are not cached');
networkStatus = 200;
storageFails = true;
assert.equal((await event('fetch', { request: request(`${base}games/hexfront/fresh.js`) })).status, 200, 'Unavailable storage still serves network');
storageFails = false;
writeFails = true;
assert.equal((await event('fetch', { request: request(`${base}games/hexfront/quota.js`) })).status, 200, 'Full storage still serves network');
writeFails = false;

stores.set('sapientia-arcade-v3', new Map());
stores.set('sapientia-arcade-game-hexfront-old', new Map());
stores.set('unrelated-app', new Map());
await event('activate');
assert.equal(claimed, 1);
assert.ok(stores.has('sapientia-arcade-v4'));
assert.ok(stores.has('unrelated-app'), 'Other apps retain their cache');
assert.ok(!stores.has('sapientia-arcade-v3'), 'Previous shell is invalidated');
assert.ok(!stores.has('sapientia-arcade-game-hexfront-old'), 'Outdated game version is invalidated');
for (const name of currentGameCaches) assert.ok(stores.has(name), 'Unchanged games retain their cache');
openClients = [{ url: `${origin}${base}games/hexfront/index.html` }];
await event('message', { data: { type: 'SKIP_WAITING' } });
assert.equal(skipped, 0, 'An active game in any tab postpones the update');
openClients = [{ url: `${origin}${base}` }];
await event('message', { data: { type: 'SKIP_WAITING' } });
assert.equal(skipped, 1, 'Update proceeds from the library');
console.log(`PASS: ${games.length} games; relative links, bilingual catalog, shell-only install, lazy game caches, cache errors, version cleanup, safe update.`);
