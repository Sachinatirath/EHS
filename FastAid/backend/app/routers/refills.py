from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db, get_current_user, require_role

router = APIRouter(prefix="/refills", tags=["refills"])


@router.get("", response_model=list[schemas.RefillRequestSummaryOut])
def list_refills(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ohc")),
):
    query = db.query(models.RefillRequest)
    if status:
        query = query.filter(models.RefillRequest.status == status)
    requests = query.order_by(models.RefillRequest.created_at.desc()).all()

    results = []
    for r in requests:
        flagged_count = sum(1 for i in r.inspection.items if i.status != "ok")
        results.append(
            schemas.RefillRequestSummaryOut(
                id=r.id,
                request_code=r.request_code,
                status=r.status,
                created_at=r.created_at,
                box=schemas.BoxOut.model_validate(r.inspection.box),
                flagged_item_count=flagged_count,
            )
        )
    return results


def _get_refill_or_404(db: Session, refill_id: int) -> models.RefillRequest:
    refill = (
        db.query(models.RefillRequest)
        .filter(models.RefillRequest.id == refill_id)
        .first()
    )
    if not refill:
        raise HTTPException(status_code=404, detail="Refill request not found")
    return refill


@router.get("/{refill_id}", response_model=schemas.RefillRequestOut)
def get_refill(
    refill_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    refill = _get_refill_or_404(db, refill_id)
    if (
        current_user.role == "area_incharge"
        and refill.inspection.inspector_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Not your refill request")
    return refill


@router.post("/{refill_id}/submit", response_model=schemas.RefillRequestOut)
def submit_refill(
    refill_id: int,
    payload: schemas.RefillSubmitRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("ohc")),
):
    refill = _get_refill_or_404(db, refill_id)
    if refill.status not in ("pending", "rejected"):
        raise HTTPException(
            status_code=400, detail=f"Cannot submit refill in status '{refill.status}'"
        )

    flagged_ids = {i.id for i in refill.inspection.items if i.status != "ok"}
    for item in payload.items:
        if item.inspection_item_id not in flagged_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Inspection item {item.inspection_item_id} was not flagged",
            )

    # replace any previous refill items (e.g. after a rejection)
    for existing in list(refill.refill_items):
        refill.refill_items.remove(existing)
    db.flush()

    for item in payload.items:
        db.add(
            models.RefillItem(
                refill_request_id=refill.id,
                inspection_item_id=item.inspection_item_id,
                replacement_note=item.replacement_note,
                photo_url=item.photo_url,
            )
        )

    refill.status = "awaiting_verification"
    refill.rejection_reason = None
    db.add(refill)
    db.add(
        models.Notification(
            target_user_id=refill.inspection.inspector_id,
            message=f"OHC has completed refill for box {refill.inspection.box.box_number} ({refill.request_code}). Please re-verify.",
            refill_request_id=refill.id,
        )
    )
    db.commit()
    db.refresh(refill)
    return refill


@router.post("/{refill_id}/verify", response_model=schemas.RefillRequestOut)
def verify_refill(
    refill_id: int,
    payload: schemas.VerifyDecisionRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role("area_incharge")),
):
    refill = _get_refill_or_404(db, refill_id)
    if refill.inspection.inspector_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your refill request")
    if refill.status != "awaiting_verification":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot verify refill in status '{refill.status}'",
        )

    if payload.decision == "accept":
        refill.status = "closed"
        refill.inspection.outcome = "closed_ok"
        db.add(refill.inspection)
        db.add(
            models.Notification(
                target_role="ohc",
                message=f"{refill.request_code} for box {refill.inspection.box.box_number} was accepted and closed.",
                refill_request_id=refill.id,
            )
        )
    else:
        refill.status = "rejected"
        refill.rejection_reason = payload.reason
        db.add(
            models.Notification(
                target_role="ohc",
                message=f"{refill.request_code} for box {refill.inspection.box.box_number} was rejected: {payload.reason or 'no reason given'}",
                refill_request_id=refill.id,
            )
        )

    db.add(refill)
    db.commit()
    db.refresh(refill)
    return refill
