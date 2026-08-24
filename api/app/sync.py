import struct
from base64 import b64encode
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect

from app import config
from app.auth import get_current_session, lookup_session
from app.db import get_connection

router = APIRouter(prefix="/sync", tags=["sync"])

# رلهٔ کور — بند ۱۶.۱/۱۶.۳: سرور هرگز بستهٔ Yjs را باز نمی‌کند، فقط seq می‌دهد
# و به بقیهٔ اتصال‌های همان doc_id پخش می‌کند. یک دیکشنری در حافظه؛ به همین
# دلیل uvicorn باید با --workers 1 اجرا شود (بند ۱۶.۳، api/README.md).
rooms: dict[str, set[WebSocket]] = {}

# پیام‌های سرور→کلاینت روی WS: ۴ بایت seq (big-endian) + بستهٔ خام Yjs. کلاینت
# با این seq می‌فهمد وضعیت محلی‌اش تا کجا با سرور همگام است — بدون این، فشرده‌سازی
# snapshot (پایین) نمی‌تواند مطمئن شود بسته‌ای که کلاینت هنوز ندیده حذف نمی‌شود.
_SEQ_STRUCT = struct.Struct(">I")


def _store_update(doc_id: str, payload: bytes, device_id: str | None) -> int:
    conn = get_connection()
    try:
        seq = conn.execute(
            "SELECT COALESCE(MAX(seq), 0) + 1 FROM doc_update WHERE doc_id = ?", (doc_id,)
        ).fetchone()[0]
        conn.execute(
            "INSERT INTO doc_update (doc_id, seq, payload, device_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (doc_id, seq, payload, device_id, datetime.now(UTC).isoformat()),
        )
        conn.commit()
        return seq
    finally:
        conn.close()


@router.websocket("/{doc_id}")
async def sync_socket(websocket: WebSocket, doc_id: str):
    token = websocket.cookies.get(config.SESSION_COOKIE_NAME)
    conn = get_connection()
    try:
        session = lookup_session(conn, token) if token else None
    finally:
        conn.close()

    # بند ۱۶.۵: «اتصال WebSocket بدون نشست معتبر باید رد شود، نه اینکه بی‌صدا
    # وصل بماند» — پیش از accept() بسته می‌شود تا هندشیک با ۴۰۳ رد شود.
    if session is None:
        await websocket.close(code=1008)
        return

    await websocket.accept()
    room = rooms.setdefault(doc_id, set())
    room.add(websocket)
    try:
        while True:
            payload = await websocket.receive_bytes()
            seq = _store_update(doc_id, payload, session["device_label"])
            framed = _SEQ_STRUCT.pack(seq) + payload
            dead = set()
            for peer in room:
                try:
                    await peer.send_bytes(framed)
                except Exception:
                    dead.add(peer)
            room -= dead
    except WebSocketDisconnect:
        pass
    finally:
        room.discard(websocket)
        if not room:
            rooms.pop(doc_id, None)


@router.get("/{doc_id}/since")
def since(doc_id: str, seq: int = 0, session=Depends(get_current_session)):
    """بند ۱۳.۲: «اتصال تازه آخرین snapshot + همهٔ بسته‌های بعد از آن را می‌گیرد».
    کلاینت این پروژه همیشه seq=0 می‌فرستد (بازیابی کامل، ساده‌تر و برای حجم یک
    کاربر بی‌اهمیت)؛ پارامتر seq برای تطابق با امضای اندپوینت در بند ۱۶.۵ می‌ماند."""
    conn = get_connection()
    try:
        snapshot = conn.execute(
            "SELECT seq, payload FROM doc_snapshot WHERE doc_id = ?", (doc_id,)
        ).fetchone()
        updates = []
        max_seq = seq
        if snapshot is not None and snapshot["seq"] > max_seq:
            updates.append(b64encode(snapshot["payload"]).decode())
            max_seq = snapshot["seq"]
        rows = conn.execute(
            "SELECT seq, payload FROM doc_update WHERE doc_id = ? AND seq > ? ORDER BY seq",
            (doc_id, max_seq),
        ).fetchall()
        for row in rows:
            updates.append(b64encode(row["payload"]).decode())
            max_seq = row["seq"]
    finally:
        conn.close()
    return {"seq": max_seq, "updates": updates}


@router.post("/{doc_id}/snapshot")
async def create_snapshot(doc_id: str, request: Request, seq: int, session=Depends(get_current_session)):
    """کلاینت (بند ۱۳.۲) وقتی لاگ از حدود ۵۰۰ گذشت، حالت کامل و فشرده‌شدهٔ سند
    را می‌فرستد. seq همان بالاترین seqـی است که کلاینت واقعاً دیده — سرور فقط تا
    min(seq, حداکثر seq موجود) حذف می‌کند تا بسته‌ای که کلاینت هنوز ندیده گم نشود."""
    payload = await request.body()
    if not payload:
        raise HTTPException(status_code=400, detail="بدنهٔ خالی")

    conn = get_connection()
    try:
        current_max = conn.execute(
            "SELECT COALESCE(MAX(seq), 0) FROM doc_update WHERE doc_id = ?", (doc_id,)
        ).fetchone()[0]
        safe_seq = min(seq, current_max)

        existing = conn.execute("SELECT seq FROM doc_snapshot WHERE doc_id = ?", (doc_id,)).fetchone()
        if existing is not None and existing["seq"] >= safe_seq:
            return {"seq": existing["seq"]}

        now = datetime.now(UTC).isoformat()
        conn.execute(
            "INSERT INTO doc_snapshot (doc_id, seq, payload, created_at) VALUES (?, ?, ?, ?) "
            "ON CONFLICT(doc_id) DO UPDATE SET seq = excluded.seq, payload = excluded.payload, "
            "created_at = excluded.created_at",
            (doc_id, safe_seq, payload, now),
        )
        conn.execute("DELETE FROM doc_update WHERE doc_id = ? AND seq <= ?", (doc_id, safe_seq))
        conn.commit()
    finally:
        conn.close()
    return {"seq": safe_seq}
