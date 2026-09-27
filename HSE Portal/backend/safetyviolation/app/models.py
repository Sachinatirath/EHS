import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text,
    Boolean,
)
from sqlalchemy.orm import relationship

from .database import Base


def now():
    return datetime.datetime.utcnow()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "agent" | "hod"
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)

    violations = relationship("Violation", back_populates="agent")


class Violation(Base):
    __tablename__ = "violations"

    id = Column(Integer, primary_key=True, index=True)
    violation_no = Column(String, unique=True, index=True, nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    violation_date = Column(String, nullable=True)
    company = Column(String, nullable=True)
    department = Column(String, nullable=False)
    supervisor = Column(String, nullable=True)
    employee_name = Column(String, nullable=True)
    employee_code = Column(String, nullable=True)
    job_title = Column(String, nullable=True)

    violation_type = Column(String, nullable=False)
    offence = Column(String, nullable=False)
    corrective_actions = Column(String, nullable=True)  # comma-separated

    description = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    signature_data = Column(Text, nullable=True)

    # open | under_review | closed | rejected
    status = Column(String, nullable=False, default="open")
    resolution_note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    agent = relationship("User", back_populates="violations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String, nullable=True)  # "hod" | "agent"
    message = Column(String, nullable=False)
    violation_id = Column(Integer, ForeignKey("violations.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
