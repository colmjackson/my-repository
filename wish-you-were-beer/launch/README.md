# Launch pack

Prepared overnight for your review. Nothing here is submitted or published anywhere.

| File or folder | What it is |
| --- | --- |
| `APP_STORE.md` | Listing copy, identifiers, keywords, taglines, age rating notes, review notes, pricing options |
| `WORKFLOW.md` | The in app flow, the screens, and the release path from friends to TestFlight to the App Store |
| `PRIVACY.md` | Draft privacy policy |
| `PRICE_LOG.md` | Plan and database definition for the anonymous price log. Not built |
| `screenshots/` | Raw screens at 1290 by 2796, the 6.7 inch iPhone size. VERIFY the sizes Apple asks for now |
| `framed/` | The same screens with a headline, at the same size |
| `samples/` | The actual exported postcard in each of the five looks |
| `assets/` | The illustrated pint used as the demo photo |
| `tools/` | Scripts that regenerate the screenshots |

I also ran four of your real drink photos through every look to test the app. Those stay out of the repository on purpose, because they carry other companies' branding and one shows a footballer and tournament logos. What the test showed is in the notes in `WORKFLOW.md`.

The pint in every image is an illustration standing in for a real photo, and the pub, "The Gilded Hop, Cork", is invented. Replace them with real photos before you submit anything to Apple.

## Decided

Free. No video. No map link and no caption: the picture carries everything. One font, Inter, everywhere (`font-options.png` shows the alternatives).

## Still open

1. **Story size.** A 9:16 Story crops about a quarter off the sides of a normal phone photo. Keep the crop, or keep the whole photo on a blurred backdrop? I recommend keeping the whole photo.
2. **Name.** The trademark search for "Wish You Were Beer" is still to do, and I could not do it from here.
3. **Bundle ID.** Which domain do you own?
4. **Mac.** You have one working, so the TestFlight stage is possible. It needs Xcode and a developer account.
5. **Taglines.** Pick from the list in `APP_STORE.md`.
6. **Price map.** Still unbuilt. See `PRICE_LOG.md`.

## Regenerating the screenshots

Needs Node and Playwright. From the `wish-you-were-beer` folder, serve it with `python3 -m http.server 8767`, then run `node launch/tools/screenshots.js "$PWD"` and `node launch/tools/frame.js "$PWD"`.
