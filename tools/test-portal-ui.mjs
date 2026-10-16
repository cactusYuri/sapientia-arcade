import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const app = readFileSync(resolve(root, 'app.js'), 'utf8');
const catalog = readFileSync(resolve(root, 'assets/catalog.js'), 'utf8');

// A small DOM contract harness; real buttons/dialogs/iframes remain native in the page.
function createHarness({ storageBlocked = false, storedLanguage = 'zh', controlled = true } = {}) {
  const messages = [], storage = new Map([['arcade-language', storedLanguage]]);
  let focused = null, reloads = 0, confirmResult = true, registrations = 0;
  class Element {
    constructor(tagName, attrs = {}) {
      this.tagName = tagName.toUpperCase(); this.attrs = attrs; this.children = []; this.listeners = new Map(); this.dataset = {};
      for (const [key, value] of Object.entries(attrs)) if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      this.hidden = 'hidden' in attrs; this.disabled = false; this.open = false; this._html = ''; this._text = '';
      if (tagName === 'iframe') this.contentWindow = { postMessage: (message, origin) => messages.push({ message, origin }) };
    }
    get id() { return this.attrs.id; }
    get innerHTML() { return this._html; }
    set innerHTML(value) { this._html = value; this._text = value.replace(/<[^>]*>/g, ''); }
    get textContent() { return this._text || this._html.replace(/<[^>]*>/g, ''); }
    set textContent(value) { this._text = value; this._html = value; }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key] ?? null; }
    append(child) { this.children.push(child); child.parentElement = this; }
    replaceChildren(...children) { this.children = []; for (const child of children) this.append(child); }
    remove() { this.parentElement.children = this.parentElement.children.filter(child => child !== this); }
    focus() { focused = this; }
    scrollIntoView() {}
    showModal() { this.open = true; }
    close() { this.open = false; }
    getBoundingClientRect() { return { left: 0, top: 0, right: 400, bottom: 400 }; }
    addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, []); this.listeners.get(type).push(fn); }
    async fire(type, values = {}) { for (const fn of this.listeners.get(type) || []) await fn({ target: this, preventDefault() {}, ...values }); }
    matches(selector) {
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      if (selector.startsWith('.')) return (this.attrs.class || '').split(' ').includes(selector.slice(1));
      const attr = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
      if (attr) return attr[1] in this.attrs && (attr[2] === undefined || attr[2] === this.attrs[attr[1]]);
      return this.tagName.toLowerCase() === selector;
    }
    querySelectorAll(selector) {
      const selectors = selector.split(',').map(value => value.trim()), results = [];
      const visit = node => { for (const child of node.children) { if (selectors.some(value => child.matches(value))) results.push(child); visit(child); } };
      visit(this); return results;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }
  const document = new Element('document');
  const stack = [{ node: document, start: 0 }];
  const voidTags = new Set(['meta', 'link', 'img', 'input', 'br']);
  for (const match of html.matchAll(/<(\/?)([a-z][a-z0-9]*)([^>]*)>/gi)) {
    const [, close, tag, attrText] = match;
    if (close) {
      const top = stack.pop();
      assert.equal(top.node.tagName, tag.toUpperCase());
      top.node.innerHTML = html.slice(top.start, match.index);
    } else {
      const attrs = {};
      for (const attr of attrText.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) attrs[attr[1]] = attr[2] ?? '';
      const node = new Element(tag, attrs);
      stack.at(-1).node.append(node);
      if (!voidTags.has(tag)) stack.push({ node, start: match.index + match[0].length });
    }
  }
  document.documentElement = document.querySelector('html');
  document.getElementById = id => document.querySelector(`#${id}`);
  document.createElement = tag => new Element(tag);
  const window = new Element('window'); window.scrollTo = () => {};
  const worker = new Element('worker'); worker.state = 'installed'; worker.postMessage = message => messages.push({ worker: message });
  const registration = new Element('registration'); registration.waiting = worker; registration.active = worker;
  const serviceWorker = new Element('serviceWorker'); serviceWorker.controller = controlled ? worker : null;
  serviceWorker.ready = Promise.resolve(registration);
  serviceWorker.register = async (path, options) => { assert.equal(path, './sw.js'); assert.equal(options.updateViaCache, 'none'); registrations++; return registration; };
  const location = { href: 'https://example.test/sapientia-arcade/', origin: 'https://example.test', protocol: 'https:', reload() { reloads++; } };
  const localStorage = {
    getItem(key) { if (storageBlocked) throw Error('Storage disabled'); return storage.get(key); },
    setItem(key, value) { if (storageBlocked) throw Error('Storage disabled'); storage.set(key, value); }
  };
  const context = vm.createContext({ document, window, navigator: { serviceWorker }, location, localStorage, URL, setTimeout, clearTimeout, confirm() { return confirmResult; } });
  vm.runInContext(catalog, context); vm.runInContext(app, context);
  return {
    context, document, window, messages, serviceWorker, storage,
    get frame() { return document.getElementById('gameMount').children[0]; },
    get focused() { return focused; }, get reloads() { return reloads; }, get registrations() { return registrations; },
    set confirmResult(value) { confirmResult = value; },
    run(code) { return vm.runInContext(code, context); },
    $(id) { return document.getElementById(id); }
  };
}

