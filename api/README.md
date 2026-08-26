# دفتر — بک‌اند

FastAPI + SQLite. طرح کامل در `../PLAN.md` بند ۱۶. احراز هویت (فاز ۴) و رلهٔ
WebSocket + snapshot (فاز ۵) آماده‌اند؛ ضمیمه‌ها فاز بعدی است.

## رلهٔ Yjs (فاز ۵)

سرور بسته‌های Yjs را هرگز باز نمی‌کند — فقط `seq` می‌دهد، به‌عنوان `BLOB` ذخیره
می‌کند و به بقیهٔ اتصال‌های همان سند پخش می‌کند (بند ۱۴.۴، ۱۶.۱).

```
WS   /sync/{doc_id}                دوطرفه، بستهٔ باینری — نیاز به کوکی نشست معتبر
GET  /sync/{doc_id}/since?seq=N    بازیابی: snapshot (اگر بود) + بسته‌های بعد از N
POST /sync/{doc_id}/snapshot?seq=N بدنه = خروجی Y.encodeStateAsUpdate فشرده‌شده
```

**`--workers 1` اجباری است** (پایین‌تر) چون پخش پیام از یک دیکشنری در حافظهٔ
`app/sync.py` انجام می‌شود.

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

برای تغییر نام کاربری، رمز عبور، یا بازنشانی TOTP کاربر موجود:

```bash
python scripts/manage_user.py
```

منوی تعاملی است. تغییر رمز یا بازنشانی TOTP همهٔ نشست‌های فعال را باطل
می‌کند (باید دوباره وارد شوی)؛ تغییر نام کاربری نه، چون نشست به آن وابسته
نیست.

## اجرا (dev)

```bash
source .venv/bin/activate
python run.py
```

`run.py` معادل کوتاه‌شدهٔ این است — همان دستوری که خودش زیر کاپوت اجرا می‌کند:

```bash
DAFTAR_COOKIE_SECURE=false uvicorn app.main:app --reload --port 8000 --workers 1
```

`DAFTAR_COOKIE_SECURE=false` فقط برای dev محلی روی `http://localhost` لازم است —
مرورگر کوکی `Secure` را روی غیر-HTTPS ذخیره نمی‌کند. روی سرور واقعی این متغیر
را نگذار؛ HTTPS اجباری است (بند ۱۴.۳). `run.py` فقط اگر از قبل در محیط تنظیم
نشده باشد آن را false می‌گذارد، پس برای شبیه‌سازی production کافی است خودت
از قبل `DAFTAR_COOKIE_SECURE=true` صادر کنی.

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
