from collections import defaultdict
from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Result, User, UserQuestionAnswer
from ..schemas import ResultResponse, SubmitTestRequest

router = APIRouter(tags=["assessment"])


@router.post("/submit-test", response_model=ResultResponse)
def submit_test(payload: SubmitTestRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    scores = defaultdict(float)
    for answer in payload.answers:
        # Each dimension has 10 questions; store scores on a 0-10 scale.
        scores[answer.dimension] += 1 if answer.choice == "A" else 0

    now = datetime.utcnow()
    today = now.date()

    # Check if user already has a record for today
    today_result = (
        db.query(Result)
        .filter(
            Result.user_id == payload.user_id,
            func.date(Result.created_at) == today
        )
        .first()
    )

    if today_result:
        # Update existing today's record
        today_result.self_awareness = scores["self_awareness"]
        today_result.self_management = scores["self_management"]
        today_result.social_awareness = scores["social_awareness"]
        today_result.relationship_management = scores["relationship_management"]
        today_result.created_at = now  # Update timestamp
        out = today_result
    else:
        # Create new record for today
        out = Result(
            user_id=payload.user_id,
            self_awareness=scores["self_awareness"],
            self_management=scores["self_management"],
            social_awareness=scores["social_awareness"],
            relationship_management=scores["relationship_management"],
            created_at=now,
        )
        db.add(out)

    for answer in payload.answers:
        row = (
            db.query(UserQuestionAnswer)
            .filter(
                UserQuestionAnswer.user_id == payload.user_id,
                UserQuestionAnswer.question_id == answer.question_id,
            )
            .first()
        )
        if row:
            row.choice = answer.choice
            row.updated_at = now
        else:
            db.add(
                UserQuestionAnswer(
                    user_id=payload.user_id,
                    question_id=answer.question_id,
                    choice=answer.choice,
                    updated_at=now,
                )
            )

    db.commit()
    db.refresh(out)
    return out
