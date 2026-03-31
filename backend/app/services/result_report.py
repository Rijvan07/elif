from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_result_pdf_bytes(user_email: str, result) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("Elif Healthcare - EI Assessment Result", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Email: {user_email}", styles["Normal"]))
    story.append(Paragraph(f"Generated: {result.created_at}", styles["Normal"]))
    story.append(Spacer(1, 16))

    table_data = [
        ["Dimension", "Score (/10)"],
        ["Self Awareness", f"{int(round(result.self_awareness))}/10"],
        ["Self Management", f"{int(round(result.self_management))}/10"],
        ["Social Awareness", f"{int(round(result.social_awareness))}/10"],
        ["Relationship Management", f"{int(round(result.relationship_management))}/10"],
    ]

    table = Table(table_data, colWidths=[260, 120])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F766E")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F1F5F9")]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 16))
    story.append(
        Paragraph(
            "This report was generated automatically after your assessment submission.",
            styles["Italic"],
        )
    )

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
