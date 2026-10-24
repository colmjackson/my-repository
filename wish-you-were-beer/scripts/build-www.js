// Copies the web app into www/, which Capacitor packages into the iPhone app.
// The service worker and launch notes are left out: the app has no use for them.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');
const files = ['index.html', 'app.css', 'app.js', 'manifest.json'];
const dirs = ['icons', 'fonts'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const f of files) fs.copyFileSync(path.join(root, f), path.join(out, f));
for (const d of dirs) fs.cpSync(path.join(root, d), path.join(out, d), { recursive: true });
console.log('www ready:', fs.readdirSync(out).join(', '));
