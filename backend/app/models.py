from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    results = relationship("Result", back_populates="user", cascade="all, delete-orphan")
    question_answers = relationship(
        "UserQuestionAnswer",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class UserQuestionAnswer(Base):
    """Latest Mcq choice per user per question (updated on each assessment submit)."""

    __tablename__ = "user_question_answers"
    __table_args__ = (UniqueConstraint("user_id", "question_id", name="uq_user_question_answer"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    question_id = Column(Integer, nullable=False, index=True)
    choice = Column(String(1), nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="question_answers")


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    self_awareness = Column(Float, nullable=False, default=0)
    self_management = Column(Float, nullable=False, default=0)
    social_awareness = Column(Float, nullable=False, default=0)
    relationship_management = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="results")
