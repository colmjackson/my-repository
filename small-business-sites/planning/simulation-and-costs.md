# Next session: electrician simulation and year one costs

Written 4 November 2026. Figures marked "unverified" are guesses to be replaced by measured numbers from the simulation.

## 1. Simulation: one electrician, start to finish

Purpose: replace guessed hours with measured minutes, and find where the process breaks. You play an electrician submitting a request. I run the process as the operator and keep a time log.

### Before we start

- Pick a persona: a made up electrician with dummy contact details, and two phone photos of anything (a van, a fuse board, a finished job).
- Decide the return address to print in the brief (or rebuild with `--return-to`).
- Fill in `brief/client-brief.pdf` on your phone the way a real client would: skip a field, ask for something odd, leave "look" blank on one run. Try the WhatsApp message route as a second run.

### Stages and what to record

| Stage | What happens | Record |
| --- | --- | --- |
| 1 Request | You send the filled brief and photos by WhatsApp or email. | Did the PDF work on the phone. What was awkward. |
| 2 Intake check | Completeness check. Registration claims checked against the public register. Permission tick present. Look chosen, or default picked. | Items missing. Questions sent back. Minutes. |
| 3 Draft | Copy `templates/electrician/<look>/` to `sites/<client>/`. Replace content, write copy from their words, prepare photos (resize, compress, alt text). | Minutes. Which edits were find and replace and which were writing. |
| 4 Preview | The client sees the draft: phone screenshots over WhatsApp, or a live preview link. | Which was quicker and clearer. |
| 5 Revisions | You ask for three changes, including one claim that is not true. | Minutes per round. Whether the claim was caught. |
| 6 Launch (dry run) | Domain search and registration in the client's name (do not buy), hosting deploy on a free account, DNS, HTTPS, real phone tests of call, WhatsApp and the form. | Minutes. Steps that need the client's input. |
| 7 Handover | Message listing what they own, how to ask for changes, the renewal date and the price. | Minutes. |
| 8 A year later, on paper | A change request in month 6, a domain renewal in month 12, a client who stops replying. | Expected minutes for each. |

Outputs: a time log, a list of broken steps, and the cost model below with measured hours in place of guesses.

### Decisions needed

1. The hourly rate you value your time at. Below, a placeholder of €40 is used.
2. How a client sees the draft (stage 4).
3. Where paying clients' sites are hosted (see the cost section).
4. Whose name the domain is registered in. Recommended: the client's, with you as the contact, so there is no dispute over ownership.
5. A pricing hypothesis to test: a setup fee plus a yearly or monthly plan.

If stage 3 turns out to be the slowest, the likely fix is a script that reads the returned PDF's form fields (pypdf can already list them) into a client file that feeds the build. Decide after measuring, not before.

## 2. Year one cost for one client

### Assumptions (replace these)

- One electrician, one page site, their own phone photos, a new domain needed.
- Your time at €40 an hour (placeholder).
- Two small changes a year are included. Anything more is billed.
- "Early" means the first three clients with the manual process. "Later" assumes the brief feeds the build (unverified).

### Cash costs per client per year

| Item | Amount | Basis |
| --- | --- | --- |
| .ie domain | €25 to €50 a year to renew, budget €40. First year can be about €5 to €7 at some registrars. Excludes VAT. | Registrar prices vary widely. A .ie needs a proven link to Ireland. |
| Hosting | €0 | Cloudflare Pages free plan appears to allow commercial use. Confirm its terms. |
| Email forwarding, WhatsApp Business | €0 | A paid mailbox is optional and the client's cost. |
| Payment fees | About €5 to €10 a year | Stripe standard EEA cards 1.5% plus €0.25 (secondary sources), SEPA debit about €0.35 per recurring payment. Confirm on Stripe's Ireland pricing page. |
| Total | About €50 in year one, about €45 after | Mostly the domain. |

Do not use GitHub Pages for paying clients. GitHub's own Pages limits page says it is not allowed as a free web hosting service to run your online business. A brochure site is arguably outside the "commercial transactions" wording, but it is not worth depending on. Fine for demos.

### Time per client (hours, unverified until measured)

| Item | Early | Later |
| --- | --- | --- |
| Intake and chasing the client | 0.75 | 0.5 |
| Build and copy | 3.0 | 1.0 |
| Review rounds (two) | 1.0 | 0.75 |
| Domain, hosting, launch tests | 1.0 | 0.5 |
| Handover and first invoice | 0.5 | 0.25 |
| **Setup subtotal** | **6.25** | **3.0** |
| Changes (two small) | 1.0 | 1.0 |
| Client calls and questions | 1.0 | 0.5 |
| Renewal, domain and billing admin | 1.0 | 0.5 |
| Contingency (something breaks) | 1.0 | 0.5 |
| **Year of support subtotal** | **4.0** | **2.5** |
| **Year one total** | **10.25** | **5.5** |
| Later years | 4.0 | 2.5 |

### What it costs you at €40 an hour

| | Early | Later |
| --- | --- | --- |
| Year one: time | €410 | €220 |
| Year one: cash | €50 | €50 |
| **Year one cost** | **€460** | **€270** |
| Later year: time | €160 | €100 |
| Later year: cash | €45 | €45 |
| **Later year cost** | **€205** | **€145** |

Example price to test: €300 setup plus €15 a month. Year one revenue €480, later years €180.

- Early: year one margin about +€20, later years about −€25.
- Later: year one margin about +€210, later years about +€35.

The cash cost is small. The hours decide whether this makes money. Each extra support hour a year costs €40, so one client who needs 6 hours instead of 2.5 wipes out a later year's margin. To break even on later years at €40 an hour, the yearly plan has to cover about €145 to €205, which is €12 to €17 a month.

### Not in this estimate

- Finding clients. Tradespeople will not find you, and winning each one may cost more time than building the site.
- Insurance for web work (professional indemnity and public liability). Get a quote. Likely the largest unknown cash item.
- Tax, VAT registration thresholds and an accountant. Check with Revenue or an accountant.
- Unpaid invoices and lapsed domains, which take the site down.
- Terms of service: who owns the site and domain, cancellation, who is responsible for the claims on the page.
- Data protection duties from holding clients' contact details and photos.
- Your own tools (Claude, laptop, phone).

### Sources checked 4 November 2026

- .ie domain prices: OVHcloud .ie page, domainoffer.net .ie tracker (aggregators and registrars disagree, so check the registrar you would use).
- GitHub Pages limits: docs.github.com, "GitHub Pages limits".
- Cloudflare Pages limits: developers.cloudflare.com/pages/platform/limits (limits page only; terms not read in full).
- Stripe EEA pricing: support.stripe.com, "Pricing updates for businesses based in the EEA" (SEPA figure). Card rate from secondary sources.

## 3. Open questions

- Does DayRate already take payments or bill customers? If so, the payment fee line and invoicing time change.
- Are you doing this alone, and as a sole trader or a company?
- How many clients are you aiming for in year one?
- Is the hourly rate real or a placeholder?
