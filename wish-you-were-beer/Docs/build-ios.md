# Building the iPhone app

The app is the web page inside a native iPhone shell (Capacitor 7). The project in `ios/` is generated and set up: bundle ID `com.colmjackson.WishYouWereBeer`, the icon, a navy splash, the camera permission text, portrait only, iPhone only, iOS 15 or later, a privacy manifest, no encryption flag, and web debugging off. I built it on Linux, so **it has never been opened in Xcode or run on a phone.** The first run is the test.

## One time on the Mac
1. Xcode installed and opened once. Node installed. `brew install cocoapods`.
2. In Xcode, Settings > Accounts, sign in with the account that owns the other apps.

## Every build
From the `wish-you-were-beer` folder:
```
npm install
npm run ios
```
`npm run ios` copies the web files into the app, runs `pod install`, and opens Xcode. Then:
1. Click the blue `App` project, then the `App` target, Signing and Capabilities. Tick Automatically manage signing and pick the paid team. Do not commit the team id.
2. Plug in the iPhone and press Run.
3. For TestFlight, on Colm's go: choose Any iOS Device, Product > Archive, Distribute App, upload through Xcode Organizer. Raise the build number each time (Target > General).

Put build output in /tmp, not on the Desktop or ClaudeHQ. The `ios-app-developer` script expects a plain Xcode project; this one is a workspace (`ios/App/App.xcworkspace`), so use Xcode directly or adapt the script (untested).

If Xcode says the privacy manifest is missing from the target, drag `ios/App/App/PrivacyInfo.xcprivacy` into the App group and tick the App target. The project file was edited by hand.

## First run checklist
Things I could not test, most likely to need a fix first:
1. **Camera.** The live viewfinder uses the browser camera inside the app. Allow the prompt and check the picture appears and the shutter works. If the screen stays black, the fix is a native camera plugin.
2. **Security policy inside the app.** The page blocks everything except its own files. If Share does nothing, look for a "Refused to" message in Safari's Web Inspector (Develop menu, with the iPhone connected; web debugging is off in release builds, so check a Debug run).
3. **Share.** Take a photo, press Share, and check the sheet shows Instagram, Threads, X and Save Image, and that the picture arrives with its watermark.
4. **Top and bottom of the screen.** Nothing hidden behind the notch or the home bar.
5. **Choose photo.** The library picker opens and the photo loads upright.
6. **Looks.** Switching looks is quick enough on the phone.
7. **Offline.** Aeroplane mode, and the app still works. It should, because everything is inside the app.
8. **Larger text and VoiceOver.** Turn on VoiceOver and check the shutter, the looks and Share are announced sensibly.

## What the app asks for
The camera only. No location, microphone, contacts, tracking or network use. A feature that needs more (nearby places, a price map) changes the privacy policy, the privacy manifest and the App Privacy answers, so stop and ask first.
