import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

Role = Literal["area_incharge", "ohc"]
ItemStatus = Literal["ok", "expired", "missing"]
RefillStatus = Literal["pending", "awaiting_verification", "closed", "rejected"]


# ---------- Auth ----------
class LoginRequest(BaseModel):
    employee_id: str
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: str
    name: str
    role: Role
    department: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Boxes ----------
class BoxOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    box_number: str
    department: str
    area: str
    location: str


class BoxDetailOut(BoxOut):
    last_inspection_at: Optional[datetime.datetime] = None
    last_inspection_outcome: Optional[str] = None


# ---------- Inspections ----------
class InspectionItemIn(BaseModel):
    item_name: str
    status: ItemStatus
    note: Optional[str] = None
    photo_url: Optional[str] = None


class InspectionCreate(BaseModel):
    box_id: int
    items: List[InspectionItemIn]


class InspectionItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_name: str
    status: ItemStatus
    note: Optional[str] = None
    photo_url: Optional[str] = None


class RefillRequestBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: str
    status: RefillStatus


class InspectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    box: BoxOut
    inspector: UserOut
    created_at: datetime.datetime
    outcome: str
    items: List[InspectionItemOut]
    refill_request: Optional[RefillRequestBrief] = None


class InspectionSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    box: BoxOut
    created_at: datetime.datetime
    outcome: str


# ---------- Refill Requests ----------
class RefillItemIn(BaseModel):
    inspection_item_id: int
    replacement_note: Optional[str] = None
    photo_url: Optional[str] = None


class RefillSubmitRequest(BaseModel):
    items: List[RefillItemIn]


class RefillItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    inspection_item: InspectionItemOut
    replacement_note: Optional[str] = None
    photo_url: Optional[str] = None


class RefillRequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: str
    status: RefillStatus
    rejection_reason: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    inspection: InspectionOut
    refill_items: List[RefillItemOut]


class RefillRequestSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_code: str
    status: RefillStatus
    created_at: datetime.datetime
    box: BoxOut
    flagged_item_count: int


class VerifyDecisionRequest(BaseModel):
    decision: Literal["accept", "reject"]
    reason: Optional[str] = None


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    refill_request_id: Optional[int] = None
    is_read: bool
    created_at: datetime.datetime


# ---------- Dashboard ----------
class AreaInchargeSummary(BaseModel):
    boxes_assigned: int
    inspected_this_month: int
    pending_actions: int


class OhcSummary(BaseModel):
    total_boxes: int
    pending_refill_requests: int
    inspections_this_month: int
    overdue_boxes: int


class UploadOut(BaseModel):
    url: str
