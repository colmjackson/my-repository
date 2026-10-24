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

## Decisions for the morning

1. **Distribution.** Friends on the web version first, then TestFlight, then the App Store (my recommendation), or straight to the App Store.
2. **Price log.** You said yes to the idea, but it is the one thing that changes the privacy position and needs a server. I recommend building it after TestFlight, switched off by default. Do you want it earlier?
3. **Name.** Keep "Wish You Were Beer"? The trademark search is still to do, and I could not do it from here.
4. **Pricing.** Decided: free. See the note in `APP_STORE.md` on keeping running costs at zero.
5. **Bundle ID.** Which domain do you own?
6. **Mac.** Do you have one for Xcode? It decides how Stage 1 works.
7. **Taglines.** Pick from the list in `APP_STORE.md`.
8. **Share.** I never saw that app's share screen, so Share is still the plain phone share sheet. Send a screenshot of the one you like.

## Regenerating the screenshots

Needs Node and Playwright. From the `wish-you-were-beer` folder, serve it with `python3 -m http.server 8767`, then run `node launch/tools/screenshots.js "$PWD"` and `node launch/tools/frame.js "$PWD"`.
