// One command that says whether the project is ready to build and submit, or lists what is not.
// Usage (from the wish-you-were-beer folder):  npm run check            (the project)
//                                              npm run check -- ../path/to/youknowthatsite-website   (also checks the website folder)
// It needs only Node. On a Mac it also runs plutil on the property lists.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const rows = [];
const check = (cond, name, detail = '') => rows.push({ ok: !!cond, name, detail });
const exists = f => fs.existsSync(path.join(root, f));
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['node_modules', '.git', 'Pods', 'public', 'www'].includes(e.name)) walk(p, out); } else out.push(p);
  }
  return out;
};

// --- Identity: one bundle ID everywhere
const BUNDLE = 'com.colmjackson.WishYouWereBeer';
const cap = JSON.parse(read('capacitor.config.json'));
const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
const ids = [...pbx.matchAll(/PRODUCT_BUNDLE_IDENTIFIER = ([^;]+);/g)].map(m => m[1]);
check(cap.appId === BUNDLE, 'Bundle ID in capacitor.config.json', cap.appId);
check(ids.length > 0 && ids.every(i => i === BUNDLE), 'Bundle ID in the Xcode project (all configurations)', ids.join(', '));
check(read('AppStore/listing-en-GB.md').includes(BUNDLE) && read('AppStore/submission-checklist.md').includes(BUNDLE), 'Bundle ID in the listing and checklist');
check(/TARGETED_DEVICE_FAMILY = 1;/.test(pbx) && !/TARGETED_DEVICE_FAMILY = "1,2"/.test(pbx), 'iPhone only');
check(!/DEVELOPMENT_TEAM/.test(pbx), 'No team id committed (pick the team in Xcode)');
const version = (pbx.match(/MARKETING_VERSION = ([^;]+);/) || [])[1], build = (pbx.match(/CURRENT_PROJECT_VERSION = ([^;]+);/) || [])[1];
check(version && build, 'Version and build number set', `version ${version}, build ${build} (raise the build for every upload)`);

