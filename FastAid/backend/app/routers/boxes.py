from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user

router = APIRouter(prefix="/boxes", tags=["boxes"])


@router.get("", response_model=list[schemas.BoxOut])
def list_boxes(
    search: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    query = db.query(models.Box)
    if department:
        query = query.filter(models.Box.department == department)
    if search:
        like = f"%{search}%"
        query = query.filter(models.Box.box_number.ilike(like))
    return query.order_by(models.Box.box_number).all()


@router.get("/{box_id}", response_model=schemas.BoxDetailOut)
def get_box(
    box_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    box = db.query(models.Box).filter(models.Box.id == box_id).first()
    if not box:
        raise HTTPException(status_code=404, detail="Box not found")

    last_inspection = (
        db.query(models.Inspection)
        .filter(models.Inspection.box_id == box_id)
        .order_by(models.Inspection.created_at.desc())
        .first()
    )
    result = schemas.BoxDetailOut.model_validate(box)
    if last_inspection:
        result.last_inspection_at = last_inspection.created_at
        result.last_inspection_outcome = last_inspection.outcome
    return result
