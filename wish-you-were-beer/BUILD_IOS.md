# Building the iPhone app

The app is the web page wrapped in a native iPhone shell with Capacitor. The iOS project is already generated in `ios/`, with the icon, splash screen, camera permission text, portrait only and iPhone only set. I built it on Linux, so **it has never been opened in Xcode or run on a phone.** Treat the first run as the test. The checklist at the bottom says what to look at.

## One time setup on the Mac

1. Install Xcode from the Mac App Store and open it once so it finishes installing.
2. Install Node (https://nodejs.org) and CocoaPods: `brew install cocoapods`.
3. Enrol in the Apple Developer Program (about €99 a year, VERIFY) using the Apple ID you want to own the app.

## Every build

From this folder (`wish-you-were-beer`):

```
npm install
./scripts/set-bundle-id.sh com.yourdomain.wishyouwerebeer   # first time only, use a domain you own
npm run ios
```

`npm run ios` copies the web files into the app, runs `pod install`, and opens Xcode.

In Xcode:

1. Click the blue `App` project, then the `App` target, then Signing & Capabilities. Tick Automatically manage signing and choose your Team.
2. Plug in your iPhone, trust the computer, and turn on Developer Mode if asked (Settings, Privacy & Security). Pick the phone at the top and press Run.
3. When it works on the phone, choose Any iOS Device at the top, then Product, Archive, then Distribute App, then App Store Connect, then Upload.

## App Store Connect

1. Create the app record: name Wish You Were Beer, the same bundle ID, SKU `WYWB001`, language English (U.K.).
2. Under TestFlight, add yourself and friends as internal testers. Internal testers (up to 100, from your developer team) need no review. External testers need a short beta review.
3. Fill in the listing from `launch/APP_STORE.md`, the privacy policy URL from the GitHub Pages site, and the age rating. Upload screenshots taken from the real app with real photos.

## Changing things later

- Edit the web files here (`index.html` and friends). They are the single source for both the website and the app.
- `npm run sync` copies them into the app.
- Version number: Xcode, App target, General, Version and Build. The build number must go up with every upload.

## First run checklist

Things I could not test, in order of how likely they are to need a fix:

1. **Camera.** The live viewfinder uses the browser camera inside the app. Allow the permission prompt and check the picture appears and the shutter works. If the screen stays black, say so and I will switch the capture to a native camera plugin.
2. **Share.** Take a photo, press Share, and check the sheet shows Instagram, Threads, X and Save Image, and that the picture arrives with the watermark.
3. **Top and bottom of the screen.** Check nothing hides behind the notch or home bar.
4. **Choose photo.** Pick a photo from the library and check the sheet opens and the photo loads upright.
5. **Looks.** Check switching looks is quick enough on your phone.
6. **Offline.** Turn on aeroplane mode and check the app still opens and works. It should, because everything is inside the app.

## What the app asks for

Camera only. There is no location, microphone, contacts, tracking or network use. If you add a nearby places feature later, it needs a location permission and a change to the privacy policy and the App Privacy answers.
