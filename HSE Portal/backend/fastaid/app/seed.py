from sqlalchemy.orm import Session

from . import models
from .security import hash_password

DEMO_USERS = [
    {
        "employee_id": "AI001",
        "name": "Rahul Sharma",
        "password": "password123",
        "role": "area_incharge",
        "department": "Assembly Line 1",
        "phone": "+91 98765 43210",
        "email": "rahul.sharma@example.com",
        "address": "Plot 14, Industrial Estate, Pune",
    },
    {
        "employee_id": "AI002",
        "name": "Priya Nair",
        "password": "password123",
        "role": "area_incharge",
        "department": "Warehouse",
        "phone": "+91 98765 43211",
        "email": "priya.nair@example.com",
        "address": "Sector 5, Warehouse Complex, Pune",
    },
    {
        "employee_id": "OHC001",
        "name": "Dr. Anita Verma",
        "password": "password123",
        "role": "ohc",
        "department": "Occupational Health Center",
        "phone": "+91 98765 43212",
        "email": "anita.verma@example.com",
        "address": "OHC Building, Plant Campus, Pune",
    },
]

DEMO_BOXES = [
    {"box_number": "FAB-101", "department": "Assembly Line 1", "area": "Zone A", "location": "Near Gate 2"},
    {"box_number": "FAB-102", "department": "Assembly Line 1", "area": "Zone B", "location": "Near Break Room"},
    {"box_number": "FAB-201", "department": "Warehouse", "area": "Zone C", "location": "Loading Dock"},
    {"box_number": "FAB-202", "department": "Warehouse", "area": "Zone D", "location": "Racking Aisle 4"},
    {"box_number": "FAB-301", "department": "Quality Control", "area": "Zone E", "location": "Lab Entrance"},
]


def _next_request_code(db: Session) -> str:
    count = db.query(models.RefillRequest).count()
    return f"RFQ-{count + 1:04d}-DEMO"


def _seed_demo_inspections(db: Session) -> None:
    """A handful of realistic inspections/refill requests so the OHC screens
    (Dashboard, Requests, Records) have varied content on a fresh install
    instead of being empty until someone runs a real inspection."""
    ai001 = db.query(models.User).filter(models.User.employee_id == "AI001").one()
    ai002 = db.query(models.User).filter(models.User.employee_id == "AI002").one()
    boxes = {b.box_number: b for b in db.query(models.Box).all()}

    def with_refill(inspector, box, flagged, status, refilled=False):
        inspection = models.Inspection(box_id=box.id, inspector_id=inspector.id, outcome="refill_requested")
        db.add(inspection)
        db.flush()
        items = {}
        for item_name, item_status, note in flagged:
            item = models.InspectionItem(inspection_id=inspection.id, item_name=item_name, status=item_status, note=note)
            db.add(item)
            db.flush()
            items[item_name] = item
        refill = models.RefillRequest(inspection_id=inspection.id, request_code=_next_request_code(db), status=status)
        db.add(refill)
        db.flush()
        if refilled:
            for item in items.values():
                db.add(models.RefillItem(refill_request_id=refill.id, inspection_item_id=item.id, replacement_note="Replaced with new stock"))
        db.add(
            models.Notification(
                target_role="ohc",
                message=f"New refill request {refill.request_code} for box {box.box_number}",
                refill_request_id=refill.id,
            )
        )

    def clean(inspector, box):
        inspection = models.Inspection(box_id=box.id, inspector_id=inspector.id, outcome="ok")
        db.add(inspection)
        db.flush()
        for item_name in ["First Aid Box Clean Condition", "Box Accessible", "Box Lock/Seal Condition", "Medicine Availability"]:
            db.add(models.InspectionItem(inspection_id=inspection.id, item_name=item_name, status="ok"))

    with_refill(ai001, boxes["FAB-201"], [("Bandages Available", "missing", "Box empty since last week"), ("Antiseptic Solution Available", "expired", "Expired 12/2025")], "pending")
    with_refill(ai002, boxes["FAB-301"], [("Gloves Available", "missing", "Only 1 pair left")], "awaiting_verification")
    with_refill(ai001, boxes["FAB-102"], [("Cotton Available", "expired", "Expired stock")], "pending")
    with_refill(ai002, boxes["FAB-101"], [("Burn Dressing Available", "missing", "Not restocked after last use")], "closed", refilled=True)
    clean(ai001, boxes["FAB-202"])


def seed(db: Session) -> None:
    if db.query(models.User).count() == 0:
        for u in DEMO_USERS:
            db.add(
                models.User(
                    employee_id=u["employee_id"],
                    name=u["name"],
                    password_hash=hash_password(u["password"]),
                    role=u["role"],
                    department=u["department"],
                    phone=u.get("phone"),
                    email=u.get("email"),
                    address=u.get("address"),
                )
            )
    if db.query(models.Box).count() == 0:
        for b in DEMO_BOXES:
            db.add(models.Box(**b))
    db.commit()

    if db.query(models.Inspection).count() == 0:
        _seed_demo_inspections(db)
        db.commit()
