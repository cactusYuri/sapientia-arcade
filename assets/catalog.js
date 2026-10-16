/* Shared by the portal, service worker and release checks. Bump cacheVersion when game files change. */
globalThis.ARCADE_GAMES = Object.freeze([
  {
    id: 'neon-dungeon',
    path: './games/neon-dungeon/index.html',
    version: '0.2.2',
    cacheVersion: '0.2.2-1',
    cover: './assets/neon.jpg',
    bridge: false,
    title: { zh: 'NEON DUNGEON', en: 'NEON DUNGEON' },
    genre: 'ROGUELITE',
    badge: { zh: '首发作品', en: 'DEBUT RELEASE' },
    category: { zh: '单人 · 动作生存', en: 'Single player · Survival' },
    description: {
      zh: '走进霓虹地牢，在敌潮中寻找生机。组合升级，挑战首领，让每一局都走得更远。',
      en: 'Enter a neon-lit dungeon. Build your upgrades, face the bosses, and push a little further with every run.'
    },
    hint: {
      zh: 'WASD / 方向键移动 · P 暂停 · M 静音 · 手机使用屏幕摇杆',
      en: 'WASD / arrows to move · P to pause · M to mute · Touch joystick on mobile'
    },
    instructions: {
      zh: ['电脑使用 WASD 或方向键移动；P 暂停，M 切换静音。', '手机使用屏幕上的虚拟摇杆。', '击败敌人、收集经验，选择升级并挑战下一波。'],
      en: ['Move with WASD or arrow keys. P pauses; M toggles sound.', 'On mobile, use the on-screen joystick.', 'Defeat enemies, collect experience, choose upgrades and survive the next wave.']
    },
    returnPrompt: {
      zh: '返回游戏库会结束当前这一局，确定返回？',
      en: 'Return to the library and end this run?'
    }
  },
  {
    id: 'hexfront',
    path: './games/hexfront/index.html',
    version: '1.2.1',
    cacheVersion: '1.2.1-pages-1',
    cover: './assets/hexfront.webp',
    bridge: true,
    title: { zh: '六域防线 · HEXFRONT', en: 'HEXFRONT' },
    genre: 'TOWER DEFENSE',
    badge: { zh: '六角策略', en: 'HEX STRATEGY' },
    category: { zh: '单人 · 策略塔防', en: 'Single player · Tower defense' },
    description: {
      zh: '在六角战场上构筑防线，用炮塔与地形编织敌人的路线。挑战 24 场战役，探索远征与无尽模式，或亲手设计一张地图。',
      en: 'Shape enemy routes across a hexagonal battlefield. Build your defense through 24 missions, explore expedition and endless modes, or design a map of your own.'
    },
    hint: {
      zh: '点击部署 · 空格开始 / 暂停 · 1–9、0 选塔 · U 升级 · 滚轮缩放',
      en: 'Click to deploy · Space to start / pause · 1–9, 0 to select towers · U to upgrade · Scroll to zoom'
    },
    instructions: {
      zh: ['选择炮塔，再点击六边形部署；用炮塔与路障规划敌人的路线。', '空格开始下一波或暂停；1–9、0 选择炮塔；U 升级；Z 撤销波间操作。', 'P 使用核心脉冲；R 显示路线；Esc / 右键取消选择。滚轮缩放，未选建造时拖动地图。', '手机可点按炮塔和战场，使用界面上的开始、暂停及缩放按钮。', '进度保存在本机，可在游戏设置中导出和导入存档。'],
      en: ['Select a tower, then tap a hex to deploy. Shape enemy routes with towers and barricades.', 'Space starts the next wave or pauses. 1–9 and 0 select towers; U upgrades; Z undoes between-wave actions.', 'P activates the core pulse; R shows routes; Esc / right-click cancels selection. Scroll to zoom and drag the map with no build selected.', 'On mobile, tap towers and battlefield tiles, and use the start, pause and zoom buttons.', 'Progress is saved on this device. Export and import saves in the game settings.']
    }
  }
]);
