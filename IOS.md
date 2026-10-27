# iPhone app: Mac handover

The web page stays the source of truth. `npm run build` copies it into `www/`, and Capacitor wraps `www/` in a native iPhone app. Nothing is rewritten in Swift.

## What is already in the repo

- `capacitor.config.json`: app name "Money Planner", bundle ID `com.colmjackson.weeklymoneyplanner` (change it before step 3 if you want a different one).
- `fonts/`: fonts bundled locally, so the app works with no signal (the page used to load them from Google).
- `resources/icon.png`: 1024 px app icon. Placeholder (white € on the app's teal). Swap in a better one any time and re-run step 2.
- Safe area padding in `index.html` for the notch and home bar.
- `manifest.webmanifest`, `sw.js`, `icons/`: home screen web app with offline support, used by the GitHub Pages version.
- `scripts/`: build and setup scripts.

## What only your Mac can do

You need: a Mac with Xcode (App Store, free), Node 20 or newer, and an Apple Developer Program membership (about €99 a year, developer.apple.com/programs). The membership is required for TestFlight and the App Store. Running on your own iPhone from Xcode works with a free Apple ID, but the app expires after 7 days.

1. Pull this branch: `git fetch && git checkout claude/ios-app-capacitor`
2. Run `npm run ios:setup`. This installs packages, creates the `ios/` Xcode project, generates all icon sizes and copies the web files in.
3. Run `npm run ios:open`. In Xcode, click the **App** project, then **Signing & Capabilities**. Tick "Automatically manage signing", pick your Team, and check the Bundle Identifier.
4. Pick your iPhone (or a simulator) at the top and press Run. Check: figures save after quitting the app, nothing hides under the notch, airplane mode still works.
5. Under **General**, set Display Name "Money Planner", Version 1.0, Build 1. Set Device Orientation to Portrait only if you want it locked.
6. **Product > Archive**, then **Distribute App > App Store Connect > Upload**.
7. In App Store Connect (appstoreconnect.apple.com): create the app record with the same bundle ID. Use TestFlight to try it on your phone first. For release, add screenshots (6.9 inch iPhone is required), a description, a privacy policy URL, and answer the privacy questions with "Data not collected". Then submit for review.

After any web change: `npm run ios:sync`, raise the Build number in Xcode, archive and upload again.

## Review risk to know about

Apple rejects apps that are "just a website in a wrapper" (guideline 4.2). This one runs entirely on the device, works offline and saves data locally, which helps, but it is a thin app. Keep the description specific, and the review notes can say it needs no login and works offline. If you want the less risky extras, a native share or reminder feature would strengthen it.

## Known limits

- Data lives in the web view's local storage. It survives normal use and app updates. Deleting the app deletes the figures. iOS can, rarely, clear web storage for apps under heavy storage pressure. If that matters, the fix is adding the Capacitor Preferences plugin later.
- There is no `ios/` folder in the repo yet. It is created on your Mac in step 2 and is safe to commit afterwards.

## No App Store: home screen web app

With GitHub Pages on, open the page in Safari on the iPhone, tap Share, then **Add to Home Screen**. It gets the icon and name, opens full screen and works offline. No account or fee.
