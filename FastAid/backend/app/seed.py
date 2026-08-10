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
    },
    {
        "employee_id": "AI002",
        "name": "Priya Nair",
        "password": "password123",
        "role": "area_incharge",
        "department": "Warehouse",
    },
    {
        "employee_id": "OHC001",
        "name": "Dr. Anita Verma",
        "password": "password123",
        "role": "ohc",
        "department": "Occupational Health Center",
    },
]

DEMO_BOXES = [
    {"box_number": "FAB-101", "department": "Assembly Line 1", "area": "Zone A", "location": "Near Gate 2"},
    {"box_number": "FAB-102", "department": "Assembly Line 1", "area": "Zone B", "location": "Near Break Room"},
    {"box_number": "FAB-201", "department": "Warehouse", "area": "Zone C", "location": "Loading Dock"},
    {"box_number": "FAB-202", "department": "Warehouse", "area": "Zone D", "location": "Racking Aisle 4"},
    {"box_number": "FAB-301", "department": "Quality Control", "area": "Zone E", "location": "Lab Entrance"},
]


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
                )
            )
    if db.query(models.Box).count() == 0:
        for b in DEMO_BOXES:
            db.add(models.Box(**b))
    db.commit()
