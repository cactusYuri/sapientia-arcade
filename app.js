'use strict';
const $ = id => document.getElementById(id);
const games = new Map(globalThis.ARCADE_GAMES.map(game => [game.id, game]));
const store = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch { /* Preferences still work for this visit. */ } }
};
let language = store.get('arcade-language') === 'en' ? 'en' : 'zh';
let selected = globalThis.ARCADE_GAMES[0];
let playing = false, frame = null, registration = null, leaving = false;
let pendingLeave = null, refreshAfterPlay = false;
let hadController = Boolean(navigator.serviceWorker?.controller);
const en = {
  games: 'Games', skip: 'Skip to games', headline: 'A little escape.<br>A whole new world.',
  intro: 'No installation. No waiting. Pick a world and follow your curiosity.',
  explore: 'Explore games ↓', free: 'Free to play', noads: 'No ad breaks', local: 'Progress saved on this device',
  collection: 'Your next adventure', play: 'Play now ↗', controls: 'How to play', hexfrontName: 'HEXAGONAL DEFENSE',
  studio: 'Made for one more run.', studioDesc: 'An independent corner by Sapientia and Love. A home for the worlds we build, and the ideas that come next.',
  back: '← Back to games', full: 'Fullscreen ↗', update: 'An update is ready. Return to the library to install it.', updateBtn: 'Update'
};
const zh = {};
document.querySelectorAll('[data-i]').forEach(element => { zh[element.dataset.i] = element.innerHTML; });
const copy = value => value[language];

