import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

Role = Literal["agent", "hod"]
ObservationStatus = Literal["open", "under_review", "closed"]


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


# ---------- Observation options ----------
class ObservationOptionsOut(BaseModel):
    categories: List[str]
    severity_levels: List[str]


# ---------- Observations ----------
class ObservationCreate(BaseModel):
    observer_name: Optional[str] = None
    observer_employee_code: Optional[str] = None
    department: Optional[str] = None
    observation_date: Optional[str] = None
    plant: Optional[str] = None
    area: Optional[str] = None
    location: Optional[str] = None
    observation_time: Optional[str] = None
    category: str
    description: Optional[str] = None
    severity: str
    corrective_action: Optional[str] = None
    photo_url: Optional[str] = None


class ObservationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    observation_no: str
    agent: UserOut
    observer_name: Optional[str] = None
    observer_employee_code: Optional[str] = None
    department: Optional[str] = None
    observation_date: Optional[str] = None
    plant: Optional[str] = None
    area: Optional[str] = None
    location: Optional[str] = None
    observation_time: Optional[str] = None
    category: str
    description: Optional[str] = None
    severity: str
    corrective_action: Optional[str] = None
    photo_url: Optional[str] = None
    status: ObservationStatus
    resolution_note: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class ObservationSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    observation_no: str
    department: Optional[str] = None
    category: str
    severity: str
    status: ObservationStatus
    created_at: datetime.datetime


class ObservationRecordOut(ObservationSummaryOut):
    """Plant-wide list for the HOD — like ObservationSummaryOut but includes
    the reporting agent, since HOD needs to see who filed each observation
    across every agent, not just their own."""

    agent: UserOut


class StatusUpdateRequest(BaseModel):
    status: Literal["under_review", "closed"]
    resolution_note: Optional[str] = None


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    observation_id: Optional[int] = None
    is_read: bool
    created_at: datetime.datetime


# ---------- Dashboard ----------
class AgentSummary(BaseModel):
    total_created: int
    open_count: int
    under_review_count: int
    closed_this_month: int


class HodSummary(BaseModel):
    total_observations: int
    open_count: int
    under_review_count: int
    reported_this_month: int
    closed_count: int


class UploadOut(BaseModel):
    url: str
