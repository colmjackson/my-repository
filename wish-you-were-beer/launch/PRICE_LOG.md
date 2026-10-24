# Anonymous price log (plan, not built)

This is the one feature that needs a server. I have prepared the design and the database definition. I have not built it, because it needs an account with a hosting service that I cannot create, and because it changes the privacy position of the app.

## What it would do

When someone shares a postcard with a price on it, the app could also send one anonymous record: the venue, the price, the date. Over time that becomes a map of what a pint costs in each pub, which is the part of the idea that grows with more users. The postcards are a joke people share once. A price map is something strangers use.

## A tension to settle first

You have said you want the app to promote two things: the places and the prices. I accept that prices are core, and the price already travels with every card people share. The risk is narrower than I first put it. A public map that sorts pubs by how dear they are turns the joke into a ranking of the most expensive places, which works against the venue. A map that simply shows what a pint typically costs in each place, with no ranking and no "dearest" list, is a service. Keep it to that, and keep the minimum of three reports.

## Rules I would keep

1. **Opt in, off by default.** A switch labelled "Add this price to the pint price map", with one line saying what is sent.
2. **No account, no device ID, no IP address stored, no coordinates.** Venue text only.
3. **Day precision only.** Store the date, not the time, so a record cannot be matched to one person's evening.
4. **No photo ever leaves the phone.**
5. **Publish only medians.** Show a pub's price only once at least three separate reports exist, so a single prank entry or a single person cannot be traced.

## Database definition (Postgres, written for Supabase)

VERIFY this against the current Supabase behaviour before using it. In particular, check that the public view can be read by the anonymous role while the table itself cannot.

```sql
create table price_reports (
  id uuid primary key default gen_random_uuid(),
  venue text not null check (char_length(venue) between 2 and 80),
  town text check (char_length(town) <= 60),
  country char(2) not null,
  currency char(3) not null check (currency in ('EUR', 'GBP')),
  price_cents integer not null check (price_cents between 100 and 3000),
  drink text not null default 'pint'
    check (drink in ('pint', 'half', 'bottle', 'wine', 'spirit', 'other')),
  reported_on date not null default current_date
);

alter table price_reports enable row level security;

-- Anyone may add a report. Nobody may read or change the raw table.
create policy "add a report" on price_reports
  for insert to anon with check (true);

-- Public read access to medians only, and only where three or more reports exist.
create view venue_prices as
  select venue, town, country, currency, drink,
         count(*) as reports,
         percentile_cont(0.5) within group (order by price_cents) as median_cents,
         max(reported_on) as last_reported
  from price_reports
  group by venue, town, country, currency, drink
  having count(*) >= 3;

grant select on venue_prices to anon;
```

## What the app needs first

The app does not yet ask what the drink is, and the venue is free text, so "Mulligans", "Mulligan's" and "Mulligan's, Dublin" would count as three pubs. Before this feature is useful, the app needs a drink type picker and a venue lookup that gives one agreed name per pub (OpenStreetMap data is free and is my suggestion, but a lookup needs the network and a small amount of server work). VERIFY coverage of Irish pubs in OpenStreetMap before relying on it.

## Costs and risks

| Risk | Plan |
| --- | --- |
| Junk or prank entries | Three report minimum, price limits in the table, one entry per venue per device per day if you add a light check |
| Venue name spelling | Lookup against one list, as above |
| Privacy label and policy | The "no data collected" claim is gone once this ships. Update `PRIVACY.md` and the App Store label |
| Moderation | Medians only, no free text published, so there is little to moderate |
| Running cost | Small at friend scale. Check the hosting provider's free tier limits |
| Encouraging drinking | No counters, streaks or rankings of people. Only prices of places |

## My recommendation

Not in the first release. Put the web version and TestFlight build in front of friends, and add the price log only if they ask where the prices are going. If you decide to build it, that is a separate piece of work after Stage 1 in `WORKFLOW.md`.
