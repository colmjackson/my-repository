# Sign off sheet

Written 2026-10-24 night. Everything below the line "Colm confirms" needs your yes or no. Nothing has been uploaded, merged to main, or submitted.

## Ready now
- Web version and the app code, restyled in the suite look. `Tests/run.js`: 28 of 28. `npm run check`: 47 of 47 (identity, privacy manifest, permissions, icon with no transparency, listing limits, iOS 15 compatibility, no placeholders, no secrets, website links).
- Fixed overnight: the price stamp used a drawing call that needs iOS 16. The app supports iOS 15, so it would have failed there. It is now drawn with arcs, and the check catches it in future.
- Checked in Capacitor's own source: its code is injected by WebKit, not as script tags, so the strict page policy does not block it; the camera request is granted so the iPhone's normal camera prompt takes over; Share accepts picture files; the cache folder is the right place to write them.
- Website branch `claude/wishyouwerebeer` in the site repo: card, landing, privacy, support, web version, icon, headers. All its links resolve.
- Listing, privacy policy, review notes and submission checklist are in `AppStore/`.

## Colm confirms (tick or change)
1. **Name.** "Wish You Were Beer". The pun on the ITV programme title is usually tolerated for a small free app. I could not search the UK, Irish or EU trademark registers from here. Do a quick search before you submit.
2. **Subtitle.** "Postcards from the pub". Alternatives in `AppStore/listing-en-GB.md`.
3. **Age rating and copy.** Answer the alcohol question honestly in App Store Connect. The copy documents a drink and never encourages more of it.
4. **Free.** No purchases, no ads.
5. **Where the code lives.** It is in the public `my-repository`; your other apps are in private repos. Say go and I make a private `WishYouWereBeer` repo and move it.
6. **Privacy page wording** in `AppStore/privacy-policy.md` (same text is on the site).
7. **Icon.** `Design/AppIcon.svg`; preview `icons/icon-512.png`.
8. **Not blocking:** Story size (crop the sides, or keep the whole photo). Nearby places picker and price map are later.

## Morning steps, in order

**1. Website (about 10 minutes).** In the Website repo on the Mac:
```
git fetch origin
git checkout main
git merge origin/claude/wishyouwerebeer
cp -R wishyouwerebeer ../Website-upload/
cp img/wishyouwerebeer-icon.png ../Website-upload/img/
cp index.html _headers ../Website-upload/
diff -rq . ../Website-upload     # only .git and .gitignore style differences should show
```
Upload `Website-upload` to Cloudflare (Workers & Pages > Create deployment). Check by title, because unknown paths show the home page:
```
curl -s https://youknowthatsite.com/wishyouwerebeer/privacy/ | grep '<title>'
```
It should say "Wish You Were Beer Privacy Policy". Then the web version is live at `youknowthatsite.com/wishyouwerebeer/app/` for friends (Safari, Add to Home Screen).

**2. Build on the Mac (about 30 minutes if all goes well).**
```
git fetch origin && git checkout claude/wish-you-were-beer && git pull
cd wish-you-were-beer
npm install
npm run check
npm run ios
```
In Xcode choose your team under Signing and Capabilities and press Run on your iPhone. Work through the first run checklist in `Docs/build-ios.md` (camera, Share, notch, photo picker, looks, offline, VoiceOver). Tell me what breaks and I fix it.

**3. App Store Connect.** Create the app record (name, bundle ID `com.colmjackson.WishYouWereBeer`, SKU `WYWB001`). Fill the listing from `AppStore/listing-en-GB.md`, privacy "Data Not Collected", age rating, free. Upload the build through Xcode Organizer on your go. Test with friends in TestFlight (internal group).

**4. Real screenshots** from the simulator using a photo of a plain glass, then submit with `AppStore/submission-checklist.md`.

## What will probably need a fix on the first run
1. The live camera inside the app (most likely). The fix is a native camera plugin.
2. Share not opening if the strict page policy blocks something. The cause would show as "Refused to" in Safari's inspector on a Debug run.
3. The privacy manifest not attached to the App target (drag the file in).
4. Spacing around the notch or home bar.

## How fast is "quickly"
The website and the web version can be live the same morning. TestFlight can follow within the day if the first run goes well. The App Store itself depends on Apple's review, which usually takes a day or more, and a rejection adds a round. Do not promise a launch date until review finishes.
