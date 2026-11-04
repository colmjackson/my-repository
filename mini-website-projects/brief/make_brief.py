#!/usr/bin/env python3
"""Builds client-brief.pdf: the form a tradesperson fills in and sends back.

    python3 make_brief.py                       # leaves a "send back to" box for you to type into
    python3 make_brief.py --return-to "hello@yourdomain.ie or WhatsApp 087 000 0000"

Needs reportlab and pypdf (pip install reportlab pypdf).

The PDF has real form fields (text boxes, tick boxes and one choice of look), so it can be
filled in on a phone or computer. Photos cannot be dropped into a PDF on a phone, so the form
asks for them to be attached when it is sent back, with a caption for each in the form.

The previews in the "Your look" question are drawn from ../build/styles/*.json, the same
files that build the website templates, so the form always matches the real pages.
"""
import argparse
import json
import os

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import simpleSplit
from reportlab.pdfgen import canvas

NAVY = HexColor("#0f2c44")
AMBER = HexColor("#ffb703")
INK = HexColor("#111c26")
MUTED = HexColor("#41505c")
LINE = HexColor("#8a99a3")
FIELD = HexColor("#f6f7f8")
PANEL = HexColor("#eef2f4")

W, H = A4
LEFT = 48
RIGHT = W - 48
CONTENT = RIGHT - LEFT
GAP = 18
COL = (CONTENT - GAP) / 2
COL2 = LEFT + COL + GAP

HERE = os.path.dirname(os.path.abspath(__file__))
STYLE_ORDER = ["classic", "bold", "clean", "warm"]


def load_styles():
    out = []
    for name in STYLE_ORDER:
        with open(os.path.join(HERE, "..", "build", "styles", f"{name}.json"), encoding="utf-8") as fh:
            style = json.load(fh)
        style["slug"] = name
        out.append(style)
    return out


