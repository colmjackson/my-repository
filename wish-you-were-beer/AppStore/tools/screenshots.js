// Takes the App Store screenshots (6.9 inch iPhone, 1320 x 2868) and the sample postcards from the web build.
// These come from the web build in a desktop browser with an illustrated demo photo. Replace them with
// simulator screenshots of the real app and real photos before you submit.
// Usage (from the wish-you-were-beer folder):
//   python3 -m http.server 8767 &
//   NODE_PATH=$(npm root -g) node AppStore/tools/screenshots.js "$PWD"
const { chromium } = require('playwright');
const fs = require('fs');
const root = process.argv[2];
const base = process.argv[3] || 'http://localhost:8767';

(async () => {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, hasTouch: true, permissions: ['camera'], serviceWorkers: 'block' });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.clock.setFixedTime(new Date('2026-10-23T21:42:00'));
  await p.goto(base + '/index.html');
  await p.waitForTimeout(1200);
  await p.evaluate(async () => {
    const img = new Image();
    img.src = '/AppStore/tools/demo-pint.png';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 1600;
    const x = c.getContext('2d');
    (function draw() { x.drawImage(img, 0, 0); requestAnimationFrame(draw); })();
    const v = document.getElementById('video');
    v.srcObject = c.captureStream(30);
    await v.play();
    document.querySelector('details').open = true;
  });
  await p.fill('#venue', 'The Gilded Hop, Cork');
  await p.check('#priceOn');
  await p.fill('#price', '7.20');
  const out = n => `${root}/AppStore/screenshots/${n}.png`;
  const top = () => p.evaluate(() => { document.activeElement.blur(); window.scrollTo(0, 0); });
  const look = async k => { const s = `#looks button[data-look=${k}]`; if (await p.getAttribute(s, 'aria-checked') !== 'true') await p.click(s); await p.waitForTimeout(450); };

  await top(); await p.waitForTimeout(400);
  await p.screenshot({ path: out('1-viewfinder') });

  await p.click('#shutter');
  await p.waitForTimeout(700);
  await look('lager'); await top();
  await p.screenshot({ path: out('2-lager-portrait') });

  await look('stout'); await p.check('input[value=square]'); await p.waitForTimeout(450); await top();
  await p.screenshot({ path: out('3-stout-square') });

  await look('last'); await p.check('input[value=story]'); await p.waitForTimeout(450); await top();
  await p.screenshot({ path: out('4-last-orders-story') });

  await look('snug'); await p.check('input[value=portrait]'); await p.waitForTimeout(450);
  await p.evaluate(() => window.scrollTo(0, 560)); await p.waitForTimeout(300);
  await p.screenshot({ path: out('5-details') });
  await p.evaluate(() => window.scrollTo(0, 0));

  for (const k of ['stout', 'lager', 'pale', 'last', 'snug']) {
    await look(k);
    const data = await p.evaluate(() => document.getElementById('preview').toDataURL('image/jpeg', 0.92));
    fs.writeFileSync(`${root}/AppStore/samples/postcard-${k}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log('errors:', errs);
  await b.close();
})();
