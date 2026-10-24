const { chromium } = require('playwright');
const root = process.argv[2];
const items = [
  ['1-viewfinder', 'Frame it right.'],
  ['2-lager-square', 'The pub, the time, the price.'],
  ['3-stout-portrait', 'A look for every pour.'],
  ['4-last-orders-story', 'Made for stories.'],
  ['5-details', 'Send it anywhere.'],
];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1290, height: 2796 } });
  for (const [file, line] of items) {
    const html = `<!doctype html><body style="margin:0;width:1290px;height:2796px;overflow:hidden;position:relative;
      background:radial-gradient(120% 70% at 50% 0%,#2a1d11 0%,#0d0a07 70%);font-family:'Iowan Old Style','Palatino Linotype',Georgia,serif">
      <div style="position:absolute;left:110px;right:110px;top:190px;font-style:italic;font-size:132px;line-height:1.08;color:#efe6d6">${line}</div>
      <img src="file://${root}/launch/screenshots/${file}.png" style="position:absolute;left:145px;top:700px;width:1000px;
        border-radius:80px 80px 0 0;border:6px solid #3a3226;border-bottom:0;box-shadow:0 40px 120px rgba(0,0,0,.7)">
    </body>`;
    require('fs').writeFileSync(`${root}/launch/framed/.tmp.html`, html);
    await p.goto(`file://${root}/launch/framed/.tmp.html`);
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${root}/launch/framed/${file}.png` });
  }
  require('fs').unlinkSync(`${root}/launch/framed/.tmp.html`);
  await b.close();
})();
