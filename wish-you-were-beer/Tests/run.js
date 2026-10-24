// Smoke, security and accessibility checks for the web app.
// Usage (from the wish-you-were-beer folder, with the app served on a local port):
//   python3 -m http.server 8767 &
//   NODE_PATH=$(npm root -g) node Tests/run.js http://localhost:8767 Reports
// Writes Reports/tests-<date>-<time>/summary.md and exits 1 if anything failed.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const base = process.argv[2] || 'http://localhost:8767';
const outRoot = process.argv[3] || 'Reports';
const results = [];
const pass = (name, detail = '') => results.push({ ok: true, name, detail });
const fail = (name, detail = '') => results.push({ ok: false, name, detail });
const check = (cond, name, detail = '') => (cond ? pass(name, detail) : fail(name, detail));

// Contrast, measured the way the audits do: WCAG ratio of text colour over its effective background.
const contrastProbe = () => {
  const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const over = (top, under) => ({ r: top.r * top.a + under.r * (1 - top.a), g: top.g * top.a + under.g * (1 - top.a), b: top.b * top.a + under.b * (1 - top.a), a: 1 });
  const lum = ({ r, g, b }) => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
  const bgOf = el => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c.a > 0) stack.push(c); if (c.a === 1) break; }
    let bg = { r: 5, g: 15, b: 24, a: 1 }; // the page background
    for (const c of stack.reverse()) bg = over(c, bg);
    return bg;
  };
  const sel = ['h1', 'h1 span', '.sub', 'label.field', '.check', '.note', '.note a', '#retake', '#share', '#save', '.btn',
    '.looks button[aria-checked=false]', '.looks button[aria-checked=true]', '.seg input:not(:checked) + span', '.seg input:checked + span',
    'summary', '#status', 'input[type=text]', 'select'];
  const rows = [];
  for (const s of sel) {
    const el = document.querySelector(s);
    if (!el || el.offsetParent === null) continue;
    const fg = over(parse(getComputedStyle(el).color), bgOf(el));
    const size = parseFloat(getComputedStyle(el).fontSize);
    rows.push({ s, ratio: Math.round(ratio(fg, bgOf(el)) * 100) / 100, size });
  }
  return rows;
};

