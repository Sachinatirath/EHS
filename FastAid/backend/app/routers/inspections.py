import uuid
import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..constants import CHECKLIST_ITEMS
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/inspections", tags=["inspections"])


@router.get("/checklist-items", response_model=list[str])
def checklist_items():
    return CHECKLIST_ITEMS


def _next_request_code(db: Session) -> str:
    count = db.query(models.RefillRequest).count()
    return f"RFQ-{count + 1:04d}-{uuid.uuid4().hex[:4].upper()}"


@router.post("", response_model=schemas.InspectionOut)
def create_inspection(
    payload: schemas.InspectionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("area_incharge")),
):
    box = db.query(models.Box).filter(models.Box.id == payload.box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")

    item_names = {i.item_name for i in payload.items}
    missing_names = set(CHECKLIST_ITEMS) - item_names
    if missing_names:
        raise HTTPException(
            status_code=400,
            detail=f"Missing checklist items: {', '.join(sorted(missing_names))}",
        )

    has_flagged = any(i.status != "ok" for i in payload.items)
    outcome = "refill_requested" if has_flagged else "ok"

    inspection = models.Inspection(
        box_id=box.id, inspector_id=current_user.id, outcome=outcome
    )
    db.add(inspection)
    db.flush()

    for item in payload.items:
        db.add(
            models.InspectionItem(
                inspection_id=inspection.id,
                item_name=item.item_name,
                status=item.status,
                note=item.note,
                photo_url=item.photo_url,
            )
        )
    db.flush()

    if has_flagged:
        refill_request = models.RefillRequest(
            inspection_id=inspection.id,
            request_code=_next_request_code(db),
            status="pending",
        )
        db.add(refill_request)
        db.flush()
        db.add(
            models.Notification(
                target_role="ohc",
                message=f"New refill request {refill_request.request_code} for box {box.box_number}",
                refill_request_id=refill_request.id,
            )
        )

    db.commit()
    db.refresh(inspection)
    return inspection


@router.get("", response_model=list[schemas.InspectionRecordOut])
def list_all_inspections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ohc")),
):
    """Plant-wide inspection history for the OHC Records screen — every
    inspection across every box/department, not just ones that produced a
    refill request."""
    return (
        db.query(models.Inspection)
        .order_by(models.Inspection.created_at.desc())
        .all()
    )


@router.get("/mine", response_model=list[schemas.InspectionSummaryOut])
def my_inspections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("area_incharge")),
):
    return (
        db.query(models.Inspection)
        .filter(models.Inspection.inspector_id == current_user.id)
        .order_by(models.Inspection.created_at.desc())
        .all()
    )


@router.get("/{inspection_id}", response_model=schemas.InspectionOut)
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    inspection = (
        db.query(models.Inspection)
        .filter(models.Inspection.id == inspection_id)
        .first()
    )
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    if (
        current_user.role == "area_incharge"
        and inspection.inspector_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not your inspection")
    return inspection
