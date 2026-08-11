import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict

Role = Literal["agent", "hod"]
IncidentStatus = Literal["open", "under_investigation", "closed"]


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


# ---------- Incident options ----------
class IncidentOptionsOut(BaseModel):
    departments: List[str]
    incident_types: List[str]
    severity_levels: List[str]


# ---------- Incidents ----------
class IncidentCreate(BaseModel):
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    reported_by: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    incident_type: str
    severity: str
    corrective_action: Optional[str] = None
    root_cause: Optional[str] = None
    preventive_action: Optional[str] = None
    photo_url: Optional[str] = None


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_no: str
    agent: UserOut
    incident_date: Optional[str] = None
    incident_time: Optional[str] = None
    reported_by: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    incident_type: str
    severity: str
    corrective_action: Optional[str] = None
    root_cause: Optional[str] = None
    preventive_action: Optional[str] = None
    photo_url: Optional[str] = None
    status: IncidentStatus
    resolution_note: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime


class IncidentSummaryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    incident_no: str
    department: Optional[str] = None
    incident_type: str
    severity: str
    status: IncidentStatus
    created_at: datetime.datetime


class IncidentRecordOut(IncidentSummaryOut):
    """Plant-wide list for the HOD — like IncidentSummaryOut but includes the
    reporting agent, since HOD needs to see who filed each incident across
    every agent, not just their own."""

    agent: UserOut


class StatusUpdateRequest(BaseModel):
    status: Literal["under_investigation", "closed"]
    resolution_note: Optional[str] = None


# ---------- Notifications ----------
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    message: str
    incident_id: Optional[int] = None
    is_read: bool
    created_at: datetime.datetime


# ---------- Dashboard ----------
class AgentSummary(BaseModel):
    total_created: int
    open_count: int
    under_investigation_count: int
    closed_this_month: int


class HodSummary(BaseModel):
    total_incidents: int
    open_count: int
    under_investigation_count: int
    reported_this_month: int
    closed_count: int


class UploadOut(BaseModel):
    url: str
