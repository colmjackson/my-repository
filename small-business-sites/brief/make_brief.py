#!/usr/bin/env python3
"""Builds client-brief.pdf: the form a tradesperson fills in and sends back.

    python3 make_brief.py                       # leaves a "send back to" box for you to type into
    python3 make_brief.py --return-to "hello@yourdomain.ie or WhatsApp 087 000 0000"

Needs reportlab and pypdf (pip install reportlab pypdf).

The PDF has real form fields (text boxes and tick boxes), so it can be filled in on a
phone or computer. Photos cannot be dropped into a PDF on a phone, so the form asks for
them to be attached when it is sent back, with a caption for each in the form.
"""
import argparse
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

    # ---------------------------------------------------------------- page 1
    band(84, "DAYRATE  |  SMALL BUSINESS SITES", "Your new website: quick brief")
    bottom = para(
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
    band(60, "DAYRATE  |  SMALL BUSINESS SITES", "Photos and final details")

    heading(4, "One or two photos", 106)
    para(
        LEFT, 132,
        "A clear photo of you, your van or a finished job works best. Take it in daylight with "
        "the phone held sideways. Attach the photos when you send this form back, and say in the "
        "boxes below what each one shows.",
        CONTENT, size=11.5,
    )
    box_top, box_h = 196, 130
    for i, x in enumerate((LEFT, COL2), start=1):
        c.setFillColor(PANEL)
        c.setStrokeColor(LINE)
        c.setLineWidth(1.5)
        c.setDash(5, 4)
        c.roundRect(x, y(box_top + box_h), COL, box_h, 8, stroke=1, fill=1)
        c.setDash()
        c.setFillColor(NAVY)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(x + COL / 2, y(box_top + 58), f"Photo {i}")
        c.setFont("Helvetica", 10.5)
        c.setFillColor(MUTED)
        c.drawCentredString(x + COL / 2, y(box_top + 78), "Attach it with this form")
        c.drawCentredString(x + COL / 2, y(box_top + 93), f"and name it photo{i}")
        labelled(f"photo{i}_caption", f"What does photo {i} show?", x, box_top + box_h + 24, COL, 52, True)
    tick("has_logo", "I also have a logo and will attach it", LEFT, 436)

    heading(5, "Anything else we should know", 484)
    text(LEFT, 508, "Opening hours, emergency call outs, registrations or insurance you can show, "
         "things to leave out.", size=10.5, color=MUTED)
    field("other", LEFT, 518, CONTENT, 88, "Anything else we should know", multiline=True)

    heading(6, "Your permission", 646)
    tick("permission", "", LEFT, 676)
    para(
        LEFT + 24, 676,
        "You can use my details and photos on my website. I took the photos or I am allowed to use them.",
        CONTENT - 24, size=11.5,
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
    register_tick_font(path)


def register_tick_font(path):
    """reportlab omits ZapfDingbats from the form's font table. Without it some viewers cannot
    redraw the tick when a box is ticked, so add it."""
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import DictionaryObject, NameObject

    writer = PdfWriter(clone_from=PdfReader(path))
    fonts = writer._root_object["/AcroForm"]["/DR"]["/Font"]
    fonts[NameObject("/ZaDb")] = writer._add_object(DictionaryObject({
        NameObject("/Type"): NameObject("/Font"),
        NameObject("/Subtype"): NameObject("/Type1"),
        NameObject("/BaseFont"): NameObject("/ZapfDingbats"),
    }))
    with open(path, "wb") as fh:
        writer.write(fh)


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--return-to", default="", help="email or WhatsApp number printed on the form")
    ap.add_argument("--out", default=os.path.join(here, "client-brief.pdf"))
    a = ap.parse_args()
    build(a.out, a.return_to.strip())
    print("wrote", a.out)
    if not a.return_to.strip():
        print("note: no --return-to given, so the 'send back to' box is empty. Type into it and save before sharing.")
