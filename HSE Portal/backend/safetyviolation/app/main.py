from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .config import get_settings
from .database import engine, SessionLocal
from .seed import seed
from .routers import auth, violations, notifications, dashboard, uploads

settings = get_settings()

models.Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed(db)

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path(settings.upload_dir).mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(violations.router)
app.include_router(notifications.router)
app.include_router(dashboard.router)
app.include_router(uploads.router)


@app.get("/health")
def health():
    return {"status": "ok"}