def build(path, return_to):
    c = canvas.Canvas(path, pagesize=A4)
    c.setTitle("Your new website: quick brief")
    c.setAuthor("DayRate")
    c.setSubject("Small business website brief")
    form = c.acroForm

    def y(top):
        return H - top

    def text(x, top, s, font="Helvetica", size=11, color=INK):
        c.setFont(font, size)
        c.setFillColor(color)
        c.drawString(x, y(top), s)

    def para(x, top, s, width, font="Helvetica", size=11, color=INK, leading=16):
        lines = simpleSplit(s, font, size, width)
        c.setFont(font, size)
        c.setFillColor(color)
        for i, line in enumerate(lines):
            c.drawString(x, y(top + i * leading), line)
        return top + len(lines) * leading

    def heading(n, s, top):
        c.setFillColor(NAVY)
        c.circle(LEFT + 11, y(top) + 4.5, 11, stroke=0, fill=1)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(LEFT + 11, y(top) + 0.5, str(n))
        text(LEFT + 30, top, s, "Helvetica-Bold", 15, NAVY)

    def field(name, x, top, w, h, tip, multiline=False):
        form.textfield(
            name=name, tooltip=tip, x=x, y=y(top + h), width=w, height=h,
            borderStyle="solid", borderWidth=1.5, borderColor=LINE, fillColor=FIELD,
            textColor=INK, fontName="Helvetica", fontSize=11, forceBorder=True,
            fieldFlags="multiline" if multiline else "",
        )

    def labelled(name, label, x, top, w, h=26, multiline=False):
        text(x, top, label, "Helvetica-Bold", 10.5, MUTED)
        field(name, x, top + 6, w, h, label, multiline)

    def tick(name, label, x, top):
        form.checkbox(
            name=name, tooltip=label, x=x, y=y(top) - 4, size=16, buttonStyle="check",
            borderColor=LINE, fillColor=FIELD, textColor=INK, forceBorder=True, borderWidth=1.5,
        )
        text(x + 24, top, label, size=11.5)

    def band(height, kicker, title):
        c.setFillColor(NAVY)
        c.rect(0, H - height, W, height, stroke=0, fill=1)
        c.setFillColor(AMBER)
        c.rect(0, H - height - 4, W, 4, stroke=0, fill=1)
        tall = height > 70
        text(LEFT, 30 if tall else 22, kicker, "Helvetica-Bold", 9.5, AMBER)
        text(LEFT, 60 if tall else 46, title, "Helvetica-Bold", 25 if tall else 21, white)

    def footer(n):
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.line(LEFT, 36, RIGHT, 36)
        c.setFont("Helvetica", 9)
        c.setFillColor(MUTED)
        c.drawString(LEFT, 22, "DayRate small business sites")
        c.drawRightString(RIGHT, 22, f"Page {n} of 2")

    def px(value):
        """CSS corner size to PDF points, scaled down to suit a small preview."""
        return float(value.replace("px", "")) / 4

    def preview(style, x, top, w, h):
        """A small picture of the page in this style: header and button, then a row of cards."""
        light, shape = style["light"], style["shape"]
        r = min(px(shape["r_card"]), 4)
        base = y(top + h)
        c.saveState()
        clip = c.beginPath()
        clip.roundRect(x, base, w, h, r)
        c.clipPath(clip, stroke=0, fill=0)
        c.setFillColor(HexColor(light["bg"]))
        c.rect(x, base, w, h, stroke=0, fill=1)
        hero_h = h * 0.66
        c.setFillColor(HexColor(light["brand"]))
        c.rect(x, base + h - hero_h, w, hero_h, stroke=0, fill=1)
        # headline sample in the style's heading feel
        serif = "Georgia" in shape["h_font"]
        sample = "Your Name"
        if shape["h_transform"] == "uppercase":
            sample = sample.upper()
        c.setFillColor(HexColor(light["brand_ink"]))
        c.setFont("Times-Bold" if serif else "Helvetica-Bold", 8.5)
        c.drawString(x + 8, base + h - 14, sample)
        # call button in the accent colour, with this style's corner shape
        bw, bh = 38, 10
        radius = bh / 2 if shape["r_btn"] == "999px" else min(px(shape["r_btn"]), 3)
        c.setFillColor(HexColor(light["accent"]))
        c.roundRect(x + 8, base + h - hero_h + 8, bw, bh, radius, stroke=0, fill=1)
        # row of three cards below
        n, gap, pad = 3, 4, 8
        cw = (w - 2 * pad - (n - 1) * gap) / n
        ch = h - hero_h - 10
        c.setFillColor(HexColor(light["paper"]))
        c.setStrokeColor(HexColor(light["line"]))
        c.setLineWidth(0.8)
        for i in range(n):
            c.roundRect(x + pad + i * (cw + gap), base + 4, cw, ch, min(px(shape["r_card"]), 2.5), stroke=1, fill=1)
        c.restoreState()
        c.setStrokeColor(LINE)
        c.setLineWidth(1)
        c.roundRect(x, base, w, h, r, stroke=1, fill=0)

    # ---------------------------------------------------------------- page 1
    band(84, "DAYRATE  |  SMALL BUSINESS SITES", "Your new website: quick brief")
    para(
        LEFT, 116,
        "Fill in what you can. Short answers are fine. Send this back with one or two photos "
        "and we will draft your page. Easier on a phone? Just answer the same questions in a "
        "WhatsApp message instead.",
        CONTENT, size=11.5,
    )

    heading(1, "About you", 196)
    labelled("your_name", "Your name", LEFT, 222, COL)
    labelled("business_name", "Business name", COL2, 222, COL)
    labelled("trade", "Your trade (for example plumber or electrician)", LEFT, 276, COL)
    labelled("phone", "Phone or WhatsApp number", COL2, 276, COL)
    labelled("email", "Email", LEFT, 330, COL)
    labelled("areas", "Towns and areas you cover", COL2, 330, COL)

    heading(2, "Your business in a few lines", 408)
    text(LEFT, 432, "Who you are, how long you have been working and what customers say you are good at.",
         size=10.5, color=MUTED)
    field("intro", LEFT, 442, CONTENT, 92, "Your business in a few lines", multiline=True)

    heading(3, "What would you like the page to do?", 574)
    tick("goal_calls", "More phone calls", LEFT, 604)
    tick("goal_whatsapp", "More WhatsApp enquiries", COL2, 604)
    tick("goal_professional", "Look more professional", LEFT, 630)
    tick("goal_work", "Show examples of my work", COL2, 630)
    text(LEFT, 668, "The jobs you want more of, and anything you do not want to do",
         "Helvetica-Bold", 10.5, MUTED)
    field("services", LEFT, 674, CONTENT, 90, "The jobs you want more of", multiline=True)
    footer(1)
    c.showPage()

    # ---------------------------------------------------------------- page 2
    band(60, "DAYRATE  |  SMALL BUSINESS SITES", "Your look, photos and final details")

    # 4. look
    heading(4, "Your look", 104)
    text(LEFT, 128, "Tick the look you like best, or leave them blank and we will choose one to suit your trade.",
         size=10.5, color=MUTED)
    n, gap = 4, 12
    cw = (CONTENT - (n - 1) * gap) / n
    card_top, mock_h = 138, 60
    for i, style in enumerate(load_styles()):
        x = LEFT + i * (cw + gap)
        preview(style, x, card_top, cw, mock_h)
        form.radio(
            name="look", tooltip=f"{style['label']}: {style['tagline']}", value=style["slug"], selected=False,
            x=x, y=y(card_top + mock_h + 24), size=16, buttonStyle="circle", shape="circle",
            borderColor=LINE, fillColor=FIELD, textColor=INK, forceBorder=True, borderWidth=1.5,
            fieldFlags="radio",  # not required, and a second tap clears the choice
        )
        text(x + 22, card_top + mock_h + 17, style["label"], "Helvetica-Bold", 11.5, INK)
        text(x + 22, card_top + mock_h + 30, style["tagline"], "Helvetica", 9.5, MUTED)

    # 5. photos
    heading(5, "One or two photos", 266)
    para(
        LEFT, 290,
        "A clear photo of you, your van or a finished job works best. Take it in daylight with "
        "the phone held sideways. Attach the photos when you send this form back, and say in the "
        "boxes below what each one shows.",
        CONTENT, size=11.5, leading=15,
    )
    box_top, box_h = 340, 64
    for i, x in enumerate((LEFT, COL2), start=1):
        c.setFillColor(PANEL)
        c.setStrokeColor(LINE)
        c.setLineWidth(1.5)
        c.setDash(5, 4)
        c.roundRect(x, y(box_top + box_h), COL, box_h, 8, stroke=1, fill=1)
        c.setDash()
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(x + COL / 2, y(box_top + 25), f"Photo {i}")
        c.setFont("Helvetica", 10)
        c.setFillColor(MUTED)
        c.drawCentredString(x + COL / 2, y(box_top + 41), "Attach it with this form")
        c.drawCentredString(x + COL / 2, y(box_top + 54), f"and name it photo{i}")
        labelled(f"photo{i}_caption", f"What does photo {i} show?", x, box_top + box_h + 22, COL, 42, True)
    tick("has_logo", "I also have a logo and will attach it", LEFT, 498)

    # 6. anything else
    heading(6, "Anything else we should know", 534)
    text(LEFT, 558, "Opening hours, emergency call outs, registrations or insurance you can show, "
         "things to leave out.", size=10.5, color=MUTED)
    field("other", LEFT, 568, CONTENT, 52, "Anything else we should know", multiline=True)

    # 7. permission
    heading(7, "Your permission", 650)
    tick("permission", "", LEFT, 678)
    para(
        LEFT + 24, 678,
        "You can use my details and photos on my website. I took the photos or I am allowed to use them.",
        CONTENT - 24, size=11.5, leading=15,
    )

    # send back panel
    c.setFillColor(PANEL)
    c.setStrokeColor(LINE)
    c.setLineWidth(1)
    c.roundRect(LEFT, y(790), CONTENT, 66, 8, stroke=1, fill=1)
    text(LEFT + 16, 744, "Send this form back, with your photos attached, to:", "Helvetica-Bold", 11.5, NAVY)
    if return_to:
        text(LEFT + 16, 768, return_to, "Helvetica-Bold", 13, INK)
    else:
        field("send_back_to", LEFT + 16, 750, CONTENT - 32, 28, "Where to send this form back")
    footer(2)
    c.showPage()
    c.save()
    finish_pdf(path)


