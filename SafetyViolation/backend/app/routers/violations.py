import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..constants import CORRECTIVE_ACTIONS, EHS_DEPARTMENTS, OFFENCE_LEVELS, VIOLATION_TYPES
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/violations", tags=["violations"])


@router.get("/options", response_model=schemas.ViolationOptionsOut)
def violation_options():
    return schemas.ViolationOptionsOut(
        departments=EHS_DEPARTMENTS,
        violation_types=VIOLATION_TYPES,
        offence_levels=OFFENCE_LEVELS,
        corrective_actions=CORRECTIVE_ACTIONS,
    )


def _next_violation_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Violation).count()
    return f"SVN-{year}-{count + 1:05d}-{uuid.uuid4().hex[:4].upper()}"


def _violation_to_out(v: models.Violation) -> schemas.ViolationOut:
    return schemas.ViolationOut(
        id=v.id,
        violation_no=v.violation_no,
        agent=schemas.UserOut.model_validate(v.agent),
        violation_date=v.violation_date,
        company=v.company,
        department=v.department,
        supervisor=v.supervisor,
        employee_name=v.employee_name,
        employee_code=v.employee_code,
        job_title=v.job_title,
        violation_type=v.violation_type,
        offence=v.offence,
        corrective_actions=v.corrective_actions.split(",") if v.corrective_actions else [],
        description=v.description,
        explanation=v.explanation,
        photo_url=v.photo_url,
        signature_data=v.signature_data,
        status=v.status,
        resolution_note=v.resolution_note,
        created_at=v.created_at,
        updated_at=v.updated_at,
    )


@router.post("", response_model=schemas.ViolationOut)
def create_violation(
    payload: schemas.ViolationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    violation = models.Violation(
        violation_no=_next_violation_no(db),
        agent_id=current_user.id,
        violation_date=payload.violation_date,
        company=payload.company,
        department=payload.department,
        supervisor=payload.supervisor,
        employee_name=payload.employee_name,
        employee_code=payload.employee_code,
        job_title=payload.job_title,
        violation_type=payload.violation_type,
        offence=payload.offence,
        corrective_actions=",".join(payload.corrective_actions) if payload.corrective_actions else None,
        description=payload.description,
        explanation=payload.explanation,
        photo_url=payload.photo_url,
        signature_data=payload.signature_data,
        status="open",
    )
    db.add(violation)
    db.flush()
    db.add(
        models.Notification(
            target_role="hod",
            message=f"New safety violation {violation.violation_no} filed by {current_user.name}",
            violation_id=violation.id,
        )
    )
    db.commit()
    db.refresh(violation)
    return _violation_to_out(violation)


@router.get("/mine", response_model=list[schemas.ViolationSummaryOut])
def my_violations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    return (
        db.query(models.Violation)
        .filter(models.Violation.agent_id == current_user.id)
        .order_by(models.Violation.created_at.desc())
        .all()
    )


@router.get("", response_model=list[schemas.ViolationRecordOut])
def list_all_violations(
    status: str | None = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    """Plant-wide violation list for the HOD dashboard — every notice filed
    by every agent, not just one agent's own submissions."""
    query = db.query(models.Violation)
    if status:
        query = query.filter(models.Violation.status == status)
    return query.order_by(models.Violation.created_at.desc()).all()


def _get_violation_or_404(db: Session, violation_id: int) -> models.Violation:
    violation = db.query(models.Violation).filter(models.Violation.id == violation_id).first()
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation


@router.get("/{violation_id}", response_model=schemas.ViolationOut)
def get_violation(
    violation_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    violation = _get_violation_or_404(db, violation_id)
    if current_user.role == "agent" and violation.agent_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your violation notice")
    return _violation_to_out(violation)


@router.post("/{violation_id}/status", response_model=schemas.ViolationOut)
def update_status(
    violation_id: int,
    payload: schemas.StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    violation = _get_violation_or_404(db, violation_id)
    if violation.status == "closed" or violation.status == "rejected":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot change status of a violation that is already '{violation.status}'",
        )

    violation.status = payload.status
    violation.resolution_note = payload.resolution_note
    db.add(violation)

    status_label = payload.status.replace("_", " ")
    db.add(
        models.Notification(
            target_user_id=violation.agent_id,
            message=f"{violation.violation_no} was marked {status_label} by HOD"
            + (f": {payload.resolution_note}" if payload.resolution_note else ""),
            violation_id=violation.id,
        )
    )
    db.commit()
    db.refresh(violation)
    return _violation_to_out(violation)
