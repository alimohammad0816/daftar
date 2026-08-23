import sqlite3
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel

from app import config, ratelimit, security
from app.db import get_connection

router = APIRouter(prefix="/auth", tags=["auth"])

# تک‌کاربره بودن یعنی جای انکار نام کاربری زیاد نیست، ولی ارزان است که وقتی
# کاربر نیست هم زمان پاسخ همان اندازهٔ رمز غلط بماند — یک هش ثابت برای مقایسه
# وقتی ردیفی در کار نیست، تا verify_password همیشه واقعاً اجرا شود.
_DUMMY_HASH = security.hash_password("daftar-dummy-hash-for-constant-time-compare")


class LoginBody(BaseModel):
    username: str
    password: str


class CodeBody(BaseModel):
    code: str


def _client_ip(request: Request) -> str:
    # فاز ۴ هنوز nginx جلو نیست (بند ۱۶.۶ فاز ۵ می‌آید)، پس request.client.host
    # همان IP واقعی کلاینت است. با اضافه‌شدن پروکسی، اینجا باید X-Forwarded-For
    # را از یک پروکسی مورد اعتماد بخواند، نه کورکورانه از هدر.
    return request.client.host if request.client else "unknown"


def _create_session(conn: sqlite3.Connection, device_label: str | None) -> str:
    token = security.generate_session_token()
    now = datetime.now(UTC)
    expires = now + timedelta(days=config.SESSION_TTL_DAYS)
    conn.execute(
        "INSERT INTO session (token_hash, device_label, created_at, last_seen_at, expires_at) "
        "VALUES (?, ?, ?, ?, ?)",
        (
            security.hash_session_token(token),
            device_label,
            now.isoformat(),
            now.isoformat(),
            expires.isoformat(),
        ),
    )
    return token


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        config.SESSION_COOKIE_NAME,
        token,
        max_age=config.SESSION_TTL_DAYS * 86400,
        httponly=True,
        secure=config.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def _set_pending_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        config.PENDING_COOKIE_NAME,
        token,
        max_age=config.PENDING_TTL_SECONDS,
        httponly=True,
        secure=config.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


def _require_pending_user(request: Request) -> int:
    token = request.cookies.get(config.PENDING_COOKIE_NAME)
    user_id = security.verify_pending_token(token) if token else None
    if user_id is None:
        raise HTTPException(status_code=401, detail="ابتدا نام کاربری و رمز عبور را وارد کن")
    return user_id


def get_current_session(request: Request, response: Response) -> sqlite3.Row:
    """برای مسیرهای فاز‌های بعدی هم قابل استفاده است — بند ۱۶.۵: «همهٔ مسیرها
    جز /auth/* نیازمند نشست معتبرند»."""
    token = request.cookies.get(config.SESSION_COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="نشست معتبر نیست")

    token_hash = security.hash_session_token(token)
    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM session WHERE token_hash = ?", (token_hash,)).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="نشست معتبر نیست")

        now = datetime.now(UTC)
        expires_at = datetime.fromisoformat(row["expires_at"])
        if expires_at < now:
            conn.execute("DELETE FROM session WHERE token_hash = ?", (token_hash,))
            conn.commit()
            raise HTTPException(status_code=401, detail="نشست منقضی شده — دوباره وارد شو")

        # تمدید غلتان — بند ۱۴.۲: «عمر بلند (۳۰ روز) با تمدید غلتان»
        new_expires = expires_at
        if expires_at - now < timedelta(days=config.SESSION_RENEW_THRESHOLD_DAYS):
            new_expires = now + timedelta(days=config.SESSION_TTL_DAYS)
            _set_session_cookie(response, token)

        conn.execute(
            "UPDATE session SET last_seen_at = ?, expires_at = ? WHERE token_hash = ?",
            (now.isoformat(), new_expires.isoformat(), token_hash),
        )
        conn.commit()
        return row
    finally:
        conn.close()


