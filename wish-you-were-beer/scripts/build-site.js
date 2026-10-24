// Copies the website pages and the web app into a clone of the youknowthatsite website.
// Usage: node scripts/build-site.js /path/to/youknowthatsite-website
// Adds wishyouwerebeer/ (landing, privacy, support, and the web app under app/), the app icon, and the headers file.
// It never edits the site's homepage: add the card by hand (see Docs/workflow.md).
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = process.argv[2];
if (!dest || !fs.existsSync(path.join(dest, 'style.css'))) {
  console.error('Give the path to the website folder (the one that contains style.css).');
  process.exit(1);
}
const out = path.join(dest, 'wishyouwerebeer');
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'AppStore/website/wishyouwerebeer'), out, { recursive: true });

const app = path.join(out, 'app');
fs.mkdirSync(app, { recursive: true });
for (const f of ['index.html', 'app.css', 'app.js', 'manifest.json', 'sw.js']) fs.copyFileSync(path.join(root, f), path.join(app, f));
for (const d of ['icons', 'fonts']) fs.cpSync(path.join(root, d), path.join(app, d), { recursive: true });

fs.mkdirSync(path.join(dest, 'img'), { recursive: true });
fs.copyFileSync(path.join(root, 'icons/icon-512.png'), path.join(dest, 'img/wishyouwerebeer-icon.png'));
fs.copyFileSync(path.join(root, 'AppStore/website/_headers'), path.join(dest, '_headers'));
console.log('Added', path.relative(dest, out), 'and img/wishyouwerebeer-icon.png and _headers to', dest);
