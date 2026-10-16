HEXFRONT GAME FONT ASSETS
Prepared 2026-10-04 from the official google/fonts distribution repository.

The three .woff2 files and licenses/ are bundled in both editions.
Original upstream source links are listed below.

oxanium-latin-variable.woff2
  Latin headings, labels, metrics. Variable wght 200-800.
  Copyright 2019 The Oxanium Project Authors (https://github.com/sevmeyer/oxanium)
  Source: https://raw.githubusercontent.com/google/fonts/main/ofl/oxanium/Oxanium%5Bwght%5D.ttf
  License: https://raw.githubusercontent.com/google/fonts/main/ofl/oxanium/OFL.txt
  Local license: licenses/Oxanium-OFL.txt (SIL Open Font License 1.1)

rajdhani-latin-medium.woff2
  Latin body copy. Static weight 500 (Medium).
  Copyright (c) 2014, Indian Type Foundry (info@indiantypefoundry.com).
  Source: https://raw.githubusercontent.com/google/fonts/main/ofl/rajdhani/Rajdhani-Medium.ttf
  License: https://raw.githubusercontent.com/google/fonts/main/ofl/rajdhani/OFL.txt
  Local license: licenses/Rajdhani-OFL.txt (SIL Open Font License 1.1)

noto-sans-sc-game-variable.woff2
  Simplified Chinese headings and body. Variable wght 400-800.
  Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'
  Source: https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/NotoSansSC%5Bwght%5D.ttf
  License: https://raw.githubusercontent.com/google/fonts/main/ofl/notosanssc/OFL.txt
  Local license: licenses/NotoSansSC-OFL.txt (SIL Open Font License 1.1)

All assets are modified subsets; Noto also has its weight axis narrowed to 400-800.
No reserved font name is introduced by these changes.

CJK COVERAGE
Noto is subset to every available character occurring in client/*.js and
client/*.html plus common UI punctuation, arrows, numbers, and Latin letters.
All existing Chinese characters are explicitly validated. Unseen custom player
names and future Chinese strings can fall through to system fonts. Keep the
system fallback chain. Emoji and uncommon decorative glyphs can also require
system fallback; see font-report.json for exact unsupported source symbols.

The upstream font URLs above can be used to regenerate the CJK subset when adding new built-in text. Runtime fallback fonts cover custom player text.

Suggested @font-face declarations (adjust URLs to deployment directory):
@font-face {
  font-family: 'Hex Oxanium';
  src: url('./fonts/oxanium-latin-variable.woff2') format('woff2');
  font-weight: 200 800; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Hex Rajdhani';
  src: url('./fonts/rajdhani-latin-medium.woff2') format('woff2');
  font-weight: 500; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'Hex Noto SC';
  src: url('./fonts/noto-sans-sc-game-variable.woff2') format('woff2');
  font-weight: 400 800; font-style: normal; font-display: swap;
}

Heading/metrics stack:
  'Hex Oxanium', 'Hex Noto SC', 'PingFang SC', 'Microsoft YaHei', sans-serif
Body stack:
  'Hex Rajdhani', 'Hex Noto SC', 'PingFang SC', 'Microsoft YaHei', sans-serif

Preload Oxanium and Noto with as="font" type="font/woff2" crossorigin.
Canvas text should be repainted after document.fonts.ready; cache-dependent
measurements should be invalidated when font loading finishes.
