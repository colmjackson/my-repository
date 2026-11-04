#!/usr/bin/env python3
"""Builds every trade and style combination into ../templates/<trade>/<style>/index.html.

    python3 build.py

Standard library only. The output is plain static HTML, committed to the repository, so
nobody needs to run this just to look at or use a template. Run it after changing
base.html, base.css, a trade in trades/ or a style in styles/.

Each page is one file with no external requests. Before writing anything the build checks
the colour contrast of every style in light and dark mode and stops if any pair fails.
"""
import html
import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "templates"

TRADES = ["plumber", "electrician", "carpenter", "painter", "tiler", "landscaper", "roofer", "builder"]
STYLES = ["classic", "bold", "clean", "warm"]

TRADE_KEYS = {"label", "business", "schema_type", "headline", "lead", "meta_services", "trust",
              "services", "steps", "credentials_hint", "trade_note", "emergency"}
TOKEN_KEYS = {"bg", "paper", "ink", "muted", "line", "edge", "brand", "brand_ink",
              "accent", "accent_ink", "link", "wa", "wa_ink"}
SHAPE_KEYS = {"body_font", "h_font", "h_weight", "h_transform", "h_tracking", "h1_size",
              "r_card", "r_btn", "r_input", "r_pill", "bw"}

# (text colour, background, minimum ratio). 4.5 is WCAG AA for text, 3 for control borders and icons.
CONTRAST = [
    ("ink", "bg", 4.5), ("ink", "paper", 4.5), ("muted", "bg", 4.5), ("muted", "paper", 4.5),
    ("link", "bg", 4.5), ("link", "paper", 4.5), ("accent_ink", "accent", 4.5), ("wa_ink", "wa", 4.5),
    ("brand_ink", "brand", 4.5), ("accent", "brand", 4.5),
    ("wa", "paper", 3.0), ("edge", "bg", 3.0), ("edge", "paper", 3.0),
]


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def luminance(hexcolour):
    h = hexcolour.lstrip("#")
    chans = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255
        chans.append(c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * chans[0] + 0.7152 * chans[1] + 0.0722 * chans[2]


def ratio(a, b):
    hi, lo = sorted((luminance(a), luminance(b)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def check_style(slug, style):
    problems = []
    if set(style["shape"]) != SHAPE_KEYS:
        problems.append(f"{slug}: shape keys differ from {sorted(SHAPE_KEYS)}")
    for mode in ("light", "dark"):
        tokens = style[mode]
        if set(tokens) != TOKEN_KEYS:
            problems.append(f"{slug} {mode}: colour keys differ from {sorted(TOKEN_KEYS)}")
            continue
        for fg, bg, minimum in CONTRAST:
            r = ratio(tokens[fg], tokens[bg])
            if r < minimum:
                problems.append(f"{slug} {mode}: {fg} {tokens[fg]} on {bg} {tokens[bg]} is {r:.2f}, needs {minimum}")
    return problems


def check_trade(slug, trade):
    problems = []
    if set(trade) != TRADE_KEYS:
        problems.append(f"{slug}: keys differ from {sorted(TRADE_KEYS)}")
    else:
        if len(trade["services"]) != 6:
            problems.append(f"{slug}: needs exactly 6 services")
        if len(trade["steps"]) != 3:
            problems.append(f"{slug}: needs exactly 3 steps")
        if len(trade["trust"]) != 4:
            problems.append(f"{slug}: needs exactly 4 trust points")
        for field in ("credentials_hint", "trade_note", "emergency"):
            if trade[field] and "--" in trade[field]:
                problems.append(f"{slug}: {field} contains '--', which would break an HTML comment")
    return problems


def tokens_css(style):
    def block(values):
        return "".join(f"  --{k.replace('_', '-')}: {v};\n" for k, v in values.items())
    css = ":root {\n" + block(style["shape"]) + block(style["light"]) + "}\n"
    css += "@media (prefers-color-scheme: dark) {\n  :root {\n"
    css += "".join(f"    --{k.replace('_', '-')}: {v};\n" for k, v in style["dark"].items())
    css += "    color-scheme: dark;\n  }\n}\n"
    return css


def esc(text):
    return html.escape(text, quote=False)


def esc_attr(text):
    return html.escape(text, quote=True)


def fill(template, values):
    def sub(m):
        key = m.group(1)
        if key not in values:
            sys.exit(f"template placeholder {{{{{key}}}}} has no value")
        return values[key]
    return re.sub(r"\{\{(\w+)\}\}", sub, template)


def json_in_script(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False).replace("</", "<\\/")


def render_page(base_html, base_css, trade_slug, trade, style_slug, style):
    name = trade["business"]
    noun = trade["label"][0].lower() + trade["label"][1:]
    title = f"{name} | {trade['label']} in Sample Town"
    schema = {
        "@context": "https://schema.org",
        "@type": trade["schema_type"],
        "name": name,
        "telephone": "+353870000000",
        "email": "hello@example.com",
        "areaServed": ["Sample Town", "Example Village", "Placeholder Bridge"],
        "openingHours": "Mo-Fr 08:00-18:00",
    }
    css = tokens_css(style) + base_css
    if style["extra_css"]:
        css += "\n/* Style: " + style["label"] + " */\n" + "\n".join(style["extra_css"]) + "\n"

    values = {
        "trade_slug": trade_slug,
        "style_slug": style_slug,
        "style_label": style["label"],
        "title": esc(title),
        "description": esc_attr(
            f"Local {noun} in Sample Town and nearby. {trade['meta_services']} Free quotes. Call or WhatsApp 087 000 0000."),
        "og_description": esc_attr(f"Local {noun} in Sample Town and nearby. Free quotes. Call or WhatsApp 087 000 0000."),
        "jsonld": json_in_script(schema),
        "css": css.rstrip("\n"),
        "business": esc(name),
        "business_js": json.dumps(name).replace("</", "<\\/"),
        "label": esc(trade["label"]),
        "headline": esc(trade["headline"]),
        "lead": esc(trade["lead"]),
        "trust_html": "\n".join(f"      <li>{esc(t)}</li>" for t in trade["trust"]),
        "services_html": "\n".join(
            f'      <li class="card"><h3>{esc(t)}</h3><p>{esc(x)}</p></li>' for t, x in trade["services"]),
        "steps_html": "\n".join(
            f'        <li class="card"><h3>{esc(t)}</h3><p>{esc(x)}</p></li>' for t, x in trade["steps"]),
        "trade_note": f"    <!-- EDIT: {trade['trade_note']} -->\n" if trade["trade_note"] else "",
        "credentials_hint": trade["credentials_hint"],
        "emergency_html": f'        <p class="note">{esc(trade["emergency"])}</p>\n' if trade["emergency"] else "",
        "year": str(date.today().year),
    }
    return fill(base_html, values)


GALLERY_CSS = """
:root { --bg:#f6f7f8; --paper:#fff; --ink:#111c26; --muted:#41505c; --line:#c9d1d6; --link:#0a58a8; }
@media (prefers-color-scheme: dark) { :root { --bg:#0b1218; --paper:#131d26; --ink:#f1f5f8; --muted:#b4c1cb; --line:#35454f; --link:#8ccbff; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--ink); font: 1.0625rem/1.6 system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif; }
main { max-width: 62rem; margin: 0 auto; padding: 2rem 16px 4rem; display: grid; gap: 1.5rem; }
h1 { margin: 0; font-size: 2rem; line-height: 1.2; }
h2 { margin: 0 0 .25rem; font-size: 1.15rem; }
p { margin: 0; color: var(--muted); }
.styles, .trades { list-style: none; margin: 0; padding: 0; display: grid; gap: .75rem; }
.styles { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.styles li, .trades li { background: var(--paper); border: 2px solid var(--line); border-radius: 12px; padding: 1rem; }
.trades li { display: grid; gap: .5rem; }
.links { display: flex; flex-wrap: wrap; gap: .5rem 1.25rem; font-weight: 700; }
a { color: var(--link); }
"""


def render_gallery(styles, trades):
    out = ["<!doctype html>", '<html lang="en-IE">', "<head>", '<meta charset="utf-8">',
           '<meta name="viewport" content="width=device-width, initial-scale=1">',
           "<title>Template gallery</title>", f"<style>{GALLERY_CSS}</style>", "</head>", "<body>", "<main>",
           "<h1>Template gallery</h1>",
           "<p>Every trade in every style. Sample content only. Open a few with a client, let them pick, "
           "then copy that folder to start their site. Generated by build/build.py.</p>",
           "<section><h2>The four styles</h2><ul class=\"styles\">"]
    for s in STYLES:
        out.append(f"<li><strong>{esc(styles[s]['label'])}</strong><br>{esc(styles[s]['blurb'])}</li>")
    out.append("</ul></section><section><h2>Trades</h2><ul class=\"trades\">")
    for t in TRADES:
        links = " ".join(f'<a href="{t}/{s}/index.html">{esc(styles[s]["label"])}</a>' for s in STYLES)
        out.append(f'<li><strong>{esc(trades[t]["label"])}</strong><span class="links">{links}</span></li>')
    out.append("</ul></section></main></body></html>")
    return "\n".join(out) + "\n"


def main():
    styles = {s: load(HERE / "styles" / f"{s}.json") for s in STYLES}
    trades = {t: load(HERE / "trades" / f"{t}.json") for t in TRADES}

    on_disk = {p.stem for p in (HERE / "styles").glob("*.json")} - set(STYLES)
    on_disk |= {p.stem for p in (HERE / "trades").glob("*.json")} - set(TRADES)
    if on_disk:
        sys.exit(f"files not listed in TRADES or STYLES in build.py: {sorted(on_disk)}")

    problems = []
    for s, style in styles.items():
        problems += check_style(s, style)
    for t, trade in trades.items():
        problems += check_trade(t, trade)
    if problems:
        sys.exit("not building:\n  " + "\n  ".join(problems))

    base_html = (HERE / "base.html").read_text(encoding="utf-8")
    base_css = (HERE / "base.css").read_text(encoding="utf-8")

    if OUT.exists():
        shutil.rmtree(OUT)
    count = 0
    for t in TRADES:
        for s in STYLES:
            page = render_page(base_html, base_css, t, trades[t], s, styles[s])
            dest = OUT / t / s
            dest.mkdir(parents=True)
            (dest / "index.html").write_text(page, encoding="utf-8")
            count += 1
    (OUT / "index.html").write_text(render_gallery(styles, trades), encoding="utf-8")
    print(f"built {count} pages and the gallery in {OUT}")


if __name__ == "__main__":
    main()
