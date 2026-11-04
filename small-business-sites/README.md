# Small business sites

A DayRate extension that gives tradespeople a professional one page website: what they do, where they work and how to reach them.

## Who it is for

Self employed tradespeople and very small firms (plumbers, electricians, joiners, painters, tilers, landscapers) who have no website, or only a Facebook page. Their customers find them on a phone, so the page is built for a thumb: a call button and a WhatsApp button stay on screen the whole time.

## What is here

- `template/index.html`: the plumber landing page. One file, no build step, no dependencies, no external requests. It uses a fictional business ("Sample Plumbing & Heating") so it also works as a demo to show prospects.
- `template-electrician/index.html`: the same page for electricians ("Sample Electrical"). Only the text and the structured data type differ from the plumber version; layout, styles and form script are identical.

## Making a site for a client

1. Copy the closest trade template (`template/` or `template-electrician/`) to `sites/<client-name>/`.
2. Replace the sample content. Search for these strings to find everything:
   - `Sample Plumbing` or `Sample Electrical`, `Sample Town`, `Example Village`, `Placeholder Bridge`
   - `087 000 0000` and `353870000000` (phone, `tel:` links, WhatsApp links)
   - `hello@example.com` (email, appears in the page, the form script and the structured data)
   - `<!-- EDIT` comments, which mark every judgement call
3. For a trade with no template yet, change the trade in the page title, description, headline, service cards, the "how it works" text and the `"@type"` in the structured data (`HousePainter`, `GeneralContractor` and so on).
4. Open it on a phone before sending it to the client.

## What to collect from the tradesperson

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
- No invented reviews or testimonials. Add real ones, with permission, or leave the section out.
- The enquiry form does not post anywhere. It builds a WhatsApp or email message on the visitor's own phone, so there is no server and no personal data to store or secure.

## Hosting

The output is static files, so any static host works. GitHub Pages serves this folder from `/small-business-sites/template/` with no setup. For a client on their own domain, point the domain at a static host and set the canonical link in `index.html`.

## Not decided yet

- The DayRate link in the footer is `#` until the address is settled.
- Pricing and how clients pay.
- Whether each client site lives in this repository or in its own.
