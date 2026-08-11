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


def _next_violation_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Violation).count()
    return f"SVN-{year}-{count + 1:05d}-DEMO"


def _seed_demo_violations(db: Session) -> None:
    """A handful of realistic violation notices across both agents so the HOD
    Dashboard / Violations screens have varied content on a fresh install."""
    agt001 = db.query(models.User).filter(models.User.employee_id == "AGT001").one()
    agt002 = db.query(models.User).filter(models.User.employee_id == "AGT002").one()

    def make(agent, department, violation_type, offence, employee_name, employee_code, description, status, corrective=None, resolution_note=None):
        violation = models.Violation(
            violation_no=_next_violation_no(db),
            agent_id=agent.id,
            violation_date=datetime.date.today().isoformat(),
            company="Acme Manufacturing Pvt Ltd",
            department=department,
            supervisor="Shift Supervisor",
            employee_name=employee_name,
            employee_code=employee_code,
            job_title="Line Operator",
            violation_type=violation_type,
            offence=offence,
            corrective_actions=",".join(corrective) if corrective else None,
            description=description,
            status=status,
            resolution_note=resolution_note,
        )
        db.add(violation)
        db.flush()
        db.add(
            models.Notification(
                target_role="hod",
                message=f"New safety violation {violation.violation_no} filed by {agent.name}",
                violation_id=violation.id,
            )
        )
        if status != "open":
            db.add(
                models.Notification(
                    target_user_id=agent.id,
                    message=f"{violation.violation_no} was marked {status.replace('_', ' ')} by HOD",
                    violation_id=violation.id,
                )
            )

    make(agt001, "Manufacturing", "PPE Violation", "1st Offence", "Ramesh Yadav", "EMP-2201", "Employee found operating lathe without safety goggles.", "open")
    make(agt001, "Manufacturing", "Unsafe Act", "2nd Offence", "Ajay Patil", "EMP-2214", "Bypassed machine guard interlock to clear a jam.", "under_review", corrective=["Counselling"])
    make(agt002, "Warehouse", "Housekeeping Violation", "1st Offence", "Deepak More", "EMP-3105", "Aisle blocked with pallets, obstructing fire exit route.", "closed", corrective=["Written Reprimand"], resolution_note="Aisle cleared same day; reprimand issued.")
    make(agt002, "Warehouse", "Speeding / Traffic Violation", "3rd Offence", "Suresh Naik", "EMP-3120", "Forklift operated above yard speed limit near pedestrian crossing.", "rejected", resolution_note="Insufficient evidence to substantiate speed claim.")
    make(agt001, "Quality", "Unsafe Condition", "1st Offence", "Meena Joshi", "EMP-2250", "Loose flooring tile near QC lab entrance identified as trip hazard.", "open")


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

    if db.query(models.Violation).count() == 0:
        _seed_demo_violations(db)
        db.commit()
