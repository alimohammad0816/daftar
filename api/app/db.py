import sqlite3

from app.config import DB_PATH

# بند ۱۶.۲: «در این ابعاد ORM لازم نیست و فقط لایه اضافه می‌کند» — sqlite3 خام.
# جدول‌های doc_update/doc_snapshot/blob فاز ۵/۶ هستند، اینجا نیستند.
SCHEMA = """
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  totp_secret TEXT NOT NULL,
  totp_last_counter INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recovery_code (
  id INTEGER PRIMARY KEY,
  code_hash TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS session (
  token_hash TEXT PRIMARY KEY,
  device_label TEXT,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- بند ۱۶.۴ این جدول را فقط با ip/at/ok توصیف کرده؛ چون «برای مرحلهٔ TOTP
-- جداگانه بشمار» (بند ۱۴.۲) صریحاً خواسته شده و بدون یک ستون که مرحله را
-- جدا کند شدنی نیست، ستون stage اضافه شد.
CREATE TABLE IF NOT EXISTS login_attempt (
  ip TEXT NOT NULL,
  stage TEXT NOT NULL,
  at TEXT NOT NULL,
  ok INTEGER NOT NULL
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()
