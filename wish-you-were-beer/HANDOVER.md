# Wish You Were Beer handover

Last updated 2026-10-24, end of session. Start the next session in a **fresh chat** with: **"carry on with Wish You Were Beer"**. Read this file, then `CLAUDE.md` and `README.md`.

## What it is
iPhone app and web version. Photograph a drink (or choose a photo), pick one of five looks, type where you are, optionally add the price, and share. The pub, your words, the time and the price are drawn into the picture. Free, no accounts, no server.

## Where things stand (2026-10-24)
- **Web version:** built, restyled in the suite look, and passing `Tests/run.js` (28 of 28, report in `Reports/`) and `npm run check` (47 of 47). Fixed on 2026-10-24: the price stamp now draws on iOS 15. The pages and the web app are merged into `main` of the website repo (2026-10-25, commit `3533e77`) but **not uploaded to Cloudflare**, so not live.
- **iPhone app:** the Capacitor project in `ios/` is generated and configured (bundle ID, icon, navy splash, camera permission, portrait, iPhone only, privacy manifest, export compliance, debugging off). **It has never been opened in Xcode or run on a phone.** Built on Linux.
- **App Store:** nothing created. No app record, no TestFlight build, nothing submitted.
- **Website:** homepage card, landing, privacy and support pages are ready on the branch. The headers file is scoped to `/wishyouwerebeer/` only.
- **Screenshots:** drafts from the web build with an illustrated pint and an invented pub. Not for the store.

## Next, in order
Start with `Docs/signoff.md` (the sign off sheet with exact commands). `npm run check` is the quick go or no go.

0. **Done 2026-10-25:** trademark search clear on the Irish, EU and UK registers (reported by Colm). Website branch merged to the site's `main`.
1. **Colm:** decide where the code lives. The other apps are in private repos on ClaudeHQ. This one is in the public `my-repository`. Say go and I will make a private `WishYouWereBeer` repo (needs your go; I will not create it unasked).
2. **Colm:** `git pull` the Website repo on the Mac, copy the pages into `Website-upload` (keep `Website` and `Website-upload` identical, `diff -rq`), upload to Cloudflare, and check by page title with curl (HTTP 200 proves nothing, unknown paths show the home page).
3. First run on the Mac: follow `Docs/build-ios.md`, then its first run checklist. The live camera inside the app is the most likely thing to need a fix.
4. Create the app record, then TestFlight (internal group), then real screenshots from the simulator, then the submission checklist in `AppStore/`.
5. Later: Story size that keeps the whole photo, nearby places picker, price map. See Docs.

## Not yet verified
Everything on a real phone: camera inside the app, native share sheet, safe areas, choosing a photo, how the strict page security policy behaves inside the app, look speed, VoiceOver, larger text on an iPhone, dark and light mode (the app is dark only). No tester or auditor skill run (those need the Mac); `Tests/run.js` stands in on the web build.

## Key decisions (2026-10-24)
**Product**
- Snap, tag, done. No feed, no accounts, no caption to type: the picture carries everything. No video, no map link.
- Venue is typed (no lookup). A nearby places picker is possible in the app with Apple's place search, but it needs a location permission and changes the privacy answers. Not before the first TestFlight round.
- Prices are core, but never ranked: no "dearest pub" lists. A price map is planned only as typical prices with a three report minimum (`Docs/price-map-plan.md`). Not built.
- Five looks: Stout, Lager, Pale, Last Orders, Snug. Dim photos are lifted automatically. Default size is portrait (4:5) because that is the shape phone photos arrive in.
- Free. No in-app purchases.

**Design**
- Suite look (navy, cyan, pills, glass) with amber for the price. One font: Inter, bundled and cached for offline, because the watermark is part of the picture and system fonts differ between phones.
- The golden ratio grid shows only on the live camera, never on the finished picture.

**Security and privacy**
- Strict page security policy: scripts only from the app itself, no inline code, no network except the app's own files. `Tests/run.js` checks this.
- Camera is the only permission. Privacy manifest says no tracking and no collected data. App Privacy answer: "Data Not Collected".
- Pictures are redrawn from scratch, so location data in the original photo is dropped.
- No secrets in the repo (swept 2026-10-24), 0 dependency vulnerabilities (`npm audit`). Report: `Reports/security-review-2026-10-24.md`.
- Age: the theme is alcohol. Answer the age rating honestly; the copy documents a drink and never promotes drinking more.

## Gotchas
- `www/` and `ios/App/App/public/` are generated. `npm run sync` rebuilds them. They are git-ignored.
- `ios/App/Pods` and `Podfile.lock` appear after the first `pod install` on the Mac (`brew install cocoapods` first).
- The page and the app share one code base: `index.html`, `app.css`, `app.js`. After changing them, bump the cache name in `sw.js` and rebuild the website folder with `scripts/build-site.js`.
- The Xcode project file was edited by hand to add the privacy manifest. If Xcode complains, add `ios/App/App/PrivacyInfo.xcprivacy` to the App target by dragging it in.
- `ios-app-developer` build.sh expects a plain Xcode project; this is a Capacitor workspace (`ios/App/App.xcworkspace`). Use Xcode directly or adapt the script. Untested.
- Screenshot tools need Playwright and a local server; see the headers of the files in `AppStore/tools/`.
- Put build output in /tmp, not on the Desktop or ClaudeHQ.
- Rules: no upload to TestFlight or GitHub, and no new repos or App Store Connect changes beyond what Colm asked, without his go in the current chat.
