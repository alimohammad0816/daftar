import os
from pathlib import Path

from dotenv import load_dotenv

API_DIR = Path(__file__).resolve().parent.parent
load_dotenv(API_DIR / ".env")

DATA_DIR = Path(os.environ.get("DAFTAR_DATA_DIR", API_DIR / "data"))
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "daftar.db"

# بند ۱۶.۴: «ضمیمه‌ها روی دیسک... نه داخل SQLite».
BLOBS_DIR = DATA_DIR / "blobs"
BLOBS_DIR.mkdir(parents=True, exist_ok=True)
MAX_BLOB_SIZE = 25 * 1024 * 1024  # بند ۱۲.۶: سقف ۲۵ مگابایت

# رمزنگاری totp_secret در حالت سکون — بند ۱۴.۲: «یک کلید ثابت در متغیر محیطی کافی است».
# scripts/create_user.py اگر این مقدار نبود، یکی می‌سازد و راهنمایی می‌کند.
TOTP_ENC_KEY = os.environ.get("DAFTAR_TOTP_ENC_KEY")

# روی dev محلی (http://localhost) کوکی Secure توسط مرورگر ذخیره نمی‌شود؛ فقط
# برای همین حالت با متغیر محیطی خاموشش کن. روی سرور واقعی همیشه true بماند —
# بند ۱۴.۳: «HTTPS اجباری روی سرور» یکی از چیزهایی است که حذف نمی‌شود.
COOKIE_SECURE = os.environ.get("DAFTAR_COOKIE_SECURE", "true").lower() != "false"

SESSION_COOKIE_NAME = "daftar_session"
SESSION_TTL_DAYS = 30
# تمدید غلتان: اگر کمتر از این مانده بود، انقضا را دوباره کامل کن.
SESSION_RENEW_THRESHOLD_DAYS = 15

PENDING_COOKIE_NAME = "daftar_pending"
PENDING_TTL_SECONDS = 5 * 60

TOTP_WINDOW_PERIODS = 1  # ±۱ دوره — بند ۱۴.۲

RATE_LIMIT_WINDOW_MINUTES = 15
RATE_LIMIT_MAX_ATTEMPTS = 5

# روی production پشت nginx یک origin مشترک‌اند (بند ۱۶.۶) و CORS اصلاً وسط
# نمی‌آید؛ این فقط برای dev محلی است که Next.js و FastAPI پورت جدایند.
CORS_ORIGINS = [o.strip() for o in os.environ.get("DAFTAR_CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
