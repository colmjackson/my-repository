const { chromium } = require('playwright');
const fs = require('fs');
const root = process.argv[2];
(async () => {
  const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const ctx = await b.newContext({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 3, hasTouch: true, permissions: ['camera'] });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.clock.setFixedTime(new Date('2026-10-23T21:42:00'));
  await p.goto('http://localhost:8767/index.html');
  await p.waitForTimeout(1200);
  await p.evaluate(async () => {
    const img = new Image();
    img.src = '/launch/assets/demo-pint.png';
    await img.decode();
    const c = document.createElement('canvas');
    c.width = 1200; c.height = 1600;
    const x = c.getContext('2d');
    (function draw() { x.drawImage(img, 0, 0); requestAnimationFrame(draw); })();
    const v = document.getElementById('video');
    v.srcObject = c.captureStream(30);
    await v.play();
  });
  await p.fill('#venue', 'The Gilded Hop, Cork');
  await p.check('#priceOn');
  await p.fill('#price', '7.20');
  const out = n => `${root}/launch/screenshots/${n}.png`;
  await p.waitForTimeout(500);
  await p.evaluate(() => document.activeElement.blur());
  await p.screenshot({ path: out('1-viewfinder') });

  await p.click('#shutter');
  await p.waitForTimeout(600);
  await p.click('#looks button[data-look=lager]').catch(() => {});
  if (await p.getAttribute('#looks button[data-look=lager]', 'aria-checked') !== 'true') await p.click('#looks button[data-look=lager]');
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: out('2-lager-square') });

  await p.click('#looks button[data-look=stout]');
  await p.check('input[value=portrait]');
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: out('3-stout-portrait') });

  await p.click('#looks button[data-look=last]');
  await p.check('input[value=story]');
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.screenshot({ path: out('4-last-orders-story') });

  await p.click('#looks button[data-look=snug]');
  await p.check('input[value=square]');
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 430));
  await p.waitForTimeout(300);
  await p.screenshot({ path: out('5-details') });
  await p.evaluate(() => window.scrollTo(0, 0));

  // The real exported postcards, one per look.
  await p.check('input[value=square]');
  for (const k of ['stout', 'lager', 'pale', 'last', 'snug']) {
    const sel = `#looks button[data-look=${k}]`;
    if (await p.getAttribute(sel, 'aria-checked') !== 'true') await p.click(sel);
    await p.waitForTimeout(400);
    const data = await p.evaluate(() => document.getElementById('preview').toDataURL('image/jpeg', 0.92));
    fs.writeFileSync(`${root}/launch/samples/postcard-${k}.jpg`, Buffer.from(data.split(',')[1], 'base64'));
  }
  console.log('errors:', errs);
  await b.close();
})();
