# یک ایمیج، دو پردازه (web + api) — طبق درخواست، بدون nginx جلو (بند ۱۶.۲
# چیدمان جایگزین را پیشنهاد می‌داد ولی برای اپ تک‌کاربره لازم نیست). هر دو
# پورت مستقیماً بیرون می‌آیند: 3000 برای Next.js، 8000 برای FastAPI.

# ---------- مرحلهٔ ۱: ساخت فرانت‌اند ----------
FROM node:20-bookworm-slim AS web-builder
WORKDIR /app/web

COPY web/package.json web/yarn.lock web/.yarnrc.yml ./
RUN corepack enable && yarn install --immutable

COPY web/ ./

# NEXT_PUBLIC_* در Next.js زمان build داخل باندل جاوااسکریپت جاسازی می‌شود، نه
# زمان اجرا — پس باید همین‌جا به‌عنوان build arg بیاید. مقدار پیش‌فرض برای حالتی
# است که مرورگر و کانتینر روی یک هاست‌اند (docker-compose محلی با پورت‌های
# مپ‌شدهٔ ۱:۱). برای دامنهٔ واقعی، هنگام build ایمیج override کن.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN yarn build

# ---------- مرحلهٔ نهایی: اجرای هر دو سرویس ----------
FROM node:20-bookworm-slim

# Next.js standalone به node نیاز دارد (بیس ایمیج از قبل دارد)؛ FastAPI به
# python3. هر دو در یک کانتینر چون کاربر همین را خواست.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --- بک‌اند ---
COPY api/requirements.txt ./api/requirements.txt
RUN python3 -m venv /app/api/.venv \
    && /app/api/.venv/bin/pip install --no-cache-dir -r /app/api/requirements.txt
COPY api/app ./api/app
COPY api/scripts ./api/scripts

# --- فرانت‌اند (خروجی standalone: server.js + node_modules هرس‌شده) ---
COPY --from=web-builder /app/web/.next/standalone ./web
COPY --from=web-builder /app/web/.next/static ./web/.next/static
COPY --from=web-builder /app/web/public ./web/public

# قاعدهٔ همیشگی CLAUDE.md: پخش پیام رلهٔ Yjs از حافظهٔ یک پردازه است — با چند
# worker دستگاه‌های وصل‌شده به workerهای مختلف همدیگر را نمی‌بینند. این عدد
# در start.sh هم صریح هاردکد شده، اینجا فقط یادآوری است.
ENV DAFTAR_DATA_DIR=/app/api/data
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY docker/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000 8000
VOLUME ["/app/api/data"]

CMD ["/app/start.sh"]
