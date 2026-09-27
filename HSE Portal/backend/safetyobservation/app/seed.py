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


def _next_observation_no(db: Session) -> str:
    year = datetime.datetime.utcnow().year
    count = db.query(models.Observation).count()
    return f"SOB-{year}-{count + 1:05d}-DEMO"


def _seed_demo_observations(db: Session) -> None:
    """A handful of realistic observations across both agents so the HOD
    Dashboard / Observations screens have varied content on a fresh install."""
    agt001 = db.query(models.User).filter(models.User.employee_id == "AGT001").one()
    agt002 = db.query(models.User).filter(models.User.employee_id == "AGT002").one()

    def make(agent, department, category, severity, description, status, corrective_action=None, resolution_note=None):
        observation = models.Observation(
            observation_no=_next_observation_no(db),
            agent_id=agent.id,
            observer_name=agent.name,
            observer_employee_code=agent.employee_id,
            department=department,
            observation_date=datetime.date.today().isoformat(),
            plant="Main Plant",
            area=department,
            location="Shop Floor",
            observation_time="10:30",
            category=category,
            description=description,
            severity=severity,
            corrective_action=corrective_action,
            status=status,
            resolution_note=resolution_note,
        )
        db.add(observation)
        db.flush()
        db.add(
            models.Notification(
                target_role="hod",
                message=f"New safety observation {observation.observation_no} filed by {agent.name}",
                observation_id=observation.id,
            )
        )
        if status != "open":
            db.add(
                models.Notification(
                    target_user_id=agent.id,
                    message=f"{observation.observation_no} was marked {status.replace('_', ' ')} by HOD",
                    observation_id=observation.id,
                )
            )

    make(agt001, "Manufacturing", "PPE Non-Compliance", "Medium", "Operator seen without ear protection near press machine.", "open")
    make(agt001, "Manufacturing", "Unsafe Condition", "High", "Oil spill near walkway not cordoned off.", "under_review", corrective_action="Area barricaded, cleanup crew notified.")
    make(agt002, "Warehouse", "Housekeeping", "Low", "Empty pallets stacked too close to fire extinguisher access.", "closed", corrective_action="Pallets relocated.", resolution_note="Verified clear on follow-up walk.")
    make(agt002, "Warehouse", "Near Miss", "Critical", "Forklift nearly collided with pedestrian at blind corner.", "under_review", corrective_action="Convex mirror requested for corner.")
    make(agt001, "Quality", "Good Practice", "Low", "QC technician proactively flagged mislabeled batch before dispatch.", "closed", resolution_note="Acknowledged; shared as best practice in toolbox talk.")


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

    if db.query(models.Observation).count() == 0:
        _seed_demo_observations(db)
        db.commit()
