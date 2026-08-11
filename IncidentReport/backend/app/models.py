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

    incidents = relationship("Incident", back_populates="agent")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_no = Column(String, unique=True, index=True, nullable=False)
    agent_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Incident Details
    incident_date = Column(String, nullable=True)
    incident_time = Column(String, nullable=True)
    reported_by = Column(String, nullable=True)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)

    # Incident Description
    description = Column(Text, nullable=True)

    # Classification
    incident_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)

    # Immediate Corrective Action
    corrective_action = Column(Text, nullable=True)

    # Investigation
    root_cause = Column(Text, nullable=True)
    preventive_action = Column(Text, nullable=True)

    # Attachments
    photo_url = Column(String, nullable=True)

    # open | under_investigation | closed
    status = Column(String, nullable=False, default="open")
    resolution_note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    agent = relationship("User", back_populates="incidents")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String, nullable=True)  # "hod" | "agent"
    message = Column(String, nullable=False)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