const blocked = createHarness({ storageBlocked: true, storedLanguage: 'en' });
assert.equal(blocked.document.documentElement.lang, 'zh-CN');
await blocked.$('lang').fire('click');
assert.equal(blocked.document.documentElement.lang, 'en', 'Language switches with unavailable localStorage');
assert.equal(blocked.$('gameCount').textContent, '02 / 02');
await blocked.document.querySelector('[data-help="hexfront"]').fire('click');
assert.equal(blocked.$('helpDialog').open, true);
assert.equal(blocked.$('helpGame').textContent, 'HEXFRONT');
assert.ok(blocked.$('instructions').children.some(item => item.textContent.includes('Space')));
await blocked.$('closeHelp').fire('click');
assert.equal(blocked.$('helpDialog').open, false);
await blocked.document.querySelector('[data-help="neon-dungeon"]').fire('click');
assert.equal(blocked.$('helpGame').textContent, 'NEON DUNGEON');
assert.ok(blocked.$('instructions').children.some(item => item.textContent.includes('WASD')));
assert.equal(createHarness({ storedLanguage: 'unexpected-value' }).document.documentElement.lang, 'zh-CN');

const portal = createHarness();
await portal.document.querySelector('[data-play="hexfront"]').fire('click');
assert.ok(portal.frame.src.includes('/sapientia-arcade/games/hexfront/index.html?arcade-version='));
assert.equal(portal.$('home').hidden, true);
assert.equal(portal.$('update').disabled, true);
await portal.document.querySelector('[data-play="hexfront"]').fire('click');
assert.equal(portal.$('gameMount').children.length, 1, 'Repeated play retains one frame');
const frame = portal.frame;
await portal.window.fire('message', { source: frame.contentWindow, origin: 'https://elsewhere.test', data: { type: 'ARCADE_READY' } });
assert.equal(portal.messages.length, 0, 'Foreign-origin bridge messages are ignored');
await portal.window.fire('message', { source: frame.contentWindow, origin: 'https://example.test', data: { type: 'ARCADE_READY' } });
assert.equal(portal.messages.at(-1).message.type, 'ARCADE_LANGUAGE');
await portal.$('lang').fire('click');
assert.equal(portal.messages.at(-1).message.language, 'en');
assert.ok(portal.$('playerHint').textContent.includes('Space'));
portal.run('showHelp()');
assert.equal(portal.$('helpPlay').textContent, 'Continue playing ↗');
await portal.$('helpPlay').fire('click');
assert.equal(portal.$('helpDialog').open, false);
assert.equal(portal.$('gameMount').children.length, 1);

let leave = portal.run('returnToLibrary()');
let requestId = portal.messages.at(-1).message.requestId;
assert.equal(portal.$('back').disabled, true);
assert.equal(await portal.run('returnToLibrary()'), false, 'Repeated return waits for one save');
await portal.window.fire('message', { source: frame.contentWindow, origin: 'https://example.test', data: { type: 'ARCADE_LEAVE_READY', requestId, saved: false } });
assert.equal(await leave, false);
assert.equal(portal.frame, frame, 'A failed save retains the mounted game');
assert.equal(portal.$('back').disabled, false);
leave = portal.run('returnToLibrary()'); requestId = portal.messages.at(-1).message.requestId;
await portal.window.fire('message', { source: {}, origin: 'https://example.test', data: { type: 'ARCADE_LEAVE_READY', requestId, saved: true } });
assert.equal(portal.$('back').disabled, true, 'A different window cannot complete the save');
await portal.window.fire('message', { source: frame.contentWindow, origin: 'https://example.test', data: { type: 'ARCADE_LEAVE_READY', requestId, saved: true } });
assert.equal(await leave, true);
assert.equal(portal.frame, undefined);
assert.equal(portal.$('home').hidden, false);
assert.equal(portal.focused.dataset.play, 'hexfront', 'Return restores keyboard focus to the originating card');
assert.equal(portal.$('update').disabled, false);

await portal.document.querySelector('[data-play="neon-dungeon"]').fire('click');
portal.confirmResult = false;
assert.equal(await portal.run('returnToLibrary()'), false, 'Cancel preserves the Neon run');
assert.ok(portal.frame);
portal.confirmResult = true;
await portal.serviceWorker.fire('controllerchange');
assert.equal(portal.reloads, 0, 'Controller updates do not reload during a run');
await portal.run('returnToLibrary()');
assert.equal(portal.reloads, 1, 'Deferred update reloads after returning to the library');

const firstVisit = createHarness({ controlled: false });
await firstVisit.serviceWorker.fire('controllerchange');
assert.equal(firstVisit.reloads, 0, 'First installation keeps the page in place');
await firstVisit.serviceWorker.fire('controllerchange');
assert.equal(firstVisit.reloads, 1, 'A later update in the same visit refreshes the shell');
console.log('PASS: storage fallback, bilingual help, selected-game launch, repeated actions, bridge origin/source, save acknowledgement, return focus, Neon cancel, deferred updates.');
