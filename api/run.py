#!/usr/bin/env python3
"""اجرای سرور برای dev محلی: cd api && source .venv/bin/activate && python run.py

جایگزین دستور طولانی در README — DAFTAR_COOKIE_SECURE=false را خودش می‌گذارد
(اگر از قبل در محیط تنظیم نشده باشد) چون فقط dev محلی روی http لازمش دارد.
--workers 1 همیشه ثابت است (بند ۱۶.۳: پخش پیام رلهٔ Yjs از حافظه است).
"""

import os

import uvicorn

os.environ.setdefault("DAFTAR_COOKIE_SECURE", "false")

if __name__ == "__main__":
    uvicorn.run("app.main:app", port=8000, reload=True, workers=1)
