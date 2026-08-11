import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..constants import EHS_DEPARTMENTS, INCIDENT_TYPES, SEVERITY_LEVELS
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/incidents", tags=["incidents"])


@router.get("/options", response_model=schemas.IncidentOptionsOut)
def incident_options():
    return schemas.IncidentOptionsOut(
        departments=EHS_DEPARTMENTS,
        incident_types=INCIDENT_TYPES,
        severity_levels=SEVERITY_LEVELS,
    )


def _next_incident_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Incident).count()
    return f"INC-{year}-{count + 1:05d}-{uuid.uuid4().hex[:4].upper()}"


@router.post("", response_model=schemas.IncidentOut)
def create_incident(
    payload: schemas.IncidentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    incident = models.Incident(
        incident_no=_next_incident_no(db),
        agent_id=current_user.id,
        incident_date=payload.incident_date,
        incident_time=payload.incident_time,
        reported_by=payload.reported_by,
        department=payload.department,
        location=payload.location,
        description=payload.description,
        incident_type=payload.incident_type,
        severity=payload.severity,
        corrective_action=payload.corrective_action,
        root_cause=payload.root_cause,
        preventive_action=payload.preventive_action,
        photo_url=payload.photo_url,
        status="open",
    )
    db.add(incident)
    db.flush()
    db.add(
        models.Notification(
            target_role="hod",
            message=f"New incident {incident.incident_no} reported by {current_user.name}",
            incident_id=incident.id,
        )
    )
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/mine", response_model=list[schemas.IncidentSummaryOut])
def my_incidents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    return (
        db.query(models.Incident)
        .filter(models.Incident.agent_id == current_user.id)
        .order_by(models.Incident.created_at.desc())
        .all()
    )


@router.get("", response_model=list[schemas.IncidentRecordOut])
def list_all_incidents(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    """Plant-wide incident list for the HOD dashboard — every incident
    reported by every agent, not just one agent's own submissions."""
    query = db.query(models.Incident)
    if status:
        query = query.filter(models.Incident.status == status)
    return query.order_by(models.Incident.created_at.desc()).all()


def _get_incident_or_404(db: Session, incident_id: int) -> models.Incident:
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.get("/{incident_id}", response_model=schemas.IncidentOut)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    incident = _get_incident_or_404(db, incident_id)
    if current_user.role == "agent" and incident.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your incident report")
    return incident


@router.post("/{incident_id}/status", response_model=schemas.IncidentOut)
def update_status(
    incident_id: int,
    payload: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    incident = _get_incident_or_404(db, incident_id)
    if incident.status == "closed":
        raise HTTPException(status_code=400, detail="Cannot change status of an incident that is already closed")

    incident.status = payload.status
    incident.resolution_note = payload.resolution_note
    db.add(incident)

    status_label = payload.status.replace("_", " ")
    db.add(
        models.Notification(
            target_user_id=incident.agent_id,
            message=f"{incident.incident_no} was marked {status_label} by HOD"
            + (f": {payload.resolution_note}" if payload.resolution_note else ""),
            incident_id=incident.id,
        )
    )
    db.commit()
    db.refresh(incident)
    return incident