(async () => {
  const browser = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'], serviceWorkers: 'allow' });
  const page = await ctx.newPage();
  const problems = [], hosts = new Set();
  page.on('pageerror', e => problems.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || /Content Security Policy|Refused to/i.test(m.text())) problems.push(m.type() + ': ' + m.text()); });
  page.on('request', r => { try { hosts.add(new URL(r.url()).host); } catch {} });

  await page.goto(base + '/index.html');
  await page.waitForTimeout(1200);

  // --- Security
  const html = await (await ctx.request.get(base + '/index.html')).text();
  check(/Content-Security-Policy/.test(html) && /script-src 'self'/.test(html) && !/unsafe-inline|unsafe-eval/.test(html), 'Security policy: strict, no inline or eval');
  check(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'No inline scripts in the page');
  check(!/\son[a-z]+=/.test(html), 'No inline event handlers');
  check(hosts.size === 1, 'No requests leave the app', [...hosts].join(', '));
  check(!/innerHTML|eval\(|document\.write/.test(fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8')), 'No innerHTML, eval or document.write in app.js');
  check(problems.length === 0, 'No console errors or policy violations', problems.join(' | '));

  // --- Function
  check(await page.evaluate(() => document.fonts.check('600 20px Inter')), 'Inter font loads from the app');
  check((await page.evaluate(() => document.getElementById('video').videoWidth)) > 0, 'Camera viewfinder starts');
  await page.evaluate(async () => {
    const img = new Image(); img.src = '/AppStore/tools/demo-pint.png'; await img.decode();
    const c = document.createElement('canvas'); c.width = 1200; c.height = 1600;
    const x = c.getContext('2d'); (function draw() { x.drawImage(img, 0, 0); requestAnimationFrame(draw); })();
    const v = document.getElementById('video'); v.srcObject = c.captureStream(30); await v.play();
  });
  await page.fill('#venue', 'The Gilded Hop, Cork');
  await page.check('#priceOn');
  await page.fill('#price', '7,2');
  check(await page.isVisible('#grid'), 'Golden ratio grid shows on the viewfinder');
  await page.click('#shutter');
  await page.waitForTimeout(600);
  check(await page.isVisible('#preview') && await page.isVisible('#doneRow'), 'Shutter makes a picture and shows Retake, Save, Share');
  check(!(await page.isVisible('#grid')), 'Grid is hidden on the finished picture');
  const label = await page.getAttribute('#preview', 'aria-label');
  check(/The Gilded Hop, Cork/.test(label) && /€7\.20/.test(label), 'Picture description includes the venue and a tidy price', label);
  check((await page.evaluate(() => [document.getElementById('preview').width, document.getElementById('preview').height])).join('x') === '1080x1350', 'Portrait export is 1080 x 1350');
  const hashes = new Set();
  for (const k of ['stout', 'lager', 'pale', 'last', 'snug']) {
    await page.click(`#looks button[data-look=${k}]`);
    await page.waitForTimeout(250);
    hashes.add(await page.evaluate(() => { const c = document.getElementById('preview'); const d = c.getContext('2d').getImageData(40, 300, 200, 200).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; return h; }));
  }
  check(hashes.size === 5, 'All five looks give different pictures', `${hashes.size} distinct`);
  for (const [v, dims] of [['square', '1080x1080'], ['story', '1080x1920']]) {
    await page.evaluate(() => { document.querySelector('details').open = true; });
    await page.check(`input[value=${v}]`);
    await page.waitForTimeout(250);
    check((await page.evaluate(() => [document.getElementById('preview').width, document.getElementById('preview').height])).join('x') === dims, `${v} export is ${dims}`);
  }
  await page.check('input[value=portrait]');

  // Long venue: shortened, but the words after it survive.
  await page.fill('#venue', 'A very long pub name that goes on and on, Temple Bar, Dublin');
  await page.waitForTimeout(250);
  const kept = await page.evaluate(() => { const v = document.getElementById('venue').value.trim(), t = document.getElementById('tag').value.trim(); return (v + t).length > 0; });
  check(kept, 'Long venue names are accepted without breaking the picture');
  await page.fill('#venue', 'The Gilded Hop, Cork');

  // --- Accessibility
  const names = await page.evaluate(() => [...document.querySelectorAll('button, input, select, summary')].filter(e => e.offsetParent !== null || e.type === 'file' || e.type === 'radio').map(e => {
    const l = e.labels && e.labels.length ? e.labels[0].textContent.trim() : '';
    return { id: e.id || e.name || e.tagName, name: (e.getAttribute('aria-label') || l || e.textContent || '').trim() };
  }));
  const unnamed = names.filter(n => !n.name);
  check(unnamed.length === 0, 'Every control has an accessible name', unnamed.map(n => n.id).join(', '));
  const small = await page.evaluate(() => [...document.querySelectorAll('button, summary, select, input[type=text], .seg span, .check')].filter(e => e.offsetParent !== null).map(e => { const r = e.getBoundingClientRect(); return { n: e.id || e.className || e.tagName, w: Math.round(r.width), h: Math.round(r.height) }; }).filter(r => r.h < 44 || r.w < 44));
  check(small.length === 0, 'Tap targets are at least 44 x 44', small.map(s => `${s.n} ${s.w}x${s.h}`).join(', '));
  const rows = await page.evaluate(contrastProbe);
  const low = rows.filter(r => r.ratio < 4.5);
  check(low.length === 0, 'Text contrast is at least 4.5:1', low.map(r => `${r.s} ${r.ratio}`).join(', ') || `lowest ${Math.min(...rows.map(r => r.ratio))}`);
  const overflow = async (w, zoom) => { await page.setViewportSize({ width: w, height: 800 }); await page.evaluate(z => { document.documentElement.style.fontSize = z; }, zoom); await page.waitForTimeout(150); return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth); };
  check(!(await overflow(320, '100%')), 'No sideways scrolling at 320 px wide');
  check(!(await overflow(320, '200%')), 'No sideways scrolling at 320 px wide with text at 200%');
  await page.evaluate(() => { document.documentElement.style.fontSize = ''; }); await page.setViewportSize({ width: 390, height: 844 });
  check(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches || !document.getAnimations().length), 'No running animations');

  // --- Storage and offline
  await page.fill('#tag', 'Great craic');
  await page.reload(); await page.waitForTimeout(1000);
  check((await page.inputValue('#venue')) === 'The Gilded Hop, Cork' && (await page.inputValue('#tag')) === 'Great craic', 'Venue and words are remembered after a reload');
  check(await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())), 'Offline support registers');
  await page.waitForTimeout(800);
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(800);
  check((await page.title()) === 'Wish You Were Beer', 'App opens with no network');
  await ctx.setOffline(false);

  // --- Native share path with a stand in bridge
  const nctx = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'], serviceWorkers: 'block' });
  const npage = await nctx.newPage();
  await npage.addInitScript(() => {
    window.__calls = [];
    window.Capacitor = { isNativePlatform: () => true, registerPlugin: n => n === 'Filesystem'
      ? { writeFile: async o => { window.__calls.push(['writeFile', o.directory, o.data.length > 1000]); return { uri: 'file:///cache/' + o.path }; } }
      : { share: async o => { window.__calls.push(['share', o.files.length]); } } };
  });
  await npage.goto(base + '/index.html'); await npage.waitForTimeout(900);
  await npage.click('#shutter'); await npage.waitForTimeout(500);
  check(!(await npage.isVisible('#save')), 'Save is hidden inside the iPhone app (the share sheet has Save Image)');
  await npage.click('#share'); await npage.waitForTimeout(400);
  const calls = JSON.stringify(await npage.evaluate(() => window.__calls));
  check(calls === '[["writeFile","CACHE",true],["share",1]]', 'Native share writes the picture to cache, then shares it', calls);

  await browser.close();

  const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  const dir = path.join(outRoot, `tests-${stamp}`);
  fs.mkdirSync(dir, { recursive: true });
  const failed = results.filter(r => !r.ok);
  const lines = [`# Wish You Were Beer: test run ${stamp}`, '', `${results.length - failed.length} of ${results.length} checks passed.`, '',
    '| Result | Check | Detail |', '| --- | --- | --- |', ...results.map(r => `| ${r.ok ? 'Pass' : '**FAIL**'} | ${r.name} | ${r.detail.replace(/\|/g, '/')} |`), ''];
  fs.writeFileSync(path.join(dir, 'summary.md'), lines.join('\n'));
  console.log(lines.join('\n'));
  process.exit(failed.length ? 1 : 0);
})();
