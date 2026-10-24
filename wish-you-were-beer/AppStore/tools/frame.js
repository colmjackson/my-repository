// Puts a headline above each screenshot, in the suite look (navy, Inter). 1320 x 2868 output.
// Usage (after screenshots.js): NODE_PATH=$(npm root -g) node AppStore/tools/frame.js "$PWD"
const { chromium } = require('playwright');
const fs = require('fs');
const root = process.argv[2];
const items = [
  ['1-viewfinder', 'Frame it right.'],
  ['2-lager-portrait', 'The pub, the time, the price.'],
  ['3-stout-square', 'A look for every pour.'],
  ['4-last-orders-story', 'Made for stories.'],
  ['5-details', 'Send it anywhere.'],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1320, height: 2868 } });
  fs.mkdirSync(`${root}/AppStore/screenshots/framed`, { recursive: true });
  const tmp = `${root}/AppStore/screenshots/framed/.tmp.html`;
  for (const [file, line] of items) {
    const html = `<!doctype html><style>
      @font-face{font-family:Inter;font-weight:600;src:url('file://${root}/fonts/inter-latin-600.woff2') format('woff2')}
      body{margin:0;width:1320px;height:2868px;overflow:hidden;position:relative;font-family:Inter,sans-serif;
        background:radial-gradient(120% 60% at 50% 0%,#12395a 0%,#0a1f33 45%,#050f18 100%)}
      h1{position:absolute;left:120px;right:120px;top:210px;margin:0;font-weight:600;font-size:124px;line-height:1.08;letter-spacing:-.02em;color:#eef4f8}
      img{position:absolute;left:150px;top:740px;width:1020px;border-radius:84px 84px 0 0;border:6px solid rgba(255,255,255,.14);border-bottom:0;box-shadow:0 40px 120px rgba(0,0,0,.6)}
    </style><h1>${line}</h1><img src="file://${root}/AppStore/screenshots/${file}.png">`;
    fs.writeFileSync(tmp, html);
    await p.goto('file://' + tmp);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${root}/AppStore/screenshots/framed/${file}.png` });
  }
  fs.unlinkSync(tmp);
  await b.close();
})();
