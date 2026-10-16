# Sapientia Arcade

Sapientia and Love browser games: NEON DUNGEON and 六域防线 · HEXFRONT.

## Local preview

Python 3 serves the site at a GitHub Pages-style project path:

```sh
python3 tools/preview.py
```

Open `http://127.0.0.1:8765/sapientia-arcade/`.
Use `--port 8766` to select another port, or `--prefix /` to preview at the origin root.

## Release checks

```sh
node tools/build-shell.mjs
node tools/test-portal.mjs
node tools/test-portal-ui.mjs
node --check app.js
node --check sw.js
```

The checks verify catalog/card consistency, bilingual content, relative links, game entry points, shell-only installation, on-play game caching, version cleanup, migration from the original service worker, game-specific controls, save handshakes and update handling.

## Adding or updating a game

1. Put the static game entry point and assets in `games/<game-id>/`.
2. Add its bilingual entry in `assets/catalog.js` and its collection card in `index.html`.
3. Increment that game's `cacheVersion` when its files change. Each game has its own cache.
4. Run `node tools/build-shell.mjs` to generate content-hashed JavaScript, catalog and CSS files and a matching shell cache version.
5. Run the checks and preview the library, controls, play/return flow and both languages.

The service worker installs the library shell first. Game assets are cached as each game is played. Updates activate from the library after game windows have closed.

## Game integration

The portal embeds each game at its relative entry point. HEXFRONT uses local saves and supports a same-origin message bridge:

- `ARCADE_READY`: the game is ready for portal messages.
- `ARCADE_LANGUAGE`: the portal sends `language: "zh"` or `"en"`.
- `ARCADE_LEAVE`: the portal sends a `requestId` before leaving.
- `ARCADE_LEAVE_READY`: the game returns that `requestId` after saving.

Both sides verify the message's source window and origin.

Edit `app.js`, `style.css` and `assets/catalog.js`, then run the shell build before release. The generated files use immutable content-hashed filenames; HTML and the service worker refer to the same release. Keep previously published hashed files available for visitors with an earlier shell.
