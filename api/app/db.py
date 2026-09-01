import sqlite3

from app import security
from app.config import DB_PATH

# بند ۱۶.۲: «در این ابعاد ORM لازم نیست و فقط لایه اضافه می‌کند» — sqlite3 خام.
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
  -- شناسهٔ عمومی، فقط برای آدرس‌دهی از سمت کلاینت (خروج از یک دستگاه خاص).
  -- کلید اصلی نیست تا token_hash همان نقش قبلی‌اش را نگه دارد.
  id TEXT,
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

-- بند ۱۶.۴ — رلهٔ کور: payload هرگز parse نمی‌شود، حتی برای دیباگ (بند ۱۴.۴).
CREATE TABLE IF NOT EXISTS doc_update (
  doc_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  payload BLOB NOT NULL,
  device_id TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (doc_id, seq)
);

CREATE TABLE IF NOT EXISTS doc_snapshot (
  doc_id TEXT PRIMARY KEY,
  seq INTEGER NOT NULL,
  payload BLOB NOT NULL,
  created_at TEXT NOT NULL
);

-- بند ۱۶.۴ — خودِ فایل روی دیسک در data/blobs/{hash[:2]}/{hash} است، نه اینجا.
CREATE TABLE IF NOT EXISTS blob (
  hash TEXT PRIMARY KEY,
  size INTEGER NOT NULL,
  mime TEXT,
  created_at TEXT NOT NULL
);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _migrate(conn: sqlite3.Connection) -> None:
    """مهاجرت‌های سبک برای دیتابیس‌هایی که از قبل ساخته شده‌اند.

    `CREATE TABLE IF NOT EXISTS` ستون تازه را به جدول موجود اضافه نمی‌کند، پس
    ستون `session.id` باید دستی افزوده و برای ردیف‌های موجود پر شود — وگرنه
    نشست‌های قبلیِ کاربر شناسه‌ای ندارند و از فهرست دستگاه‌ها قابل بستن نیستند.
    """
    columns = {row["name"] for row in conn.execute("PRAGMA table_info(session)")}
    if "id" not in columns:
        conn.execute("ALTER TABLE session ADD COLUMN id TEXT")
        # SQLite در ALTER TABLE مقدار پیش‌فرضِ غیرثابت نمی‌پذیرد، پس پر کردن
        # ردیف‌های موجود ردیف‌به‌ردیف انجام می‌شود (تعدادشان انگشت‌شمار است).
        for row in conn.execute("SELECT token_hash FROM session").fetchall():
            conn.execute(
                "UPDATE session SET id = ? WHERE token_hash = ?",
                (security.generate_session_id(), row["token_hash"]),
            )
    # ALTER TABLE قید UNIQUE نمی‌پذیرد؛ ایندکس یکتا همان تضمین را می‌دهد.
    conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS session_id_idx ON session(id)")


def init_db() -> None:
    conn = get_connection()
    try:
        conn.executescript(SCHEMA)
        _migrate(conn)
        conn.commit()
    finally:
        conn.close()
