# Wish You Were Beer

Photograph your drink, stamp it with where you are, the time and what it cost, and share it. The text is drawn into the picture, so there is nothing to type or paste afterwards. iPhone app and web version. No accounts, no server, no tracking. Free.

Status and to-do list: `HANDOVER.md`. Sign off sheet: `Docs/signoff.md`. Rules for working on it: `CLAUDE.md`.

## What it does
- **Snap:** live camera with a golden ratio grid (four dots where the eye lands), or choose a photo. The grid never appears in the finished picture.
- **Tag:** where you are, your own words (default "Wish you were beer"), and an optional price in €, £ or $. The date and time are added for you.
- **Done:** five looks (Stout, Lager, Pale, Last Orders, Snug), three sizes (portrait, square, story), then Share through the phone's share sheet.
- Dim photos are lifted automatically. Long pub names shrink, then shorten, and your own words are kept.

## Layout
| File or folder | Job |
|---|---|
| `index.html`, `app.css`, `app.js` | The whole app: page, suite styling, camera, looks, watermark, share |
| `sw.js`, `manifest.json` | Offline support and Home Screen install for the web version |
| `fonts/`, `icons/` | Inter (OFL licence in `fonts/OFL.txt`) and the app icon sizes (source `icons/icon.svg`) |
| `ios/`, `capacitor.config.json`, `package.json` | The iPhone wrapper (Capacitor 7). Generated parts are git-ignored |
| `scripts/` | `preflight.js` (`npm run check`: go or no go), `build-www.js` (web files into the app), `build-site.js` (pages into the website), `set-bundle-id.sh` |
| `Tests/run.js`, `Reports/` | 28 automated checks (security, function, accessibility) and their dated reports |
| `AppStore/` | Listing, privacy policy, review notes, submission checklist, website pages, screenshots, sample postcards, tools |
| `Design/` | Style notes, icon source, font comparison |
| `Docs/` | Workflow and release path, iPhone build steps, price map plan |

## Build
Web: `python3 -m http.server 8767`, then open `http://localhost:8767/`. iPhone: `npm install` then `npm run ios`; see `Docs/build-ios.md`. Tests: `Tests/run.js` (see `CLAUDE.md`).
