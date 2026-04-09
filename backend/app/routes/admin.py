import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Result, UserQuestionAnswer
from ..schemas import (
    AdminLoginResponse,
    HourlyPerformancePoint,
    QuestionMcqStatsItem,
    QuestionTypeSlice,
    TodayAnalyticsResponse,
    UserCreate,
)

router = APIRouter(prefix="/admin", tags=["admin"])

DIMENSION_META = (
    ("self_awareness", "Self-Awareness"),
    ("self_management", "Self-Management"),
    ("social_awareness", "Social Awareness"),
    ("relationship_management", "Relationship Management"),
)


def _admin_allowlist() -> set[str]:
    raw = os.getenv("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def _today_bounds_utc() -> tuple[datetime, datetime]:
    now = datetime.now(timezone.utc)
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=1)
    return start, end


def _normalize_dimension_score(raw: float) -> float:
    normalized = raw / 2 if raw > 10 else raw
    return max(0.0, min(10.0, round(float(normalized), 2)))


def _performance_index(result: Result) -> float:
    vals = [
        _normalize_dimension_score(result.self_awareness),
        _normalize_dimension_score(result.self_management),
        _normalize_dimension_score(result.social_awareness),
        _normalize_dimension_score(result.relationship_management),
    ]
    return round(sum(vals) / 4.0 * 10.0, 2)


def require_admin(x_admin_email: Optional[str] = Header(None, alias="X-Admin-Email")) -> str:
    if not x_admin_email or not x_admin_email.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin session required.",
        )
    email = x_admin_email.strip().lower()
    if email not in _admin_allowlist():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized.",
        )
    return email


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: UserCreate):
    email_norm = payload.email.strip().lower()
    if email_norm not in _admin_allowlist():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This email is not registered as an admin.",
        )
    return AdminLoginResponse(message="Login successful.", email=payload.email.strip())


@router.get("/analytics/today", response_model=TodayAnalyticsResponse)
def analytics_today(_admin: str = Depends(require_admin), db: Session = Depends(get_db)):
    start, end = _today_bounds_utc()
    results = (
        db.query(Result)
        .filter(Result.created_at >= start, Result.created_at < end)
        .order_by(Result.created_at.asc())
        .all()
    )

    completions_count = len(results)

    sums = {key: 0.0 for key, _ in DIMENSION_META}
    for r in results:
        sums["self_awareness"] += float(r.self_awareness)
        sums["self_management"] += float(r.self_management)
        sums["social_awareness"] += float(r.social_awareness)
        sums["relationship_management"] += float(r.relationship_management)

    distribution = [
        QuestionTypeSlice(name=label, key=key, value=round(sums[key], 2))
        for key, label in DIMENSION_META
    ]

    by_hour: dict[int, list[Result]] = defaultdict(list)
    for r in results:
        ts = r.created_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        else:
            ts = ts.astimezone(timezone.utc)
        by_hour[ts.hour].append(r)

    hourly_points: list[HourlyPerformancePoint] = []
    cumulative = 0
    for hour in range(24):
        label = f"{hour:02d}:00"
        hour_results = by_hour.get(hour, [])
        n = len(hour_results)
        cumulative += n
        if n == 0:
            hourly_points.append(
                HourlyPerformancePoint(
                    label=label,
                    hour=hour,
                    submissions=0,
                    cumulative_submissions=cumulative,
                    avg_performance_index=None,
                    performance_high=None,
                    performance_low=None,
                )
            )
            continue
        indices = [_performance_index(x) for x in hour_results]
        hourly_points.append(
            HourlyPerformancePoint(
                label=label,
                hour=hour,
                submissions=n,
                cumulative_submissions=cumulative,
                avg_performance_index=round(sum(indices) / n, 2),
                performance_high=round(max(indices), 2),
                performance_low=round(min(indices), 2),
            )
        )

    user_ids = [r.user_id for r in results]
    mcq_counts: dict[int, dict[str, int]] = defaultdict(lambda: {"A": 0, "B": 0})
    if user_ids:
        rows = (
            db.query(
                UserQuestionAnswer.question_id,
                UserQuestionAnswer.choice,
                func.count(UserQuestionAnswer.id).label("cnt"),
            )
            .filter(UserQuestionAnswer.user_id.in_(user_ids))
            .group_by(UserQuestionAnswer.question_id, UserQuestionAnswer.choice)
            .all()
        )
        for qid, choice, cnt in rows:
            if choice in ("A", "B"):
                mcq_counts[int(qid)][choice] = int(cnt)

    question_breakdown = [
        QuestionMcqStatsItem(
            question_id=qid,
            count_a=mcq_counts[qid]["A"],
            count_b=mcq_counts[qid]["B"],
        )
        for qid in range(1, 41)
    ]
    question_answers_captured = sum(x["A"] + x["B"] for x in mcq_counts.values())
    expected_question_answers = completions_count * 40

    return TodayAnalyticsResponse(
        date=start.date().isoformat(),
        timezone="UTC",
        completions_count=completions_count,
        question_type_distribution=distribution,
        hourly_performance=hourly_points,
        question_breakdown=question_breakdown,
        question_answers_captured=question_answers_captured,
        expected_question_answers=expected_question_answers,
    )
