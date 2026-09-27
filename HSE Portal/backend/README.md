# Backend services (kept for future use)

The portal currently runs entirely on dummy JSON (`src/pages/<module>/db.json`) and never calls these APIs.
Each folder is the original FastAPI service for its module:

| Folder | Module |
| --- | --- |
| safetyviolation | Safety Violation |
| safetyobservation | Safety Observation |
| incidentreport | Incident Report |
| fastaid | FastAid |

To run one: `cd backend/<module> && python -m venv venv && venv/bin/pip install -r requirements.txt && venv/bin/uvicorn app.main:app --reload`
(copy `.env.example` to `.env` first). The old `venv/` folders were moved along but have stale paths — recreate them.
