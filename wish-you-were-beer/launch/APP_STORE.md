# App Store listing draft

Everything here is a draft for your review. Character counts are checked. Items marked VERIFY are things I could not confirm from this environment (the network policy blocks apple.com), so check them in App Store Connect before relying on them.

## Identifiers

| Item | Value | Notes |
| --- | --- | --- |
| App name | Wish You Were Beer | 18 of 30 characters |
| Bundle ID | `com.YOURDOMAIN.wishyouwerebeer` | Placeholder. Use a reverse domain you own. It cannot be changed once the app is created. |
| SKU | `WYWB001` | Internal label for you, any unique string. |
| Apple ID (the number in the store URL) | Assigned by Apple | Cannot be prepared. It appears when you create the app record in App Store Connect. |
| Team ID | From your developer account | Needed for signing. |
| Developer Program | About €99 a year | VERIFY current price and whether you enrol as an individual or a company. |
| Primary language | English (U.K.) | Matches the spelling used in the copy. VERIFY an Irish English option. |
| Primary category | Photo & Video | |
| Secondary category | Lifestyle | Food & Drink is a poor fit because the app does not sell or review drinks. |
| Support URL | Needed | A simple page or the GitHub Pages site will do. |
| Support email | Needed | Use a dedicated address, not your personal one. |
| Privacy policy URL | Needed | Draft in `PRIVACY.md`. |

## Name, subtitle and keywords

Name: **Wish You Were Beer** (18)

Subtitle: **Postcards from the pub** (22)

Subtitle alternatives, in order of preference: "Pint photos with the price" (26), "Your pint, stamped and sent" (27).

Promotional text (138 of 170): 

> Photograph your pint. Add where you are, the time and what it cost. Pick a look, then send the postcard to whoever should have been there.

Keywords (95 of 100):

```
pint,watermark,photo,camera,drink,price,bar,filter,stamp,stout,lager,cider,wine,cocktail,cheers
```

Notes on the keywords. Apple indexes the name and subtitle already, so "beer", "pub" and "postcard" are left out to save space. Brand names of drinks are left out on purpose because stores reject keywords that use someone else's trademark.

## Taglines

My pick for the headline line is **Wish you were beer.** Other options, none of which borrow from the app that inspired the look:

1. Postcards from the pub.
2. Proof of pint.
3. The pint, the place, the price.
4. Cheers from here.
5. Wish you were here. Wish you were buying.
6. Stamped, timed and priced.
7. Your round, on the record.
8. Sláinte from somewhere.

Lines 5 and 7 are the cheekiest. Keep lines that celebrate volume (rounds piling up, getting hammered) out of store copy. Stores look at that, and it works against the tone you described.

## Description

> Wish you were beer. Photograph your pint, stamp it with where you are, the time and what it cost, and send it to the friend who should have been there.
>
> Take the photo in the app or choose one from your camera roll. A golden ratio grid shows where the glass should sit, so even a shaky pub snap ends up looking composed.
>
> WHAT IT DOES
> Where: type the pub or town. Add your own line after it, or keep the default.
> When: the date and time are added for you.
> How much: add the price as a stamp in the corner, in € or £. Irish pints deserve a record.
> Five looks: Stout, Lager, Pale, Last Orders and Snug.
> Three sizes: square, portrait and story.
> Share: send it to Instagram, Threads, X, WhatsApp or anywhere else on your phone.
>
> PRIVATE BY DEFAULT
> There is no account to make. Your photos stay on your phone until you choose to share them. The location text is only what you type.
>
> FOR ADULTS
> Wish You Were Beer is for people of legal drinking age. Drink responsibly.

It works for wine or whatever else is in your hand, and the description says so only through the word "drink" in the keywords. If you want the copy to name wine and cocktails, add a line under WHAT IT DOES.

## Age rating

The app's whole theme is alcohol, so answer the alcohol question in the age rating questionnaire honestly. Expect a high rating. Apple revised its rating scale recently, so VERIFY what the questionnaire offers now and what your answers produce. The legal drinking age is 18 in Ireland and the UK, so a rating of 18 or close to it matches your audience.

## Notes for the App Review team

Suggested text for the review notes field:

> Wish You Were Beer is a camera and sharing tool. Users photograph a drink, add a venue name, the time and an optional price as text on the image, apply one of five colour looks, and share the result through the system share sheet. The app does not sell, deliver or advertise alcohol, does not connect to any brand, and has no accounts, feed, ads or purchases other than the one time price, if any. The app is intended for adults of legal drinking age.

## Stores often reject these, so check them

1. **Alcohol content.** Guideline text covers apps that encourage excessive consumption. VERIFY the current wording under the safety guidelines. The copy above keeps to documenting a drink, not drinking more of it.
2. **Thin web wrappers.** An app that is only a website in a frame risks rejection for minimum functionality. See `WORKFLOW.md` for how I would add native camera and share features to avoid that.
3. **Name and trademark.** "Wish You Were Here" is the title of an ITV programme and a well known album. A pun is usually tolerated for a small free app, and it is a bigger risk if you charge for it. Search the UK, Irish and EU trademark registers for "Wish You Were Beer" before you commit. I could not run that search here.
4. **Screenshots.** Apple wants screenshots that show the real app in use. The ones in `framed/` use an illustrated pint as a stand in. Replace them with real photos before you submit, and choose photos with no other company's branding and no identifiable people. Photos like the Guinness glass or the Super Bock mug put someone else's trademark in your store images, and a footballer on a TV screen brings in a person's likeness and competition logos. A plain glass on a table, or your own drink with the labels turned away, is safer.
5. **Using a real pub name.** The screenshots use an invented pub, "The Gilded Hop, Cork". Keep it that way in store images.

## Pricing

Decided: the app is free. The table below is kept for the record.

| Option | For | Against |
| --- | --- | --- |
| Free | Easy to spread among friends, no friction | No income, and you carry any server cost yourself |
| One off, about €1.99 | Fits the "no subscriptions, no ads" posture, filters out casual downloads | Fewer people try it |
| Free with a paid pack of looks | Familiar model | More to build, and it adds purchase review work |

Free means no income, so keep running costs at zero. Nothing in the app calls a paid service or a server. A venue lookup through the Google Places API is not free at scale (VERIFY the current pricing), so I have not used it.
