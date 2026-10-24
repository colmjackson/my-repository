# Wish You Were Beer: App Store submission checklist

## Ready (in this folder)
- [x] Name, subtitle, keywords, promotional text, description: `listing-en-GB.md`
- [x] Privacy policy text: `privacy-policy.md`, and the web page for it in `website/wishyouwerebeer/privacy/`
- [x] App Review notes: `review-notes.md`
- [x] Export compliance: no non-exempt encryption (set in `ios/App/App/Info.plist`)
- [x] Privacy manifest in the app (`ios/App/App/PrivacyInfo.xcprivacy`)
- [x] Camera permission text, portrait only, iPhone only

## Colm to provide
- [x] Support email: support@youknowthatsite.com
- [ ] Privacy and support pages live on youknowthatsite.com (upload `Website-upload` to Cloudflare, then check the page title with curl, because unknown paths show the home page)
- [x] Copyright line: "© 2026 You Know That Site"
- [ ] Phone number for App Review (type it straight into App Store Connect; never store it here)
- [ ] Category: Primary Photo & Video, secondary Lifestyle (suggested)
- [ ] Countries: all, or a list
- [ ] EU: the DSA trader status is declared for the account. Confirm it covers a new app.

## In App Store Connect
- [ ] Create the app record: name Wish You Were Beer, bundle ID `com.colmjackson.WishYouWereBeer`, SKU `WYWB001`, language English (U.K.)
- [ ] App Privacy: "No, we do not collect data"
- [ ] Age rating questionnaire: answer the alcohol question honestly; check the rating it gives
- [ ] Price: free
- [ ] Content Rights: no third-party content (Inter is licensed under the SIL Open Font License; licence in `fonts/OFL.txt`)
- [ ] iPhone only: untick iPad and Mac availability

## Screenshots
- [ ] iPhone 6.9" (1320 x 2868): 3 to 10 shots, from the real app in the simulator
- [ ] Use a photo of a plain glass. No other company's branding, no identifiable people, no real pub name

## Before the first TestFlight upload
- [ ] First run checklist in `Docs/build-ios.md` passes on Colm's iPhone
- [ ] `Tests/run.js` passes (28 of 28 on 2026-10-24)
- [ ] Colm says go in the current chat. Upload through Xcode Organizer.
