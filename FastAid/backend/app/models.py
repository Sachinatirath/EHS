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
    role = Column(String, nullable=False)  # "area_incharge" | "ohc"
    department = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    address = Column(String, nullable=True)

    inspections = relationship("Inspection", back_populates="inspector")


class Box(Base):
    __tablename__ = "boxes"

    id = Column(Integer, primary_key=True, index=True)
    box_number = Column(String, unique=True, index=True, nullable=False)
    department = Column(String, nullable=False)
    area = Column(String, nullable=False)
    location = Column(String, nullable=False)

    inspections = relationship("Inspection", back_populates="box")


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    box_id = Column(Integer, ForeignKey("boxes.id"), nullable=False)
    inspector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=now)
    # ok | refill_requested | closed_ok
    outcome = Column(String, nullable=False, default="ok")

    box = relationship("Box", back_populates="inspections")
    inspector = relationship("User", back_populates="inspections")
    items = relationship(
        "InspectionItem", back_populates="inspection", cascade="all, delete-orphan"
    )
    refill_request = relationship(
        "RefillRequest", back_populates="inspection", uselist=False
    )


class InspectionItem(Base):
    __tablename__ = "inspection_items"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False)
    item_name = Column(String, nullable=False)
    status = Column(String, nullable=False)  # ok | expired | missing
    note = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)

    inspection = relationship("Inspection", back_populates="items")


class RefillRequest(Base):
    __tablename__ = "refill_requests"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(
        Integer, ForeignKey("inspections.id"), unique=True, nullable=False
    )
    request_code = Column(String, unique=True, nullable=False)
    # pending | awaiting_verification | closed | rejected
    status = Column(String, nullable=False, default="pending")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime, default=now, onupdate=now)

    inspection = relationship("Inspection", back_populates="refill_request")
    refill_items = relationship(
        "RefillItem", back_populates="refill_request", cascade="all, delete-orphan"
    )


class RefillItem(Base):
    __tablename__ = "refill_items"

    id = Column(Integer, primary_key=True, index=True)
    refill_request_id = Column(Integer, ForeignKey("refill_requests.id"), nullable=False)
    inspection_item_id = Column(Integer, ForeignKey("inspection_items.id"), nullable=False)
    replacement_note = Column(Text, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=now)

    refill_request = relationship("RefillRequest", back_populates="refill_items")
    inspection_item = relationship("InspectionItem")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_role = Column(String, nullable=True)  # "ohc" | "area_incharge"
    message = Column(String, nullable=False)
    refill_request_id = Column(Integer, ForeignKey("refill_requests.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now)
