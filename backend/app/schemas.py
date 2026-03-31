from datetime import datetime
from typing import List

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
