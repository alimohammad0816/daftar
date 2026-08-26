#!/usr/bin/env bash
# هر دو سرویس را در یک کانتینر بالا می‌آورد. --workers 1 برای uvicorn اجباری
# است (CLAUDE.md، قاعدهٔ ۵) — رلهٔ Yjs پیام‌ها را از یک دیکشنری در حافظه پخش
# می‌کند و چند worker آن را بی‌صدا می‌شکند.
set -euo pipefail

cd /app/api
/app/api/.venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1 &
API_PID=$!

cd /app/web
node server.js &
WEB_PID=$!

shutdown() {
  kill -TERM "$API_PID" "$WEB_PID" 2>/dev/null || true
  wait "$API_PID" "$WEB_PID" 2>/dev/null || true
}
trap shutdown TERM INT

# هر کدام زودتر متوقف شد، یعنی چیزی خراب است — دیگری را هم می‌بندیم و کانتینر
# با همان کد خروجی تمام می‌شود تا docker/کوبرنتیز ری‌استارتش کند.
wait -n "$API_PID" "$WEB_PID"
EXIT_CODE=$?
shutdown
exit $EXIT_CODE
