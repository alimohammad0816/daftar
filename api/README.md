# دفتر — بک‌اند

FastAPI + SQLite. طرح کامل در `../PLAN.md` بند ۱۶. فعلاً فقط احراز هویت (فاز ۴)؛
رلهٔ Yjs و ضمیمه‌ها فازهای بعدی‌اند.

## راه‌اندازی

```bash
cd api
uv venv .venv        # یا: python3 -m venv .venv
source .venv/bin/activate
uv pip install -r requirements.txt   # یا: pip install -r requirements.txt

python scripts/create_user.py        # یک‌بار — کاربر اولیه + راز TOTP + کدهای بازیابی
```

`scripts/create_user.py` اگر `DAFTAR_TOTP_ENC_KEY` در `.env` نبود خودش می‌سازد.
این فایل و `data/` را کامیت نکن — هر دو در `.gitignore` هستند.

## اجرا (dev)

```bash
source .venv/bin/activate
DAFTAR_COOKIE_SECURE=false uvicorn app.main:app --reload --port 8000
```

`DAFTAR_COOKIE_SECURE=false` فقط برای dev محلی روی `http://localhost` لازم است —
مرورگر کوکی `Secure` را روی غیر-HTTPS ذخیره نمی‌کند. روی سرور واقعی این متغیر
را نگذار؛ HTTPS اجباری است (بند ۱۴.۳).

فرانت‌اند با `NEXT_PUBLIC_API_URL` (پیش‌فرض `http://localhost:8000`) به اینجا وصل می‌شود.

## متغیرهای محیطی (`api/.env`)

| نام | توضیح |
|---|---|
| `DAFTAR_TOTP_ENC_KEY` | کلید Fernet برای رمزنگاری totp_secret در دیتابیس |
| `DAFTAR_COOKIE_SECURE` | `false` فقط برای dev محلی |
| `DAFTAR_DATA_DIR` | مسیر دیتابیس، پیش‌فرض `api/data` |
| `DAFTAR_CORS_ORIGINS` | مبداهای مجاز، پیش‌فرض `http://localhost:3000` |

## اجرا در production

**`--workers 1` اجباری است** — پخش پیام رلهٔ Yjs (فاز ۵) از یک دیکشنری در
حافظه انجام می‌شود؛ با چند worker دستگاه‌های وصل به workerهای مختلف همدیگر
را نمی‌بینند.
