# Mini website projects

A DayRate extension that gives tradespeople a professional one page website: what they do, where they work and how to reach them.

## Who it is for

Self employed tradespeople and very small firms (plumbers, electricians, joiners, painters, tilers, landscapers, roofers, builders, scaffolders) who have no website, or only a Facebook page. Their customers find them on a phone, so the page is built for a thumb: a call button and a WhatsApp button stay on screen the whole time.

## What is here

- `templates/`: the finished pages, one for every trade in every style, at `templates/<trade>/<style>/index.html`. Open `templates/index.html` for a gallery that links to all 36. Each page is one file with no external requests. They use a fictional business (for example "Sample Joinery") so they also work as demos to show prospects.
- `build/`: the sources and the generator that produces `templates/`. See "Changing the templates".
- `brief/client-brief.pdf`: a two page fillable form to send to a new client. It collects their name, business, contact details, areas, a short intro, what they want the page to do, the jobs they want more of, which of the four looks they prefer (with a small preview of each), a caption for each of one or two photos, and permission to use their details and photos. `brief/make_brief.py` rebuilds it (`pip install reportlab pypdf`).
- `mockups/`: `phones.html` shows any template inside iPhone frames (open it in a browser; the comment at the top lists the address options), and `make_mockups.js` exports pictures from it (`npm i playwright`, then `node make_mockups.js`). The pictures are not committed.
- `planning/`: the simulation plan and the year one cost model.
- `HANDOFF.md`: where the project stands, decisions made, what is unverified and the next steps. Start here when picking the project up cold.

**Trades:** plumber, electrician, carpenter and joiner, painter and decorator, tiler, landscaper and gardener, roofer, builder, scaffolder.

**Styles:** every trade comes in the same four looks, so a client can pick one the way they would pick an invoice template.

- Classic: navy and amber. Familiar, steady and trustworthy.
- Bold: black and safety yellow with heavy capitals and square corners. Loud and practical, like a van sign.
- Clean: light, airy and modern with a teal accent and rounded buttons. Suits a tidy, premium feel.
- Warm: cream and forest green with serif headings. Friendly, like a family firm that has been around for years.

All four follow the phone's light or dark setting, and every colour pair in every style passes WCAG AA contrast in both modes. The build refuses to run if a style fails.

## Choosing a style with a client

The brief asks the client to tick one of the four looks, with a small preview of each. The previews are only a rough picture, so for a client who wants to see more, send the links to their trade's pages from the gallery or open two or three on your phone together. If they leave the question blank, pick the style that suits their trade and show them the result. The previews are drawn from `build/styles/*.json`, so rebuild the brief after changing a style.

## Sending the brief

1. Open `brief/client-brief.pdf`, type where you want it sent back into the box on page 2 and save. Or rebuild it with `python3 brief/make_brief.py --return-to "your email or WhatsApp number"`.
2. Send it to the client by WhatsApp or email.
3. They fill it in and send it back with one or two photos attached. Photos cannot be dropped into a PDF on a phone, so they travel alongside it, named `photo1` and `photo2` to match the captions in the form.

Many tradespeople will find a PDF awkward on a phone. The form says they can answer the same questions in a WhatsApp message instead, so take either.

## Making a site for a client

1. Copy the chosen `templates/<trade>/<style>/` folder to `sites/<client-name>/`.
2. Replace the sample content in the copy. Search for these strings to find everything:
   - the sample business name (it starts with `Sample`, for example `Sample Joinery`), `Sample Town`, `Example Village`, `Placeholder Bridge`
   - `087 000 0000` and `353870000000` (phone, `tel:` links, WhatsApp links)
   - `hello@example.com` (email, appears in the page, the form script and the structured data)
   - `<!-- EDIT` comments, which mark every judgement call
3. Rewrite the service cards in the client's own words and delete any claim they cannot back up.
4. Open it on a phone before sending it to the client.

Edit the copy, not the file in `templates/`. The next build overwrites `templates/`.

## Changing the templates

Edit the sources, then run `python3 build/build.py` (standard library only, no installs). Commit the rebuilt `templates/` folder with the change, so the pages stay usable without running anything.

- Wording for a trade: `build/trades/<trade>.json`.
- Colours, corners and heading style for a look: `build/styles/<style>.json`.
- Layout, shared by every page: `build/base.html` and `build/base.css`.
- A new trade or style: add a JSON file and add its name to `TRADES` or `STYLES` at the top of `build/build.py`.

## What to collect from the tradesperson

The brief covers most of this. The domain name is not on it, so ask separately.

- Business name and trade
- Phone number, WhatsApp number (if different), email
- Towns and areas covered
- Five or six services, in their own words
- Opening hours, and whether they take emergency call outs
- Real registrations and insurance (only list what they can show)
- A genuine photo of them or their work, if they have one
- A domain name, if they already own one

## Rules for the content

- Claims on the page must be true. "Fully insured", "free quotes" and "same day callbacks" stay only if the business does them.
- Registrations named in the templates (RECI, Safe Electric, RGII, CIRI, Safe Pass) are examples from memory, not checked against the registers. Confirm each one before it goes near a client page.
- No invented reviews or testimonials. Add real ones, with permission, or leave the section out.
- The enquiry form does not post anywhere. It builds a WhatsApp or email message on the visitor's own phone, so there is no server and no personal data to store or secure.

## Hosting

The output is static files, so any static host works. GitHub Pages serves the templates from `/mini-website-projects/templates/` with no setup, which is fine for demos. Do not host paying clients there: GitHub's Pages terms say it is not allowed as a free service to run your online business. Use a host whose free plan allows commercial sites (Cloudflare Pages appears to, but confirm its terms). For a client on their own domain, point the domain at that host and set the canonical link in `index.html`.

Planning notes, including the year one cost model, are in `planning/simulation-and-costs.md`.

## Not decided yet

- The DayRate link in the footer is `#` until the address is settled.
- Pricing and how clients pay.
- Whether each client site lives in this repository or in its own.
