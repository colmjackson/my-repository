# Wish You Were Beer style

Same family as MyPrompt+ and DayRate: simple, solid, one clear idea per screen, pill shapes, glass panels. Dark only, because it is a camera.

## Palette
| Name | Value | Use |
|---|---|---|
| Page | `#050f18` | Background (with a soft navy glow at the top) |
| Tile | `#053b5e` | Buttons |
| Tile selected | `#1c6194` | Chosen look, chosen size |
| Cyan | `#3fc6ff` | Active outline, grid dots, links, focus ring |
| Cyan deep | `#006da3` | Filled button (Share), white label for 4.5:1 |
| Hi-vis amber | `#ffc400` | The price stamp, the word "beer", the icon pint |
| Navy | `#1b3a57` | Text on amber |
| Ink / muted | `#eef4f8` / `#b4c5d2` | Text (lowest measured contrast 5.65:1) |

The web palette is the same as youknowthatsite.com (dark mode), so the app and the site look like one family.

## Shapes and size
- Buttons, chips, inputs and size options are pills, at least 44 pt tall.
- Panels and the picture frame are rounded (22 px) glass: translucent navy, a blur behind, a faint top highlight.
- The shutter is a white disc with a cyan ring.

## Type
Inter, weights 400 and 600, bundled. One typeface for the interface and the watermark. Sizes are in rem so they follow the reader's text size (tested to 200% at 320 px wide).

## The watermark (on the picture)
- Bottom left: the pub, then your words, in white semibold, with the date and time under it in regular.
- Bottom right: the price as an amber pill with navy text.
- A soft dark fade behind the text so it reads on bright photos. Stories keep extra room at the bottom for the reply bar.
- Long text shrinks first; then the pub name is shortened and your words are kept.

## Looks
Stout (deep contrast, dark vignette), Lager (bright, golden), Pale (soft, faded), Last Orders (black and white, grain), Snug (warm, candlelit). All drawn per pixel on the canvas, because iOS Safari lacks canvas filters. Dim photos are lifted first.

## Icon
Navy rounded square, one solid amber pint with a cream head and a soft highlight, a faint glow at the top. Source `AppIcon.svg`. The iPhone icon is full bleed; the system rounds it. Original artwork only.

## Not used
Serif italic headings and the brown and cream palette from the first prototype, replaced to match the suite. `font-options.png` shows Inter against DM Sans and Space Grotesk.