@router.post("/login")
def login(body: LoginBody, request: Request, response: Response):
    ip = _client_ip(request)
    if ratelimit.is_rate_limited(ip, "password"):
        raise HTTPException(status_code=429, detail="تلاش ناموفق زیاد بود؛ کمی بعد دوباره امتحان کن")

    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM user WHERE username = ?", (body.username,)).fetchone()
    finally:
        conn.close()

    password_hash = row["password_hash"] if row is not None else _DUMMY_HASH
    password_ok = security.verify_password(body.password, password_hash)
    ok = row is not None and password_ok
    ratelimit.record_attempt(ip, "password", ok)
    if not ok:
        raise HTTPException(status_code=401, detail="نام کاربری یا رمز عبور اشتباه است")

    _set_pending_cookie(response, security.create_pending_token(row["id"]))
    return {"status": "totp_required"}


@router.post("/totp")
def verify_totp(body: CodeBody, request: Request, response: Response):
    ip = _client_ip(request)
    if ratelimit.is_rate_limited(ip, "totp"):
        raise HTTPException(status_code=429, detail="تلاش ناموفق زیاد بود؛ کمی بعد دوباره امتحان کن")

    user_id = _require_pending_user(request)

    conn = get_connection()
    try:
        row = conn.execute("SELECT * FROM user WHERE id = ?", (user_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=401, detail="کاربر یافت نشد")

        secret = security.decrypt_totp_secret(row["totp_secret"])
        matched_counter = security.verify_totp_code(secret, body.code.strip(), row["totp_last_counter"])
        ok = matched_counter is not None
        ratelimit.record_attempt(ip, "totp", ok)
        if not ok:
            raise HTTPException(status_code=401, detail="کد نامعتبر است")

        conn.execute("UPDATE user SET totp_last_counter = ? WHERE id = ?", (matched_counter, row["id"]))
        token = _create_session(conn, request.headers.get("user-agent"))
        conn.commit()
        username = row["username"]
    finally:
        conn.close()

    response.delete_cookie(config.PENDING_COOKIE_NAME, path="/")
    _set_session_cookie(response, token)
    return {"username": username}


@router.post("/recovery")
def use_recovery_code(body: CodeBody, request: Request, response: Response):
    ip = _client_ip(request)
    # همان bucket با TOTP — هر دو جایگزین مرحلهٔ دوم‌اند، برای brute-force فرقی ندارد.
    if ratelimit.is_rate_limited(ip, "totp"):
        raise HTTPException(status_code=429, detail="تلاش ناموفق زیاد بود؛ کمی بعد دوباره امتحان کن")

    user_id = _require_pending_user(request)
    code_hash = security.hash_recovery_code(body.code.strip().upper())

    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM recovery_code WHERE code_hash = ? AND used_at IS NULL", (code_hash,)
        ).fetchone()
        ok = row is not None
        ratelimit.record_attempt(ip, "totp", ok)
        if not ok:
            raise HTTPException(status_code=401, detail="کد بازیابی نامعتبر یا قبلاً استفاده‌شده است")

        conn.execute(
            "UPDATE recovery_code SET used_at = ? WHERE id = ?", (datetime.now(UTC).isoformat(), row["id"])
        )
        user = conn.execute("SELECT username FROM user WHERE id = ?", (user_id,)).fetchone()
        token = _create_session(conn, request.headers.get("user-agent"))
        conn.commit()
        username = user["username"] if user else None
    finally:
        conn.close()

    response.delete_cookie(config.PENDING_COOKIE_NAME, path="/")
    _set_session_cookie(response, token)
    return {"username": username}


@router.post("/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get(config.SESSION_COOKIE_NAME)
    if token:
        conn = get_connection()
        try:
            conn.execute("DELETE FROM session WHERE token_hash = ?", (security.hash_session_token(token),))
            conn.commit()
        finally:
            conn.close()
    response.delete_cookie(config.SESSION_COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me")
def me(session: sqlite3.Row = Depends(get_current_session)):
    conn = get_connection()
    try:
        user = conn.execute("SELECT username FROM user LIMIT 1").fetchone()
    finally:
        conn.close()
    return {
        "username": user["username"] if user else None,
        "device_label": session["device_label"],
        "created_at": session["created_at"],
        "expires_at": session["expires_at"],
    }
