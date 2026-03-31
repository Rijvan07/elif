import os
import smtplib
import logging
from email.message import EmailMessage


logger = logging.getLogger("elif.email")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    handler.setFormatter(formatter)
    logger.addHandler(handler)
logger.setLevel(logging.INFO)


def _is_email_enabled() -> bool:
    required = ["SMTP_HOST", "SMTP_PORT", "SMTP_FROM_EMAIL", "SMTP_USERNAME", "SMTP_PASSWORD"]
    return all(os.getenv(key) for key in required)


def send_result_email_with_pdf(to_email: str, pdf_bytes: bytes, filename: str) -> bool:
    if not _is_email_enabled():
        logger.warning("SMTP not configured; skipping email send.")
        return False

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    from_email = os.getenv("SMTP_FROM_EMAIL")
    from_name = os.getenv("SMTP_FROM_NAME", "Elif Healthcare")

    message = EmailMessage()
    message["Subject"] = "Your EI Assessment Result PDF"
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message.set_content(
        "Hi,\n\nYour Emotional Intelligence Assessment result is attached as a PDF.\n\nRegards,\nElif Healthcare"
    )
    message.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename=filename)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as smtp:
            if smtp_use_tls:
                smtp.starttls()
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(message)
        return True
    except Exception as exc:
        # Do not fail assessment submission if email delivery fails.
        logger.exception("Failed to send email via SMTP: %s", exc)
        return False


def send_result_email_with_pdf_detailed(to_email: str, pdf_bytes: bytes, filename: str) -> tuple[bool, str]:
    """
    Debug helper: returns (sent_ok, error_message).
    Does not expose secrets; only returns SMTP exception text.
    """
    if not _is_email_enabled():
        return False, "SMTP not configured (missing env vars)."

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    from_email = os.getenv("SMTP_FROM_EMAIL")
    from_name = os.getenv("SMTP_FROM_NAME", "Elif Healthcare")

    message = EmailMessage()
    message["Subject"] = "Your EI Assessment Result PDF"
    message["From"] = f"{from_name} <{from_email}>"
    message["To"] = to_email
    message.set_content(
        "Hi,\n\nYour Emotional Intelligence Assessment result is attached as a PDF.\n\nRegards,\nElif Healthcare"
    )
    message.add_attachment(pdf_bytes, maintype="application", subtype="pdf", filename=filename)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as smtp:
            if smtp_use_tls:
                smtp.starttls()
            smtp.login(smtp_user, smtp_password)
            smtp.send_message(message)
        return True, ""
    except Exception as exc:
        return False, str(exc)
