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

    observations = relationship("Observation", back_populates="agent")


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    observation_no = Column(String, unique=True, index=True, nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Reporter Information
    observer_name = Column(String, nullable=True)
    observer_employee_code = Column(String, nullable=True)
    department = Column(String, nullable=True)
    observation_date = Column(String, nullable=True)

    # Observation Details
    plant = Column(String, nullable=True)
    area = Column(String, nullable=True)
    location = Column(String, nullable=True)
    observation_time = Column(String, nullable=True)

    # Observation Information
    category = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Risk Assessment
    severity = Column(String, nullable=False)

    # Immediate Corrective Action
    corrective_action = Column(Text, nullable=True)

    # Evidence
    photo_url = Column(String, nullable=True)

    # open | under_review | closed
    status = Column(String, nullable=False, default="open")
    resolution_note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    agent = relationship("User", back_populates="observations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String, nullable=True)  # "hod" | "agent"
    message = Column(String, nullable=False)
    observation_id = Column(Integer, ForeignKey("observations.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
