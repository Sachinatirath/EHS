import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _month_start() -> datetime.datetime:
    now = datetime.datetime.utcnow()
    return datetime.datetime(now.year, now.month, 1)


@router.get("/my-summary", response_model=schemas.AgentSummary)
def my_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("agent")),
):
    mine = db.query(models.Violation).filter(models.Violation.agent_id == current_user.id)
    return schemas.AgentSummary(
        total_created=mine.count(),
        open_count=mine.filter(models.Violation.status == "open").count(),
        under_review_count=mine.filter(models.Violation.status == "under_review").count(),
        closed_this_month=mine.filter(
            models.Violation.status == "closed",
            models.Violation.updated_at >= _month_start(),
        ).count(),
    )


@router.get("/summary", response_model=schemas.HodSummary)
def summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("hod")),
):
    all_violations = db.query(models.Violation)
    return schemas.HodSummary(
        total_violations=all_violations.count(),
        open_count=all_violations.filter(models.Violation.status == "open").count(),
        under_review_count=all_violations.filter(models.Violation.status == "under_review").count(),
        reported_this_month=all_violations.filter(
            models.Violation.created_at >= _month_start()
        ).count(),
        rejected_count=all_violations.filter(models.Violation.status == "rejected").count(),
    )
