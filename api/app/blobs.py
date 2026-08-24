import hashlib
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app import config
from app.auth import get_current_session
from app.db import get_connection

router = APIRouter(prefix="/blobs", tags=["blobs"])


def _path_for(hash_: str):
    # بند ۱۶.۴: data/blobs/{hash[:2]}/{hash}
    return config.BLOBS_DIR / hash_[:2] / hash_


@router.post("")
async def upload_blob(file: UploadFile, session=Depends(get_current_session)):
    hasher = hashlib.sha256()
    chunks = []
    size = 0
    while chunk := await file.read(1024 * 1024):
        size += len(chunk)
        if size > config.MAX_BLOB_SIZE:
            raise HTTPException(status_code=413, detail="حجم فایل از ۲۵ مگابایت بیشتر است")
        hasher.update(chunk)
        chunks.append(chunk)
    hash_ = hasher.hexdigest()

    conn = get_connection()
    try:
        existing = conn.execute("SELECT hash FROM blob WHERE hash = ?", (hash_,)).fetchone()
        if existing is None:
            # آدرس‌دهی بر اساس هش محتوا — بند ۱۲.۶: فایل تکراری دوبار نوشته نمی‌شود.
            path = _path_for(hash_)
            path.parent.mkdir(parents=True, exist_ok=True)
            with path.open("wb") as f:
                for chunk in chunks:
                    f.write(chunk)
            conn.execute(
                "INSERT INTO blob (hash, size, mime, created_at) VALUES (?, ?, ?, ?)",
                (hash_, size, file.content_type, datetime.now(UTC).isoformat()),
            )
            conn.commit()
    finally:
        conn.close()

    return {"hash": hash_, "size": size, "mime": file.content_type}


@router.get("/{hash_}")
def download_blob(hash_: str, session=Depends(get_current_session)):
    conn = get_connection()
    try:
        row = conn.execute("SELECT mime FROM blob WHERE hash = ?", (hash_,)).fetchone()
    finally:
        conn.close()
    if row is None:
        raise HTTPException(status_code=404, detail="یافت نشد")

    path = _path_for(hash_)
    if not path.exists():
        raise HTTPException(status_code=404, detail="یافت نشد")

    return FileResponse(path, media_type=row["mime"] or "application/octet-stream")
