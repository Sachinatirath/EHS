import datetime

from sqlalchemy.orm import Session

from . import models
from .security import hash_password

DEMO_USERS = [
    {
        "employee_id": "AGT001",
        "name": "Vikram Singh",
        "password": "password123",
        "role": "agent",
        "department": "Manufacturing",
        "phone": "+91 98765 11111",
        "email": "vikram.singh@example.com",
        "address": "Plot 22, Industrial Estate, Pune",
    },
    {
        "employee_id": "AGT002",
        "name": "Sunita Rao",
        "password": "password123",
        "role": "agent",
        "department": "Warehouse",
        "phone": "+91 98765 22222",
        "email": "sunita.rao@example.com",
        "address": "Sector 8, Warehouse Complex, Pune",
    },
    {
        "employee_id": "HOD001",
        "name": "Manoj Kulkarni",
        "password": "password123",
        "role": "hod",
        "department": "EHS",
        "phone": "+91 98765 33333",
        "email": "manoj.kulkarni@example.com",
        "address": "HOD Office, Plant Campus, Pune",
    },
]


def _next_incident_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Incident).count()
    return f"INC-{year}-{count + 1:05d}-DEMO"


def _seed_demo_incidents(db: Session) -> None:
    """A handful of realistic incidents across both agents so the HOD
    Dashboard / Incidents screens have varied content on a fresh install."""
    agt001 = db.query(models.User).filter(models.User.employee_id == "AGT001").one()
    agt002 = db.query(models.User).filter(models.User.employee_id == "AGT002").one()

    def make(agent, department, incident_type, severity, location, description, status, corrective_action=None, root_cause=None, preventive_action=None, resolution_note=None):
        incident = models.Incident(
            incident_no=_next_incident_no(db),
            agent_id=agent.id,
            incident_date=datetime.date.today().isoformat(),
            incident_time="10:30",
            reported_by=agent.name,
            department=department,
            location=location,
            description=description,
            incident_type=incident_type,
            severity=severity,
            corrective_action=corrective_action,
            root_cause=root_cause,
            preventive_action=preventive_action,
            status=status,
            resolution_note=resolution_note,
        )
        db.add(incident)
        db.flush()
        db.add(
            models.Notification(
                target_role="hod",
                message=f"New incident {incident.incident_no} reported by {agent.name}",
                incident_id=incident.id,
            )
        )
        if status != "open":
            db.add(
                models.Notification(
                    target_user_id=agent.id,
                    message=f"{incident.incident_no} was marked {status.replace('_', ' ')} by HOD",
                    incident_id=incident.id,
                )
            )

    make(agt001, "Manufacturing", "First Aid", "Low", "Press Line 2", "Operator sustained minor cut while clearing a jam.", "open")
    make(agt001, "Manufacturing", "Near Miss", "Medium", "Zone B walkway", "Suspended load swung close to a walkway during a lift.", "under_investigation", corrective_action="Area cordoned off, crane operator briefed.")
    make(agt002, "Warehouse", "Lost Time Injury", "High", "Loading Dock 3", "Forklift operator strained back lifting a pallet manually.", "closed", root_cause="Pallet jack unavailable at time of lift.", preventive_action="Additional pallet jacks procured; manual lifting SOP reissued.", resolution_note="Verified corrective actions implemented; case closed.")
    make(agt002, "Warehouse", "Property Damage", "Medium", "Racking Aisle 4", "Forklift clipped a rack upright, causing minor structural damage.", "under_investigation", corrective_action="Aisle taped off pending structural inspection.")
    make(agt001, "Utilities", "Environmental", "Critical", "Chemical Storage Yard", "Minor solvent leak detected from a storage drum.", "open")


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
        db.commit()

    if db.query(models.Incident).count() == 0:
        _seed_demo_incidents(db)
        db.commit()
