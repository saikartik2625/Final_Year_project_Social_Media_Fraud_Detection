"""
report_generator.py
-------------------
Generates a clean, professional 2-page PDF report.

PAGE 1: Header  |  Account Info  |  Risk Card (side-by-side with quick stats)  |  Behavioral Metrics (2 columns)
PAGE 2: System Conclusion  |  AI Insight  |  Analysis Summary Boxes  |  Footer
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime


# ─────────────────────────────────────────────────
#  Branding
# ─────────────────────────────────────────────────
APP_NAME      = "Social Media Fraud Detection"
APP_TAGLINE   = "AI-Powered Behavioral Account Analysis  ·  Final Year Project"
APP_COPYRIGHT = f"© {datetime.now().year}  Social Media Fraud Detection System  ·  Final Year Research Project"
APP_DISCLAIMER = (
    "This report is for academic and research purposes only. "
    "Predictions are probabilistic — not legally binding."
)

# Palette
C_NAVY   = colors.HexColor("#0f172a")
C_SLATE  = colors.HexColor("#1e293b")
C_BLUE   = colors.HexColor("#2563eb")
C_VIOLET = colors.HexColor("#7c3aed")
C_MUTED  = colors.HexColor("#64748b")
C_SUB    = colors.HexColor("#475569")
C_LIGHT  = colors.HexColor("#f8fafc")
C_RULE   = colors.HexColor("#e2e8f0")
C_STRIPE = colors.HexColor("#f1f5f9")

# Risk colours
G_BG  = colors.HexColor("#ecfdf5"); G_BRD = colors.HexColor("#059669"); G_TXT = colors.HexColor("#065f46")
W_BG  = colors.HexColor("#fffbeb"); W_BRD = colors.HexColor("#d97706"); W_TXT = colors.HexColor("#92400e")
F_BG  = colors.HexColor("#fef2f2"); F_BRD = colors.HexColor("#dc2626"); F_TXT = colors.HexColor("#991b1b")

# Letter page usable width (72pt margins total = 36pt each side keeps it tight)
PW = letter[0] - 72   # ≈ 540pt


# ─────────────────────────────────────────────────
#  Style sheet
# ─────────────────────────────────────────────────
def _S():
    base = getSampleStyleSheet()
    def p(name, **kw):
        return ParagraphStyle(name, parent=base["Normal"], **kw)

    return {
        # ── HEADER
        "h_name":    p("HN", fontSize=20, fontName="Helvetica-Bold",
                        textColor=colors.white, alignment=1, leading=24, spaceAfter=2),
        "h_tag":     p("HT", fontSize=8.5, fontName="Helvetica-Oblique",
                        textColor=colors.HexColor("#94a3b8"), alignment=1),
        "h_meta":    p("HM", fontSize=7.5, fontName="Helvetica", textColor=C_MUTED),
        "h_meta_r":  p("HR", fontSize=7.5, fontName="Helvetica", textColor=C_MUTED, alignment=2),

        # ── SECTION LABELS
        "sec":       p("S",  fontSize=9, fontName="Helvetica-Bold",
                        textColor=C_MUTED, spaceBefore=12, spaceAfter=6,
                        letterSpacing=1.2),

        # ── ACCOUNT INFO LINE
        "acct":      p("AC", fontSize=10, fontName="Helvetica-Bold", textColor=C_NAVY),
        "acct_sub":  p("AS", fontSize=8.5, fontName="Helvetica", textColor=C_MUTED),

        # ── RISK CARD
        "r_label":   p("RL", fontSize=7.5, fontName="Helvetica-Bold",
                        textColor=colors.white, alignment=1, leading=12),
        "r_level":   p("RV", fontSize=17, fontName="Helvetica-Bold",
                        textColor=colors.white, alignment=1, leading=22),
        "r_prob":    p("RP", fontSize=11, fontName="Helvetica-Bold",
                        textColor=colors.white, alignment=1, leading=16),

        # ── STAT BOX (quick stats on page 1)
        "stat_val":  p("SV", fontSize=16, fontName="Helvetica-Bold",
                        textColor=C_NAVY, alignment=1, leading=20),
        "stat_lbl":  p("SL", fontSize=7.5, fontName="Helvetica",
                        textColor=C_MUTED, alignment=1),

        # ── METRICS TABLE
        "th":        p("TH", fontSize=8, fontName="Helvetica-Bold", textColor=C_MUTED),
        "td":        p("TD", fontSize=8.5, fontName="Helvetica", textColor=C_SUB),

        # ── VERDICT
        "vhd":       p("VH", fontSize=10, fontName="Helvetica-Bold"),
        "vbd":       p("VB", fontSize=9.5, fontName="Helvetica", leading=16, textColor=C_SUB),

        # ── AI INSIGHT
        "ai_lbl":    p("AL", fontSize=7.5, fontName="Helvetica-Bold",
                        textColor=C_VIOLET, letterSpacing=1.2, spaceAfter=5),
        "ai_body":   p("AB", fontSize=9.5, fontName="Helvetica",
                        textColor=C_SUB, leading=15),

        # ── FOOTER
        "ft_dis":    p("FD", fontSize=7, fontName="Helvetica",
                        textColor=C_MUTED, alignment=1, leading=10),
        "ft_copy":   p("FC", fontSize=6.5, fontName="Helvetica-Oblique",
                        textColor=colors.HexColor("#94a3b8"), alignment=1),
    }


# ─────────────────────────────────────────────────
#  Building blocks
# ─────────────────────────────────────────────────

def _header(S, case_id, date_str):
    """Compact branded header + meta bar."""
    # Main banner
    hdr = Table(
        [[Paragraph(f"&#128737;  {APP_NAME}", S["h_name"])],
         [Paragraph(APP_TAGLINE, S["h_tag"])]],
        colWidths=[PW]
    )
    hdr.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), C_NAVY),
        ("TOPPADDING",    (0,0), (-1,-1), 16),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
    ]))

    # Accent stripe
    acc = Table([[""]], colWidths=[PW])
    acc.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), C_BLUE),
        ("TOPPADDING",    (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
    ]))

    # Meta bar
    meta = Table(
        [[Paragraph(f"Case ID: {case_id}", S["h_meta"]),
          Paragraph(f"Generated: {date_str}", S["h_meta_r"])]],
        colWidths=[PW/2, PW/2]
    )
    meta.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), C_SLATE),
        ("TOPPADDING",    (0,0), (-1,-1), 7),
        ("BOTTOMPADDING", (0,0), (-1,-1), 7),
        ("LEFTPADDING",   (0,0), (0,0),   14),
        ("RIGHTPADDING",  (1,0), (1,0),   14),
    ]))
    return [hdr, acc, meta]


def _account_bar(S, username, fullname):
    """Slim account identifier line."""
    tbl = Table(
        [[Paragraph(f"Account Under Review:", S["acct_sub"]),
          Paragraph(f"@{username}  ({fullname})", S["acct"])]],
        colWidths=[PW * 0.32, PW * 0.68]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
        ("BOX",           (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
        ("TOPPADDING",    (0,0), (-1,-1), 9),
        ("BOTTOMPADDING", (0,0), (-1,-1), 9),
        ("LEFTPADDING",   (0,0), (-1,-1), 14),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    return tbl


def _risk_and_stats(S, risk_level, probability, data, is_safe, is_suspicious):
    """
    Side-by-side layout: Risk card (left 55%) | 3 quick-stat boxes (right 45%).
    """
    # Risk card colour
    if is_safe:
        bg = G_BRD; icon = "GENUINE"
    elif is_suspicious:
        bg = W_BRD; icon = "SUSPICIOUS"
    else:
        bg = F_BRD; icon = "FRAUDULENT"

    risk_tbl = Table(
        [[Paragraph("FINAL RISK VERDICT", S["r_label"])],
         [Paragraph(icon, S["r_level"])],
         [Paragraph(f"Fraud Probability: <b>{probability}%</b>", S["r_prob"])]],
        colWidths=[PW * 0.55]
    )
    risk_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("TOPPADDING",    (0,0), (-1,0),  14),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 14),
        ("TOPPADDING",    (0,1), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-2), 5),
        ("ROUNDEDCORNERS",[10,10,10,10]),
    ]))

    # 3 quick stat boxes stacked
    posts     = int(data.get("#posts",     0))
    followers = int(data.get("#followers", 0))
    following = int(data.get("#follows",   0))

    def stat_box(val, lbl, c):
        t = Table(
            [[Paragraph(str(val), S["stat_val"])],
             [Paragraph(lbl, S["stat_lbl"])]],
            colWidths=[PW * 0.39]
        )
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ("BOX",           (0,0), (-1,-1), 1.5, c),
            ("TOPPADDING",    (0,0), (-1,-1), 8),
            ("BOTTOMPADDING", (0,0), (-1,-1), 8),
            ("ROUNDEDCORNERS",[8,8,8,8]),
        ]))
        return t

    stats_col = Table(
        [[stat_box(f"{posts:,}",     "Total Posts",   C_BLUE)  ],
         [stat_box(f"{followers:,}", "Followers",     G_BRD)   ],
         [stat_box(f"{following:,}", "Following",     C_VIOLET )]],
        colWidths=[PW * 0.39],
        rowHeights=None
    )
    stats_col.setStyle(TableStyle([
        ("TOPPADDING",    (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))

    # Outer container
    outer = Table(
        [[risk_tbl, stats_col]],
        colWidths=[PW * 0.57, PW * 0.43]
    )
    outer.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("RIGHTPADDING", (0,0), (0,0), 10),
    ]))
    return outer


def _metrics_2col(S, data):
    """
    Two-column metrics layout to save vertical space.
    Left column: identity signals. Right column: engagement signals.
    """
    def b(v): return "✔ Present" if v == 1 else "✘ Absent"

    left_rows = [
        ("Profile Picture",       b(data.get("profile pic", 0))),
        ("Bio Length",            f"{data.get('description length', 0)} chars"),
        ("External URL",          b(data.get("external URL", 0))),
        ("Privacy",               "Private" if data.get("private",0)==1 else "Public"),
        ("Username Digit Ratio",  f"{data.get('nums/length username', 0):.1%}"),
        ("Name vs Username",      b(data.get("name==username", 0))),
    ]
    right_rows = [
        ("Fullname Word Count",   str(data.get("fullname words", 0))),
        ("Fullname Digit Ratio",  f"{data.get('nums/length fullname', 0):.1%}"),
        ("Total Posts",           f"{int(data.get('#posts', 0)):,}"),
        ("Followers",             f"{int(data.get('#followers', 0)):,}"),
        ("Following",             f"{int(data.get('#follows', 0)):,}"),
        ("Follower/Follow Ratio", f"{(data.get('#followers',0) / max(data.get('#follows',1),1)):.2f}x"),
    ]

    def make_col(rows, w):
        header = [Paragraph("<b>INDICATOR</b>", S["th"]),
                  Paragraph("<b>VALUE</b>",     S["th"])]
        body   = [[r[0], r[1]] for r in rows]
        tbl = Table([header] + body, colWidths=[w*0.60, w*0.40])
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0),  C_STRIPE),
            ("FONTNAME",      (0,0), (-1,0),  "Helvetica-Bold"),
            ("FONTSIZE",      (0,0), (-1,0),  8),
            ("TEXTCOLOR",     (0,0), (-1,0),  C_MUTED),
            ("TOPPADDING",    (0,0), (-1,0),  7),
            ("BOTTOMPADDING", (0,0), (-1,0),  7),
            ("LINEBELOW",     (0,0), (-1,0),  1, C_RULE),
            ("FONTNAME",      (0,1), (-1,-1), "Helvetica"),
            ("FONTSIZE",      (0,1), (-1,-1), 8.5),
            ("TEXTCOLOR",     (0,1), (-1,-1), C_SUB),
            ("TOPPADDING",    (0,1), (-1,-1), 6),
            ("BOTTOMPADDING", (0,1), (-1,-1), 6),
            ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.white, C_STRIPE]),
            ("ALIGN",         (1,0), (1,-1),  "RIGHT"),
            ("LINEBELOW",     (0,1), (-1,-2), 0.5, C_RULE),
            ("BOX",           (0,0), (-1,-1), 1,   C_RULE),
        ]))
        return tbl

    half = (PW - 12) / 2   # 12pt gutter between columns
    left_tbl  = make_col(left_rows,  half)
    right_tbl = make_col(right_rows, half)

    outer = Table([[left_tbl, right_tbl]], colWidths=[half, half],
                  spaceBefore=0, spaceAfter=0)
    outer.setStyle(TableStyle([
        ("LEFTPADDING",  (0,0), (-1,-1), 0),
        ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ("ALIGN",        (1,0), (1,0),   "RIGHT"),
        ("VALIGN",       (0,0), (-1,-1), "TOP"),
        ("RIGHTPADDING", (0,0), (0,0),   6),
        ("LEFTPADDING",  (1,0), (1,0),   6),
    ]))
    return outer


def _verdict_box(S, is_safe, is_suspicious):
    if is_safe:
        bg, brd, txt = G_BG, G_BRD, G_TXT
        heading = "AUTHENTIC PROFILE DETECTED"
        body = (
            "This account demonstrates organic engagement patterns, identity consistency, "
            "and behavioral attributes characteristic of a legitimate human user. "
            "The profile is considered <b>low-risk</b> based on the current analysis signals. "
            "No further action is recommended."
        )
    elif is_suspicious:
        bg, brd, txt = W_BG, W_BRD, W_TXT
        heading = "SUSPICIOUS ACTIVITY DETECTED"
        body = (
            "This account displays ambiguous behavioral signals that warrant caution. "
            "It does not conclusively match genuine or fraudulent patterns. "
            "<b>Manual review is recommended</b> before any trust or engagement is established. "
            "Monitor for additional suspicious activity."
        )
    else:
        bg, brd, txt = F_BG, F_BRD, F_TXT
        heading = "FRAUDULENT SIGNATURE DETECTED"
        body = (
            "This account exhibits multiple behavioral indicators consistent with automated bot activity "
            "or deliberate identity manipulation. High follow-ratios, minimal content, and "
            "identity inconsistencies confirm a <b>high fraud risk</b>. "
            "Interaction and trust are strongly discouraged."
        )

    hstyle = ParagraphStyle("VH2", parent=S["vhd"], textColor=brd, fontSize=11, spaceAfter=5)
    bstyle = ParagraphStyle("VB2", parent=S["vbd"], textColor=txt)

    tbl = Table(
        [[Paragraph(heading, hstyle)],
         [Paragraph(body,    bstyle)]],
        colWidths=[PW]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), bg),
        ("BOX",           (0,0), (-1,-1), 1.5, brd),
        ("LINEBEFORE",    (0,0), (0,-1),  5,   brd),
        ("TOPPADDING",    (0,0), (-1,-1), 14),
        ("BOTTOMPADDING", (0,0), (-1,-1), 14),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("RIGHTPADDING",  (0,0), (-1,-1), 16),
    ]))
    return tbl


def _ai_box(S, text):
    tbl = Table(
        [[Paragraph("🤖  AI-POWERED INSIGHT", S["ai_lbl"])],
         [Paragraph(text, S["ai_body"])]],
        colWidths=[PW]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#f5f3ff")),
        ("BOX",           (0,0), (-1,-1), 1, C_VIOLET),
        ("LINEBEFORE",    (0,0), (0,-1),  5, C_VIOLET),
        ("TOPPADDING",    (0,0), (-1,-1), 12),
        ("BOTTOMPADDING", (0,0), (-1,-1), 12),
        ("LEFTPADDING",   (0,0), (-1,-1), 16),
        ("RIGHTPADDING",  (0,0), (-1,-1), 16),
    ]))
    return tbl


def _analysis_summary_boxes(S, data, is_safe, is_suspicious):
    """
    Three summary stat boxes: Risk Score | Account Type guess | Engagement ratio.
    Fills unused space on page 2 professionally.
    """
    posts     = int(data.get("#posts", 0))
    followers = int(data.get("#followers", 0))
    following = int(data.get("#follows",  0))
    ratio     = followers / max(following, 1)

    if is_safe:     label, col = "Low Risk",    G_BRD
    elif is_suspicious: label, col = "Medium Risk", W_BRD
    else:           label, col = "High Risk",   F_BRD

    engagement = "High" if ratio > 5 else ("Medium" if ratio > 1 else "Low")

    def mini(val, lbl, c):
        t = Table(
            [[Paragraph(f"<b>{val}</b>", ParagraphStyle("mv", parent=S["stat_val"], fontSize=14))],
             [Paragraph(lbl, S["stat_lbl"])]],
            colWidths=[PW / 3 - 10]
        )
        t.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ("BOX",           (0,0), (-1,-1), 1.5, c),
            ("TOPPADDING",    (0,0), (-1,-1), 10),
            ("BOTTOMPADDING", (0,0), (-1,-1), 10),
            ("ALIGN",         (0,0), (-1,-1), "CENTER"),
            ("ROUNDEDCORNERS",[8,8,8,8]),
        ]))
        return t

    outer = Table(
        [[mini(label,             "Risk Classification",     col),
          mini(f"{ratio:.1f}x",  "Follower / Following Ratio", C_BLUE),
          mini(engagement,        "Engagement Level",         C_VIOLET)]],
        colWidths=[PW/3, PW/3, PW/3]
    )
    outer.setStyle(TableStyle([
        ("LEFTPADDING",   (0,0), (-1,-1), 5),
        ("RIGHTPADDING",  (0,0), (-1,-1), 5),
        ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
    ]))
    return outer


def _footer(S):
    tbl = Table(
        [[Paragraph(APP_DISCLAIMER, S["ft_dis"])],
         [Paragraph(APP_COPYRIGHT,  S["ft_copy"])]],
        colWidths=[PW]
    )
    tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), C_STRIPE),
        ("BOX",           (0,0), (-1,-1), 1, C_RULE),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    return tbl


def _hr():
    return HRFlowable(width=PW, thickness=0.8, color=C_RULE, spaceAfter=12, spaceBefore=12)


# ─────────────────────────────────────────────────
#  Main entry point
# ─────────────────────────────────────────────────
def generate_pdf_report(data):
    buf = BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        rightMargin=36, leftMargin=36,
        topMargin=36,   bottomMargin=36,
    )

    S         = _S()
    now       = datetime.now()
    case_id   = now.strftime("SMFD-%Y%m%d-%H%M")
    date_str  = now.strftime("%B %d, %Y  |  %H:%M")

    risk_level  = data.get("risk_level",   "Unknown")
    probability = data.get("probability",  0)
    ai_insight  = data.get("ai_insight",   "")
    username    = data.get("username",     "N/A")
    fullname    = data.get("fullname",     "N/A")
    is_safe     = "Genuine"    in risk_level
    is_sus      = "Suspicious" in risk_level

    story = []

    # ══════════════════════ PAGE 1 ══════════════════════
    # 1. Header (compact)
    story.extend(_header(S, case_id, date_str))
    story.append(Spacer(1, 14))

    # 2. Account line
    story.append(_account_bar(S, username, fullname))
    story.append(Spacer(1, 14))

    # 3. Risk card + quick stats (side-by-side)
    story.append(Paragraph("RISK ASSESSMENT", S["sec"]))
    story.append(_risk_and_stats(S, risk_level, probability, data, is_safe, is_sus))
    story.append(Spacer(1, 14))

    # 4. Behavioral metrics (2-column)
    story.append(Paragraph("BEHAVIORAL METRICS", S["sec"]))
    story.append(_metrics_2col(S, data))

    # ══════════════════════ PAGE BREAK ════════════════════
    story.append(PageBreak())

    # ══════════════════════ PAGE 2 ══════════════════════
    # Repeat slim header on page 2
    story.extend(_header(S, case_id, date_str))
    story.append(Spacer(1, 14))

    # 5. System verdict
    story.append(Paragraph("SYSTEM CONCLUSION & RECOMMENDATION", S["sec"]))
    story.append(_verdict_box(S, is_safe, is_sus))
    story.append(Spacer(1, 14))

    # 6. AI insight (if present)
    if ai_insight:
        story.append(Paragraph("AI BEHAVIOURAL INSIGHT", S["sec"]))
        story.append(_ai_box(S, ai_insight))
        story.append(Spacer(1, 14))

    # 7. Analysis summary stat boxes
    story.append(Paragraph("ANALYSIS SUMMARY", S["sec"]))
    story.append(_analysis_summary_boxes(S, data, is_safe, is_sus))
    story.append(Spacer(1, 18))

    # 8. HR + Footer
    story.append(_hr())
    story.append(_footer(S))

    doc.build(story)
    buf.seek(0)
    return buf
