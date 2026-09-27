import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

Role = Literal["agent", "hod"]
ViolationStatus = Literal["open", "under_review", "closed", "rejected"]


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
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class UserUpdate(BaseModel):
    name: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


# ---------- Violation options ----------
class ViolationOptionsOut(BaseModel):
    departments: List[str]
    violation_types: List[str]
    offence_levels: List[str]
    corrective_actions: List[str]


# ---------- Violations ----------
class ViolationCreate(BaseModel):
    violation_date: Optional[str] = None
    company: Optional[str] = None
    department: str
    supervisor: Optional[str] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    job_title: Optional[str] = None
    violation_type: str
    offence: str
    corrective_actions: List[str] = []
    description: Optional[str] = None
    explanation: Optional[str] = None
    photo_url: Optional[str] = None
    signature_data: Optional[str] = None


class ViolationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    violation_no: str
    agent: UserOut
    violation_date: Optional[str] = None
    company: Optional[str] = None
    department: str
    supervisor: Optional[str] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    job_title: Optional[str] = None
    violation_type: str
    offence: str
    corrective_actions: List[str] = []
    description: Optional[str] = None
    explanation: Optional[str] = None
    photo_url: Optional[str] = None
    signature_data: Optional[str] = None
    status: ViolationStatus
    resolution_note: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ViolationSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    violation_no: str
    department: str
    violation_type: str
    offence: str
    status: ViolationStatus
    employee_name: Optional[str] = None
    created_at: datetime.datetime


class ViolationRecordOut(ViolationSummaryOut):
    """Plant-wide list for the HOD — like ViolationSummaryOut but includes
    the reporting agent, since HOD needs to see who filed each notice across
    every agent, not just their own."""

    agent: UserOut


class StatusUpdateRequest(BaseModel):
    status: Literal["under_review", "closed", "rejected"]
    resolution_note: Optional[str] = None


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    violation_id: Optional[int] = None
    is_read: bool
    created_at: datetime.datetime


# ---------- Dashboard ----------
class AgentSummary(BaseModel):
    total_created: int
    open_count: int
    under_review_count: int
    closed_this_month: int


class HodSummary(BaseModel):
    total_violations: int
    open_count: int
    under_review_count: int
    reported_this_month: int
    rejected_count: int


class UploadOut(BaseModel):
    url: str
