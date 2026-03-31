from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Result, User
from ..schemas import ResultResponse
from ..services.result_report import build_result_pdf_bytes
from ..services.emailer import send_result_email_with_pdf, send_result_email_with_pdf_detailed

router = APIRouter(tags=["results"])


@router.get("/results/{user_id}", response_model=ResultResponse)
def get_results(user_id: int, db: Session = Depends(get_db)):
    latest = (
        db.query(Result)
        .filter(Result.user_id == user_id)
        .order_by(Result.created_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No result found for this user.")
    return latest


@router.get("/results/{user_id}/pdf")
def download_results_pdf(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    latest = (
        db.query(Result)
        .filter(Result.user_id == user_id)
        .order_by(Result.created_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No result found for this user.")

    pdf_bytes = build_result_pdf_bytes(user.email, latest)
    filename = f"EI_Result_User_{user_id}.pdf"
    headers = {"Content-Disposition": f'attachment; filename="{filename}"'}

    # Send email best-effort (never block download if email fails).
    emailed = send_result_email_with_pdf(user.email, pdf_bytes, filename)
    headers["X-Email-Sent"] = str(emailed).lower()
    headers["X-Email-To"] = user.email

    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@router.get("/results/{user_id}/send-email-debug")
def send_email_debug(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    latest = (
        db.query(Result)
        .filter(Result.user_id == user_id)
        .order_by(Result.created_at.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No result found for this user.")

    pdf_bytes = build_result_pdf_bytes(user.email, latest)
    filename = f"EI_Result_User_{user_id}.pdf"
    sent, err = send_result_email_with_pdf_detailed(user.email, pdf_bytes, filename)
    return {"emailed": sent, "error": err, "to": user.email}
