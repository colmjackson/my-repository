#!/usr/bin/env node
// Exports phone mockup pictures from phones.html.
//
//   npm i playwright && npx playwright install chromium     (once)
//   node make_mockups.js [outDir]                           (default: ./png)
//
// Edit the SHEETS list to change what is exported. Each sheet is one picture.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const out = process.argv[2] || path.join(__dirname, "png");
const STYLES = ["classic", "bold", "clean", "warm"];
const TRADES = ["plumber", "electrician", "carpenter", "painter", "tiler", "landscaper", "roofer", "builder", "scaffolder"];

const SHEETS = [
  { file: "iphone-17-18-electrician-styles", device: "17", scheme: "light", title: "Electrician, four styles",
    pages: STYLES.map((s) => `electrician/${s}`) },
  { file: "iphone-17-18-electrician-scroll", device: "17", scheme: "light", title: "Electrician, Classic, scrolling down",
    pages: ["electrician/classic", "electrician/classic#services", "electrician/classic#areas", "electrician/classic#contact"] },
  { file: "iphone-17-18-electrician-dark", device: "17", scheme: "dark", title: "Electrician, four styles, dark mode",
    pages: STYLES.map((s) => `electrician/${s}`) },
  { file: "iphone-pro-max-electrician-styles", device: "promax", scheme: "light", title: "Electrician, four styles, larger phone",
    pages: STYLES.map((s) => `electrician/${s}`) },
  { file: "iphone-17-18-all-trades", device: "17", scheme: "light", title: "All nine trades, Classic", cols: 3,
    pages: TRADES.map((t) => `${t}/classic`) },
];

const PHONE = { "17": 402 + 28, promax: 440 + 28 };

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const sheet of SHEETS) {
    const cols = sheet.cols || sheet.pages.length;
    const width = cols * PHONE[sheet.device] + (cols - 1) * 40 + 64;
    const ctx = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 1.5, colorScheme: sheet.scheme });
    const page = await ctx.newPage();
    const qs = new URLSearchParams({ device: sheet.device, title: sheet.title, pages: sheet.pages.join(",") });
    if (sheet.cols) qs.set("cols", String(sheet.cols));
    await page.goto("file://" + path.join(__dirname, "phones.html") + "?" + qs);
    await page.waitForLoadState("load");
    // Frames below the first screen are not painted until they are in view, so grow the window to the
    // full height of the sheet before taking the picture.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(1200); // let frames paint and section anchors finish scrolling
    await page.screenshot({ path: path.join(out, sheet.file + ".png") });
    console.log("wrote", sheet.file + ".png");
    await ctx.close();
  }
  await browser.close();
})();
