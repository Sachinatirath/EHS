import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..constants import OBSERVATION_CATEGORIES, SEVERITY_LEVELS
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/observations", tags=["observations"])


@router.get("/options", response_model=schemas.ObservationOptionsOut)
def observation_options():
    return schemas.ObservationOptionsOut(
        categories=OBSERVATION_CATEGORIES,
        severity_levels=SEVERITY_LEVELS,
    )


def _next_observation_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Observation).count()
    return f"SOB-{year}-{count + 1:05d}-{uuid.uuid4().hex[:4].upper()}"


@router.post("", response_model=schemas.ObservationOut)
def create_observation(
    payload: schemas.ObservationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    observation = models.Observation(
        observation_no=_next_observation_no(db),
        agent_id=current_user.id,
        observer_name=payload.observer_name,
        observer_employee_code=payload.observer_employee_code,
        department=payload.department,
        observation_date=payload.observation_date,
        plant=payload.plant,
        area=payload.area,
        location=payload.location,
        observation_time=payload.observation_time,
        category=payload.category,
        description=payload.description,
        severity=payload.severity,
        corrective_action=payload.corrective_action,
        photo_url=payload.photo_url,
        status="open",
    )
    db.add(observation)
    db.flush()
    db.add(
        models.Notification(
            target_role="hod",
            message=f"New safety observation {observation.observation_no} filed by {current_user.name}",
            observation_id=observation.id,
        )
    )
    db.commit()
    db.refresh(observation)
    return observation


@router.get("/mine", response_model=list[schemas.ObservationSummaryOut])
def my_observations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    return (
        db.query(models.Observation)
        .filter(models.Observation.agent_id == current_user.id)
        .order_by(models.Observation.created_at.desc())
        .all()
    )


@router.get("", response_model=list[schemas.ObservationRecordOut])
def list_all_observations(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    """Plant-wide observation list for the HOD dashboard — every observation
    filed by every agent, not just one agent's own submissions."""
    query = db.query(models.Observation)
    if status:
        query = query.filter(models.Observation.status == status)
    return query.order_by(models.Observation.created_at.desc()).all()


def _get_observation_or_404(db: Session, observation_id: int) -> models.Observation:
    observation = db.query(models.Observation).filter(models.Observation.id == observation_id).first()
    if not observation:
        raise HTTPException(status_code=404, detail="Observation not found")
    return observation


@router.get("/{observation_id}", response_model=schemas.ObservationOut)
def get_observation(
    observation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    observation = _get_observation_or_404(db, observation_id)
    if current_user.role == "agent" and observation.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your observation")
    return observation


@router.post("/{observation_id}/status", response_model=schemas.ObservationOut)
def update_status(
    observation_id: int,
    payload: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    observation = _get_observation_or_404(db, observation_id)
    if observation.status == "closed":
        raise HTTPException(status_code=400, detail="Cannot change status of an observation that is already closed")

    observation.status = payload.status
    observation.resolution_note = payload.resolution_note
    db.add(observation)

    status_label = payload.status.replace("_", " ")
    db.add(
        models.Notification(
            target_user_id=observation.agent_id,
            message=f"{observation.observation_no} was marked {status_label} by HOD"
            + (f": {payload.resolution_note}" if payload.resolution_note else ""),
            observation_id=observation.id,
        )
    )
    db.commit()
    db.refresh(observation)
    return observation
