# Wish You Were Beer: security and privacy review (2026-10-24)

Scope: the web app (`index.html`, `app.css`, `app.js`, `sw.js`), the iPhone wrapper (`ios/`, `capacitor.config.json`), the website pages and headers. Done on the web build in a desktop browser and by reading the iPhone project. Nothing was run on a phone.

## Result
No must fix items. Open items are things to confirm on a real phone.

## What was checked

| Area | Finding | Evidence |
|---|---|---|
| Network | The app makes no network requests except for its own files | `Tests/run.js`: one host seen; `app.js` has no fetch, XHR, WebSocket or beacon |
| Script injection | Strict page policy: scripts only from the app, no inline scripts, no inline handlers, no eval | `Tests/run.js`; policy text in `index.html` |
| Dangerous calls | No `innerHTML`, `eval` or `document.write` in `app.js` | `Tests/run.js` |
| User text | The pub name and words are only ever drawn on a canvas or set as `textContent` | Reading `app.js` |
| Permissions | Camera only. No microphone (the camera request asks for video only), no location | `Info.plist`, `app.js` |
| Photo metadata | The finished picture is redrawn on a canvas, so location data in the original is dropped | By construction; worth one real photo test |
| Local storage | Four short settings, every read wrapped in try and catch with a default. No pictures are stored | `app.js` |
| Secrets | Swept tracked and new files for keys, tokens, key ids, issuer ids, team ids and passwords: none | grep sweep, 2026-10-24 |
| Dependencies | `npm audit`: 0 vulnerabilities (Capacitor 7.6, Filesystem 7.1, Share 7.0) | `npm audit` |
| Licences | Inter is OFL, licence kept at `fonts/OFL.txt`. Capacitor is MIT. No third party artwork | `fonts/`, `package.json` |
| iPhone settings | Debugging off, link previews off, iPhone only, portrait only, no encryption flag, privacy manifest (no tracking, no collected data) | `capacitor.config.json`, `Info.plist`, `PrivacyInfo.xcprivacy` |
| Website | Headers file scoped to `/wishyouwerebeer/`: no sniffing, no referrer, no framing, camera allowed only for the app page, microphone, location and payment off | `AppStore/website/_headers` |

## To confirm on a real phone
1. The strict page policy does not block Capacitor's own bridge scripts in the app (if Share fails, this is the first suspect).
2. The privacy manifest is picked up by the App target (the project file was edited by hand).
3. A real photo with location data comes out of Share with none.
4. Camera permission text reads well in the system prompt.

## Not done, on purpose
- No encryption of saved settings: they are four short, non secret preferences.
- No app lock (DayRate has one because it holds invoices; this app holds nothing).
- No network features. A price map or nearby places picker would need a new review.

## Website note from MyPrompt+
MyPrompt+'s handover lists "no website `_headers` file" as an open hardening item. This branch adds one, scoped to the new folder only, so existing pages are unchanged. Extending it to the whole site is a separate decision.
