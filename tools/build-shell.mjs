import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(resolve(root, path), 'utf8');
const write = (path, contents) => writeFileSync(resolve(root, path), contents);
const hash = contents => createHash('sha256').update(contents).digest('hex').slice(0, 12);
const sources = ['app.js', 'style.css', 'assets/catalog.js'];
let html = read('index.html'), worker = read('sw.js');
const files = [];
for (const source of sources) {
  const contents = read(source);
  const output = source.replace(/\.(js|css)$/, `.${hash(contents)}.$1`);
  write(output, contents);
  const extension = source.endsWith('.css') ? 'css' : 'js';
  const stem = source.slice(0, -extension.length - 1).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reference = new RegExp(`${stem}(?:\\.[a-f0-9]{12})?\\.${extension}`, 'g');
  html = html.replace(reference, output);
  worker = worker.replace(reference, output);
  files.push(output);
}
// Include the HTML and worker logic as well as immutable filenames in the release ID.
const canonicalWorker = worker.replace(/const VERSION = '[^']+';/, "const VERSION = 'SHELL_VERSION';");
const version = `sapientia-arcade-v5-${hash(html + canonicalWorker)}`;
worker = worker.replace(/const VERSION = '[^']+';/, `const VERSION = '${version}';`);
write('index.html', html);
write('sw.js', worker);
console.log(`Built ${version}: ${files.join(', ')}`);
