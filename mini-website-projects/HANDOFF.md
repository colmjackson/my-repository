# Mini website projects: handoff

The DayRate extension that gives tradespeople a one page website. The folder was renamed from `small-business-sites/` to `mini-website-projects/`. The branch name and the PDF brief's header and footer still use the old name.

Written 4 November 2026, end of day one.

## What it is

A set of mobile first landing page templates for tradespeople (nine trades, four looks each), a fillable PDF brief to collect a new client's details, and notes on running it as a small service. The page gives a customer what they need on a phone: what the tradesperson does, where they work, and call and WhatsApp buttons that stay on screen.

## Where things are

| | |
| --- | --- |
| Folder | `mini-website-projects/` (the Weekly Money Planner at the repository root is untouched) |
| Branch | `claude/small-business-sites` (old name kept, because renaming a branch with an open pull request would disrupt it), based on `master` |
| Pull request | [#2](https://github.com/colmjackson/my-repository/pull/2), open, no reviews, no comments, mergeable. The repository has no CI workflows. |
| Contents | `templates/` 36 pages and a gallery, `build/` generator and sources, `brief/` the PDF form and its script, `mockups/` iPhone frame viewer and picture export, `planning/` simulation plan and cost model, `README.md` how to use it all |

## How it works

- **Templates are generated.** `python3 build/build.py` (standard library only) writes every trade and style combination to `templates/<trade>/<style>/index.html`. The output is committed so nobody has to run anything to use a page. Edit the sources, never the generated files:
  - wording for a trade: `build/trades/<trade>.json`
  - colours, corners and heading style: `build/styles/<style>.json`
  - layout for every page: `build/base.html` and `build/base.css`
  - a new trade or style: add the JSON file, then add its name to `TRADES` or `STYLES` at the top of `build.py`. The build refuses to run if a JSON file is not listed, or if a trade does not have exactly 6 services, 3 steps and 4 trust points.
- **Contrast gate.** The build checks every style in light and dark mode against WCAG AA (4.5 for text, 3 for control borders and icons) and stops on any failure.
- **A client site is a copy.** Copy a template folder to `sites/<client>/` (the `sites/` folder does not exist yet) and edit the copy. The README lists the strings to search for.
- **The enquiry form** builds a WhatsApp or email message on the visitor's phone. No server, nothing stored.
- **The brief** is `brief/client-brief.pdf`, two A4 pages, 19 form fields. Rebuild with `python3 brief/make_brief.py --return-to "..."` (needs `pip install reportlab pypdf`). Things to know:
  - The look previews on page 2 are drawn from `build/styles/*.json`, so rebuild the brief after changing a style. The style files need a `tagline` for the label under each preview.
  - The `look` field is a radio group with values `classic`, `bold`, `clean` or `warm`. Blank means no preference, and we choose.
  - `finish_pdf()` in `make_brief.py` patches two reportlab problems (missing tick font, off centre radio circles). Keep it.
  - Positions are hand set. Page 2 has little spare room, so a new question probably needs something compacted.
  - Rebuilding writes a new file even when nothing changed (reportlab stamps a creation date), so only rebuild when the content changes.

## Decisions made, and why

1. **Generator, not copies.** Nine trades by four styles would be 36 near identical 300 line files. The generated Classic plumber and electrician pages read exactly the same as the hand written versions they replaced.
2. **Four styles for every trade, so a client can choose.** Classic (navy and amber), Bold (black and yellow), Clean (pale teal), Warm (cream and green).
3. **Photos travel beside the PDF.** A PDF on a phone cannot take an image. The form asks the client to attach photos named `photo1` and `photo2` and caption them in the form. The form also says a WhatsApp message with the same answers is fine.
4. **Leaving the look blank is allowed.** We pick one to suit the trade.
5. **Fictional business names and dummy contacts** (087 000 0000, hello@example.com) so the pages double as demos.
6. **Recommended, not yet policy:** register each client's domain in the client's name, include two small changes a year, bill the plan annually up front.
7. **Do not host paying clients on GitHub Pages.** GitHub's Pages terms say it is not allowed as a free service to run your business. Fine for demos. Cloudflare Pages' free plan appears to allow commercial use but its terms were not read in full.

## Not verified

- The PDF has not been opened in Acrobat or on an iPhone. Fields were filled and rendered programmatically only.
- The pages were checked in Chromium (Playwright) only, not Safari or Firefox. All 36 pages loaded cleanly at phone and desktop widths in light and dark mode. Those scripts were throwaway and are not saved in the repository.
- The registration examples in the templates (RECI, Safe Electric, RGII, CIRI, Safe Pass) are from memory, not checked against the registers.
- The scaffolder template covers scaffolding only. Rigging and lifting are separate regulated work and are not included. Its certification wording is deliberately generic.
- The hours in `planning/simulation-and-costs.md` are estimates. Domain, Stripe and hosting figures come from web search results, and sources disagree on .ie prices.
- The "send back to" box on page 2 of the brief is empty. Fill it in and save before sharing.
- The "Website by DayRate" footer link is `#`, and the brief's header and footer say "we" and "DayRate". Both need confirming.

## Open decisions

- Your hourly rate (the cost model uses a placeholder of €40).
- How a client sees a draft: phone screenshots over WhatsApp, or a live preview link.
- Where paying clients' sites are hosted.
- Pricing: a setup fee plus a yearly or monthly plan, to be set after the simulation gives real hours.
- Does DayRate already bill customers? Is this solo, as a sole trader or a company? How many clients in year one?
- Do client sites live in this repository or in their own?
- Whether the brief should also ask for a domain name.
- Whether the client facing PDF should keep saying "DayRate small business sites" in its header and footer, or use a new name. Changing it means editing `make_brief.py` and rebuilding the PDF.

## Next steps, in order

1. Fill in the brief's return box and try the PDF on a phone.
2. Run the electrician simulation in `planning/simulation-and-costs.md`: eight stages, timing each one. It replaces the guessed hours with measured ones.
3. If building the draft (stage 3) is the slowest, consider a script that reads the returned PDF's form fields into a client file that feeds the build. Decide after measuring.
4. Trial with a real rigger or scaffolding specialist, once the simulation has fixed the broken steps. The plan is in section 3 of `planning/simulation-and-costs.md`.
5. Review and merge PR #2.
6. Candidates after that: add a `noindex` option for preview pages, save a page check script in the repository, add Safari and Firefox checks, draft simple terms and a privacy note, create the `sites/` convention.

## Not in scope so far

Finding clients, insurance, tax and VAT, terms of service, and data protection duties are listed in the cost model as costs not yet worked out. Nothing is sold, hosted or registered. No real domain has been bought.

## Session notes

- The watch on PR #2 and a one off check-in (trigger `trig_01XZNFs34BfUXAeUbEn21GjL`, due 5 November 2026 00:13 UTC) belong to the session that set them up. A new session must subscribe to the PR again.
- A stop hook in this environment asks for untracked files to be committed and pushed. Commits go to the PR branch, not `master`.
- Writing conventions: British English (`en-IE` on the pages), euro, metric, no em dashes, short paragraphs. The brief uses the same plain style.