def circle(cx, cy, r):
    k = 0.5523 * r
    return (f"{cx + r:.3f} {cy:.3f} m "
            f"{cx + r:.3f} {cy + k:.3f} {cx + k:.3f} {cy + r:.3f} {cx:.3f} {cy + r:.3f} c "
            f"{cx - k:.3f} {cy + r:.3f} {cx - r:.3f} {cy + k:.3f} {cx - r:.3f} {cy:.3f} c "
            f"{cx - r:.3f} {cy - k:.3f} {cx - k:.3f} {cy - r:.3f} {cx:.3f} {cy - r:.3f} c "
            f"{cx + k:.3f} {cy - r:.3f} {cx + r:.3f} {cy - k:.3f} {cx + r:.3f} {cy:.3f} c ")


def rgb(colour):
    return f"{colour.red:.4f} {colour.green:.4f} {colour.blue:.4f}"


def finish_pdf(path):
    """Two fixes to what reportlab writes.

    1. It omits ZapfDingbats from the form's font table. Without it some viewers cannot redraw
       the tick when a box is ticked, so add it.
    2. Its radio button appearance is sized for a smaller box than the one it sits in, so the
       circle is drawn off centre. Replace it with a centred circle, plus a dot when chosen.
    """
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import ArrayObject, DecodedStreamObject, DictionaryObject, FloatObject, NameObject

    writer = PdfWriter(clone_from=PdfReader(path))
    fonts = writer._root_object["/AcroForm"]["/DR"]["/Font"]
    fonts[NameObject("/ZaDb")] = writer._add_object(DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/ZapfDingbats"),
    }))

    def form_xobject(content):
        stream = DecodedStreamObject()
        stream.set_data(content.encode("ascii"))
        stream.update({
            NameObject("/Type"): NameObject("/XObject"),
            NameObject("/Subtype"): NameObject("/Form"),
            NameObject("/BBox"): ArrayObject([FloatObject(v) for v in (0, 0, 16, 16)]),
            NameObject("/Resources"): DictionaryObject(),
        })
        return writer._add_object(stream)

    off = (f"q {rgb(FIELD)} rg {circle(8, 8, 7.25)} f Q "
           f"q {rgb(LINE)} RG 1.5 w {circle(8, 8, 7.25)} S Q")
    on = off + f" q {rgb(INK)} rg {circle(8, 8, 3.6)} f Q"
    off_ref, on_ref = form_xobject(off), form_xobject(on)

    for page in writer.pages:
        for ref in page.get("/Annots", []):
            widget = ref.get_object()
            parent = widget.get("/Parent")
            if parent is None or parent.get_object().get("/T") != "look":
                continue
            states = [k for k in widget["/AP"]["/N"].keys() if k != "/Off"]
            widget[NameObject("/AP")] = DictionaryObject({
                NameObject("/N"): DictionaryObject({NameObject("/Off"): off_ref, NameObject(states[0]): on_ref}),
            })
    with open(path, "wb") as fh:
        writer.write(fh)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--return-to", default="", help="email or WhatsApp number printed on the form")
    ap.add_argument("--out", default=os.path.join(HERE, "client-brief.pdf"))
    a = ap.parse_args()
    build(a.out, a.return_to.strip())
    print("wrote", a.out)
    if not a.return_to.strip():
        print("note: no --return-to given, so the 'send back to' box is empty. Type into it and save before sharing.")
