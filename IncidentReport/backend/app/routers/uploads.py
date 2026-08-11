import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File

from .. import models, schemas
from ..config import get_settings
from ..deps import get_current_user

router = APIRouter(prefix="/uploads", tags=["uploads"])

settings = get_settings()
UPLOAD_DIR = Path(settings.upload_dir)
UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("", response_model=schemas.UploadOut)
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
):
    ext = Path(file.filename or "").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    destination = UPLOAD_DIR / filename
    contents = await file.read()
    destination.write_bytes(contents)
    return schemas.UploadOut(url=f"/uploads/{filename}")
