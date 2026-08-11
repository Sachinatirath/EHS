"""One-off script to enrich an already-seeded dev database with a few more
realistic inspections/refill requests, so the OHC screens have varied demo
content to show instead of just whatever the tester happened to submit."""
import sys

sys.path.insert(0, ".")

from app.database import SessionLocal
from app import models


def get_user(db, employee_id):
    return db.query(models.User).filter(models.User.employee_id == employee_id).one()


def get_box(db, box_number):
    return db.query(models.Box).filter(models.Box.box_number == box_number).one()


def next_code(db):
    count = db.query(models.RefillRequest).count()
    return f"RFQ-{count + 1:04d}-DEMO"


def make_inspection_with_refill(db, inspector, box, flagged, request_status, refilled=False):
    inspection = models.Inspection(box_id=box.id, inspector_id=inspector.id, outcome="refill_requested")
    db.add(inspection)
    db.flush()

    items_by_name = {}
    for item_name, status, note in flagged:
        item = models.InspectionItem(inspection_id=inspection.id, item_name=item_name, status=status, note=note)
        db.add(item)
        db.flush()
        items_by_name[item_name] = item

    refill = models.RefillRequest(inspection_id=inspection.id, request_code=next_code(db), status=request_status)
    db.add(refill)
    db.flush()

    if refilled:
        for item_name, item in items_by_name.items():
            db.add(
                models.RefillItem(
                    refill_request_id=refill.id,
                    inspection_item_id=item.id,
                    replacement_note=f"Replaced with new stock (batch DEMO-{item.id})",
                )
            )

    db.add(
        models.Notification(
            target_role="ohc",
            message=f"New refill request {refill.request_code} for box {box.box_number}",
            refill_request_id=refill.id,
        )
    )
    return inspection, refill


def make_clean_inspection(db, inspector, box):
    inspection = models.Inspection(box_id=box.id, inspector_id=inspector.id, outcome="ok")
    db.add(inspection)
    db.flush()
    for item_name in ["First Aid Box Clean Condition", "Box Accessible", "Box Lock/Seal Condition", "Medicine Availability"]:
        db.add(models.InspectionItem(inspection_id=inspection.id, item_name=item_name, status="ok"))
    return inspection


def main():
    db = SessionLocal()
    try:
        ai001 = get_user(db, "AI001")
        ai002 = get_user(db, "AI002")

        fab201 = get_box(db, "FAB-201")
        fab301 = get_box(db, "FAB-301")
        fab102 = get_box(db, "FAB-102")
        fab202 = get_box(db, "FAB-202")

        make_inspection_with_refill(
            db, ai002, fab201,
            [("Gloves Available", "missing", "Only 1 pair left")],
            "awaiting_verification",
        )
        make_inspection_with_refill(
            db, ai001, fab301,
            [("Cotton Available", "expired", "Expired 12/2025")],
            "pending",
        )
        make_inspection_with_refill(
            db, ai002, fab102,
            [("Burn Dressing Available", "missing", "Not restocked after last use")],
            "closed",
            refilled=True,
        )
        make_clean_inspection(db, ai001, fab202)

        db.commit()
        print("Seeded additional demo inspections/refill requests.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