// --- iPhone project files
const plist = read('ios/App/App/Info.plist');
check(/NSCameraUsageDescription/.test(plist), 'Camera permission text present');
check(!/NSMicrophoneUsageDescription|NSLocation|NSPhotoLibrary/.test(plist), 'No permission texts beyond the camera');
check(/ITSAppUsesNonExemptEncryption<\/key>\s*<false\/>/.test(plist), 'Export compliance flag set to no non exempt encryption');
const orient = (plist.match(/<key>UISupportedInterfaceOrientations<\/key>\s*<array>([\s\S]*?)<\/array>/) || [])[1] || '';
check(/Portrait/.test(orient) && !/Landscape|UpsideDown/.test(orient), 'Portrait only on iPhone');
const privacy = read('ios/App/App/PrivacyInfo.xcprivacy');
check(/NSPrivacyTracking<\/key>\s*<false\/>/.test(privacy) && /NSPrivacyCollectedDataTypes<\/key>\s*<array\/>/.test(privacy), 'Privacy manifest: no tracking, no collected data');
const mid = (pbx.match(/([0-9A-F]{24}) \/\* PrivacyInfo.xcprivacy \*\//) || [])[1];
check(mid && (pbx.match(new RegExp(mid, 'g')) || []).length >= 3 && /PrivacyInfo.xcprivacy in Resources/.test(pbx), 'Privacy manifest is part of the App target');
check((pbx.match(/{/g) || []).length === (pbx.match(/}/g) || []).length && (pbx.match(/\(/g) || []).length === (pbx.match(/\)/g) || []).length, 'Xcode project file braces balance');
check(cap.ios && cap.ios.webContentsDebuggingEnabled === false && cap.ios.allowsLinkPreview === false, 'Web debugging and link previews off');
check(!cap.server, 'App loads its own files, not a web address');

// --- Icon and splash
const png = f => { const b = fs.readFileSync(path.join(root, f)); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colour: b[25] }; };
const icon = png('ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png');
check(icon.w === 1024 && icon.h === 1024 && icon.colour === 2, 'App icon is 1024 x 1024 with no transparency (Apple rejects alpha)', `${icon.w}x${icon.h}, colour type ${icon.colour}`);
for (const f of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
  const s = png('ios/App/App/Assets.xcassets/Splash.imageset/' + f);
  check(s.w === 2732 && s.h === 2732, 'Splash image ' + f, `${s.w}x${s.h}`);
}
for (const j of ['ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json', 'ios/App/App/Assets.xcassets/Splash.imageset/Contents.json', 'manifest.json', 'capacitor.config.json', 'package.json']) {
  try { JSON.parse(read(j)); check(true, 'Valid JSON: ' + j); } catch (e) { check(false, 'Valid JSON: ' + j, e.message); }
}
if (process.platform === 'darwin') {
  for (const f of ['ios/App/App/Info.plist', 'ios/App/App/PrivacyInfo.xcprivacy']) {
    try { execFileSync('plutil', ['-lint', path.join(root, f)], { stdio: 'pipe' }); check(true, 'plutil: ' + f); } catch (e) { check(false, 'plutil: ' + f, String(e.stdout || e.message)); }
  }
}

// --- Web app
const html = read('index.html');
check(/Content-Security-Policy/.test(html) && /script-src 'self'/.test(html) && !/unsafe-(inline|eval)/.test(html), 'Strict page security policy');
check(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html) && !/\son[a-z]+=/.test(html), 'No inline scripts or handlers');
check(!/innerHTML|eval\(|document\.write|fetch\(|XMLHttpRequest|WebSocket|sendBeacon/.test(read('app.js')), 'app.js: no network calls, no innerHTML, eval or document.write');
const newer = /roundRect|structuredClone|\.at\(|findLast|Object\.hasOwn|toSorted|fromAsync|requestVideoFrameCallback/;
check(!newer.test(read('app.js')), 'app.js avoids browser features newer than iOS 15', (read('app.js').match(newer) || [''])[0]);
check(!/\b\d*[dsl]vh\b|:has\(|@container|text-wrap|@layer|subgrid/.test(read('app.css')), 'app.css avoids features newer than iOS 15');
const sw = read('sw.js');
const shell = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
check(shell.every(f => exists(f)), 'Every file the offline cache lists exists', shell.filter(f => !exists(f)).join(', '));
const man = JSON.parse(read('manifest.json'));
check(man.icons.every(i => exists(i.src)), 'Every icon in manifest.json exists');
check(exists('fonts/OFL.txt') && ['inter-latin-400', 'inter-latin-600', 'inter-latin-ext-400', 'inter-latin-ext-600'].every(f => exists(`fonts/${f}.woff2`)), 'Inter files and licence are bundled');
const css = read('app.css');
check([...css.matchAll(/url\(([^)]+)\)/g)].every(m => exists(m[1].replace(/['"]/g, '').split('?')[0])), 'Every file the stylesheet points at exists');

// --- Listing limits (App Store Connect rejects anything longer)
const listing = read('AppStore/listing-en-GB.md');
const section = h => { const m = listing.match(new RegExp('## ' + h + '[^\\n]*\\n+([\\s\\S]*?)(?=\\n## |$)')); return m ? m[1].trim() : ''; };
for (const [h, max] of [['Name', 30], ['Subtitle', 30], ['Keywords', 100], ['Promotional text', 170], ['Description', 4000]]) {
  const text = h === 'Keywords' ? section(h).split('\n')[0] : section(h);
  check(text && text.length <= max, `Listing ${h.toLowerCase()} is within ${max} characters`, `${text.length}`);
}
check(!/\s/.test(section('Keywords').split('\n')[0]), 'Keywords have no spaces');

// --- Leftovers that must not ship
const tokens = /\[support email|YOURDOMAIN|com\.example|example\.com|\bTODO\b|\bFIXME\b|Lorem ipsum|\[date\]/i;
const scan = walk(root).filter(f => /\.(md|html|js|css|json|plist|xcprivacy|sh)$/.test(f) && !/package-lock|node_modules|Reports|preflight\.js|Tests/.test(f) && !f.includes('/ios/App/Pods'));
const left = scan.filter(f => tokens.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(root, f));
check(left.length === 0, 'No placeholders left in the project', left.join(', '));
const secrets = scan.filter(f => /(AKIA[0-9A-Z]{16}|BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{30,}|AuthKey_|\.p8\b|DEVELOPMENT_TEAM = [A-Z0-9]{10})/.test(fs.readFileSync(f, 'utf8'))).map(f => path.relative(root, f));
check(secrets.length === 0, 'No keys, tokens or team ids in the project', secrets.join(', '));
check(!/[—–]/.test(listing + read('AppStore/privacy-policy.md')), 'No long dashes in the store text');

// --- Website folder, if given
const site = process.argv[2];
if (site) {
  const dir = path.resolve(site);
  check(fs.existsSync(path.join(dir, 'style.css')), 'Website folder found', dir);
  const pages = walk(path.join(dir, 'wishyouwerebeer')).concat([path.join(dir, 'index.html')]).filter(f => f.endsWith('.html'));
  const broken = [];
  for (const f of pages) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|tel:)/.test(u)) continue;
      let target = path.resolve(path.dirname(f), u);
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) broken.push(`${path.relative(dir, f)} -> ${u}`);
    }
  }
  check(broken.length === 0, 'Website links and images all resolve', broken.join('; '));
  check(fs.existsSync(path.join(dir, 'wishyouwerebeer/privacy/index.html')) && fs.existsSync(path.join(dir, 'wishyouwerebeer/support/index.html')), 'Privacy and support pages are in the website folder');
  const same = ['index.html', 'app.css', 'app.js', 'manifest.json', 'sw.js'].every(f => fs.readFileSync(path.join(root, f), 'utf8') === fs.readFileSync(path.join(dir, 'wishyouwerebeer/app', f), 'utf8'));
  check(same, 'The web version on the website matches this project (run scripts/build-site.js if not)');
  const priv = fs.readFileSync(path.join(dir, 'wishyouwerebeer/privacy/index.html'), 'utf8').replace(/<[^>]+>/g, ' ');
  check(/(it doesn.t collect any|Nothing\.)/.test(priv) && /Camera/.test(priv), 'Privacy page says nothing is collected and covers the camera');
}

const failed = rows.filter(r => !r.ok);
for (const r of rows) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}${r.detail ? '  [' + r.detail + ']' : ''}`);
console.log(`\n${rows.length - failed.length} of ${rows.length} checks passed.${failed.length ? ' Fix the FAIL lines above.' : ' Ready to build.'}`);
process.exit(failed.length ? 1 : 0);
