import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _month_start() -> datetime.datetime:
    now = datetime.datetime.utcnow()
    return datetime.datetime(now.year, now.month, 1)


@router.get("/my-summary", response_model=schemas.AreaInchargeSummary)
def my_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("area_incharge")),
):
    boxes_assigned = db.query(models.Box).count()
    inspected_this_month = (
        db.query(models.Inspection)
        .filter(
            models.Inspection.inspector_id == current_user.id,
            models.Inspection.created_at >= _month_start(),
        )
        .count()
    )
    pending_actions = (
        db.query(models.RefillRequest)
        .join(models.Inspection)
        .filter(
            models.Inspection.inspector_id == current_user.id,
            models.RefillRequest.status.in_(["pending", "awaiting_verification"]),
        )
        .count()
    )
    return schemas.AreaInchargeSummary(
        boxes_assigned=boxes_assigned,
        inspected_this_month=inspected_this_month,
        pending_actions=pending_actions,
    )


@router.get("/summary", response_model=schemas.OhcSummary)
def summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ohc")),
):
    total_boxes = db.query(models.Box).count()
    pending_refill_requests = (
        db.query(models.RefillRequest)
        .filter(models.RefillRequest.status.in_(["pending", "awaiting_verification"]))
        .count()
    )
    inspections_this_month = (
        db.query(models.Inspection)
        .filter(models.Inspection.created_at >= _month_start())
        .count()
    )

    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    boxes = db.query(models.Box).all()
    overdue_boxes = 0
    for box in boxes:
        last = (
            db.query(models.Inspection)
            .filter(models.Inspection.box_id == box.id)
            .order_by(models.Inspection.created_at.desc())
            .first()
        )
        if not last or last.created_at < cutoff:
            overdue_boxes += 1

    return schemas.OhcSummary(
        total_boxes=total_boxes,
        pending_refill_requests=pending_refill_requests,
        inspections_this_month=inspections_this_month,
        overdue_boxes=overdue_boxes,
    )