function sendToGame(message) {
  if (frame && selected.bridge && location.origin !== 'null') frame.contentWindow?.postMessage(message, location.origin);
}
function renderSelectedGame() {
  $('playerTitle').textContent = copy(selected.title);
  $('playerHint').textContent = copy(selected.hint);
  $('helpGame').textContent = copy(selected.title);
  $('instructions').replaceChildren(...copy(selected.instructions).map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
  $('helpPlay').textContent = playing ? (language === 'zh' ? '继续游玩 ↗' : 'Continue playing ↗') : (language === 'zh' ? zh.play : en.play);
  if (frame) frame.title = copy(selected.title);
}
function applyLanguage() {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  document.title = language === 'zh' ? 'Sapientia Arcade · 即刻开玩' : 'Sapientia Arcade · Pick your world';
  document.querySelectorAll('[data-i]').forEach(element => { element.innerHTML = (language === 'zh' ? zh : en)[element.dataset.i]; });
  document.querySelectorAll('[data-game]').forEach(card => {
    const game = games.get(card.dataset.game);
    card.querySelectorAll('[data-game-copy]').forEach(element => { element.textContent = copy(game[element.dataset.gameCopy]); });
    card.querySelector('[data-version]').textContent = `v${game.version}`;
    card.querySelector('[data-play]').setAttribute('aria-label', `${language === 'zh' ? '游玩' : 'Play'} ${copy(game.title)}`);
    card.querySelector('[data-help]').setAttribute('aria-label', `${copy(game.title)} · ${language === 'zh' ? zh.controls : en.controls}`);
  });
  $('lang').textContent = language === 'zh' ? 'EN' : '中文';
  $('lang').setAttribute('aria-label', language === 'zh' ? 'Switch to English' : '切换到中文');
  $('closeHelp').setAttribute('aria-label', language === 'zh' ? '关闭' : 'Close');
  document.querySelector('nav').setAttribute('aria-label', language === 'zh' ? '主导航' : 'Main navigation');
  $('gameCount').textContent = `${String(games.size).padStart(2, '0')} / ${String(games.size).padStart(2, '0')}`;
  renderSelectedGame();
  store.set('arcade-language', language);
  sendToGame({ type: 'ARCADE_LANGUAGE', language });
  cacheLabel();
}
$('lang').addEventListener('click', () => { language = language === 'zh' ? 'en' : 'zh'; applyLanguage(); });

function play(id = selected.id) {
  $('helpDialog').close();
  if (playing) { frame?.focus(); return; }
  selected = games.get(id) || selected;
  playing = true;
  $('home').hidden = true;
  $('player').hidden = false;
  renderSelectedGame();
  frame = document.createElement('iframe');
  const gameUrl = new URL(selected.path, location.href);
  gameUrl.searchParams.set('arcade-version', selected.cacheVersion);
  frame.src = gameUrl.href;
  frame.title = copy(selected.title);
  frame.allow = 'fullscreen; autoplay';
  frame.setAttribute('allowfullscreen', '');
  frame.addEventListener('load', () => {
    sendToGame({ type: 'ARCADE_LANGUAGE', language });
    frame?.focus();
  });
  $('gameMount').append(frame);
  $('update').disabled = true;
  window.scrollTo(0, 0);
}
function showHelp(id = selected.id) {
  selected = games.get(id) || selected;
  renderSelectedGame();
  if (!$('helpDialog').open) $('helpDialog').showModal();
}
document.querySelectorAll('[data-play]').forEach(button => button.addEventListener('click', () => play(button.dataset.play)));
document.querySelectorAll('[data-help]').forEach(button => button.addEventListener('click', () => showHelp(button.dataset.help)));
$('helpPlay').addEventListener('click', () => play());
$('closeHelp').addEventListener('click', () => $('helpDialog').close());
$('helpDialog').addEventListener('click', event => {
  if (event.target !== $('helpDialog')) return;
  const rect = event.target.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close();
});

function saveBeforeLeaving() {
  if (!selected.bridge || !frame) return Promise.resolve();
  return new Promise(resolve => {
    const requestId = `leave-${Date.now()}`;
    // Keep the mounted game available if a navigation handshake is interrupted.
    const timeout = setTimeout(() => { pendingLeave = null; resolve(false); }, 5000);
    pendingLeave = { requestId, finish: saved => { clearTimeout(timeout); pendingLeave = null; resolve(saved === true); } };
    sendToGame({ type: 'ARCADE_LEAVE', requestId });
  });
}
window.addEventListener('message', event => {
  if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
  if (event.data?.type === 'ARCADE_READY') sendToGame({ type: 'ARCADE_LANGUAGE', language });
  if (event.data?.type === 'ARCADE_LEAVE_READY' && event.data.requestId === pendingLeave?.requestId) pendingLeave.finish(event.data.saved);
});
async function returnToLibrary() {
  if (leaving) return false;
  if (playing && selected.returnPrompt && !confirm(copy(selected.returnPrompt))) return false;
  leaving = true;
  $('back').disabled = true;
  const gameId = selected.id;
  const saved = await saveBeforeLeaving();
  if (saved === false) {
    leaving = false;
    $('back').disabled = false;
    frame?.focus();
    return false;
  }
  if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
  frame?.remove();
  frame = null;
  playing = false;
  leaving = false;
  $('back').disabled = false;
  $('player').hidden = true;
  $('home').hidden = false;
  $('update').disabled = false;
  if (refreshAfterPlay) { location.reload(); return true; }
  const button = document.querySelector(`[data-play="${gameId}"]`);
  button?.scrollIntoView({ block: 'center' });
  button?.focus({ preventScroll: true });
  return true;
}
$('back').addEventListener('click', returnToLibrary);
document.querySelectorAll('[data-library-link], .skip-link').forEach(link => link.addEventListener('click', async event => {
  if (!playing) return;
  event.preventDefault();
  await returnToLibrary();
}));
$('full').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('gameMount').requestFullscreen();
  } catch { $('gameMount').scrollIntoView(); }
});
document.addEventListener('fullscreenchange', () => {
  $('full').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement)));
});

let cacheState = 'loading';
function cacheLabel() {
  const labels = {
    loading: { zh: '首次打开后，为下次冒险保存资源', en: 'Saving resources for your next adventure' },
    ready: { zh: '游戏库已就位，游玩过的世界会留在本机', en: 'Library ready. The worlds you play stay on this device' },
    idle: { zh: '随时回来，继续冒险', en: 'Come back for another adventure' }
  };
  $('cacheStatus').textContent = copy(labels[cacheState]);
}
function showUpdate() {
  if (registration?.waiting) { $('updateBanner').hidden = false; $('update').disabled = playing; }
}
$('update').addEventListener('click', () => {
  if (!playing) registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
});
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(async result => {
    registration = result;
    showUpdate();
    result.addEventListener('updatefound', () => {
      const worker = result.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed') { cacheState = 'ready'; cacheLabel(); if (navigator.serviceWorker.controller) showUpdate(); }
      });
    });
    await navigator.serviceWorker.ready;
    cacheState = 'ready';
    cacheLabel();
  }).catch(() => { cacheState = 'idle'; cacheLabel(); });
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // First installation claims the shell without interrupting a click into a game.
    if (refreshing) return;
    if (!hadController) { hadController = true; return; }
    if (playing) { refreshAfterPlay = true; return; }
    refreshing = true;
    location.reload();
  });
} else { $('cacheStatus').parentElement.hidden = true; }
applyLanguage();
