from collections import defaultdict
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Result, User
from ..schemas import ResultResponse, SubmitTestRequest

router = APIRouter(tags=["assessment"])


@router.post("/submit-test", response_model=ResultResponse)
def submit_test(payload: SubmitTestRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="User not found.")

    scores = defaultdict(float)
    for answer in payload.answers:
        # Each dimension has 10 questions; store scores on a 0-10 scale.
        scores[answer.dimension] += 1 if answer.choice == "A" else 0

    # Update user's latest result instead of creating a new row each time.
    latest_result = (
        db.query(Result)
        .filter(Result.user_id == payload.user_id)
        .order_by(Result.created_at.desc())
        .first()
    )

    if latest_result:
        latest_result.self_awareness = scores["self_awareness"]
        latest_result.self_management = scores["self_management"]
        latest_result.social_awareness = scores["social_awareness"]
        latest_result.relationship_management = scores["relationship_management"]
        latest_result.created_at = datetime.utcnow()
        db.commit()
        db.refresh(latest_result)
        return latest_result

    result = Result(
        user_id=payload.user_id,
        self_awareness=scores["self_awareness"],
        self_management=scores["self_management"],
        social_awareness=scores["social_awareness"],
        relationship_management=scores["relationship_management"],
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result
