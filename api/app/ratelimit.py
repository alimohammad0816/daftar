from datetime import UTC, datetime, timedelta

from app import config
from app.db import get_connection

# بند ۱۴.۲: حداکثر ۵ تلاش ناموفق در ۱۵ دقیقه از هر IP، برای رمز و TOTP جدا.


def is_rate_limited(ip: str, stage: str) -> bool:
    since = (datetime.now(UTC) - timedelta(minutes=config.RATE_LIMIT_WINDOW_MINUTES)).isoformat()
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT COUNT(*) AS n FROM login_attempt WHERE ip = ? AND stage = ? AND ok = 0 AND at > ?",
            (ip, stage, since),
        ).fetchone()
        return row["n"] >= config.RATE_LIMIT_MAX_ATTEMPTS
    finally:
        conn.close()


def record_attempt(ip: str, stage: str, ok: bool) -> None:
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO login_attempt (ip, stage, at, ok) VALUES (?, ?, ?, ?)",
            (ip, stage, datetime.now(UTC).isoformat(), 1 if ok else 0),
        )
        conn.commit()
    finally:
        conn.close()
