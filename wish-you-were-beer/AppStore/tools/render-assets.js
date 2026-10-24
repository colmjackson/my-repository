// Renders the app icon sizes and the demo photo from their SVG sources.
// Usage (from the wish-you-were-beer folder): NODE_PATH=$(npm root -g) node AppStore/tools/render-assets.js "$PWD"
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = process.argv[2];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const shot = async (file, w, h, out) => {
    const svg = fs.readFileSync(path.join(root, file), 'utf8').replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`);
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<body style="margin:0">${svg}</body>`);
    await p.screenshot({ path: path.join(root, out) });
  };
  await shot('AppStore/tools/demo-pint.svg', 1200, 1600, 'AppStore/tools/demo-pint.png');
  for (const s of [1024, 512, 192, 180]) await shot('icons/icon.svg', s, s, `icons/icon-${s}.png`);
  await b.close();
})();
