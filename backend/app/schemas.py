from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    message: str
    user: UserResponse


class AnswerPayload(BaseModel):
    question_id: int
    dimension: str = Field(
        ...,
        pattern="^(self_awareness|self_management|social_awareness|relationship_management)$",
    )
    choice: str = Field(..., pattern="^(A|B)$")


class SubmitTestRequest(BaseModel):
    user_id: int
    answers: List[AnswerPayload]


class ResultBase(BaseModel):
    self_awareness: float
    self_management: float
    social_awareness: float
    relationship_management: float


class ResultResponse(ResultBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class AdminLoginResponse(BaseModel):
    message: str
    email: str


class QuestionTypeSlice(BaseModel):
    name: str
    key: str
    # Count of "A" selections for this competency today (summed across completions).
    value: float


class HourlyPerformancePoint(BaseModel):
    label: str
    hour: int
    submissions: int
    cumulative_submissions: int
    avg_performance_index: Optional[float] = None
    performance_high: Optional[float] = None
    performance_low: Optional[float] = None


class QuestionMcqStatsItem(BaseModel):
    question_id: int
    count_a: int
    count_b: int


class TodayAnalyticsResponse(BaseModel):
    date: str
    timezone: str
    completions_count: int
    question_type_distribution: List[QuestionTypeSlice]
    hourly_performance: List[HourlyPerformancePoint]
    question_breakdown: List[QuestionMcqStatsItem]
    question_answers_captured: int
    expected_question_answers: int
