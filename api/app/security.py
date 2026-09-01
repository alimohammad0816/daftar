import base64
import hashlib
import hmac
import json
import secrets
import time

import pyotp
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from cryptography.fernet import Fernet

from app import config

# بند ۱۴.۲: «پارامترها روی سرور می‌توانند سخاوتمند باشند: m=64MB, t=3, p=1».
# memory_cost واحدش KiB است در argon2-cffi، پس ۶۴ مگابایت یعنی ۶۵۵۳۶.
_password_hasher = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=1)


def hash_password(password: str) -> str:
    return _password_hasher.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    try:
        return _password_hasher.verify(hashed, password)
    except VerifyMismatchError:
        return False
    except Exception:
        return False


def _fernet() -> Fernet:
    if not config.TOTP_ENC_KEY:
        raise RuntimeError(
            "DAFTAR_TOTP_ENC_KEY تنظیم نشده. یک‌بار scripts/create_user.py را اجرا کن."
        )
    return Fernet(config.TOTP_ENC_KEY.encode())


def encrypt_totp_secret(secret: str) -> str:
    return _fernet().encrypt(secret.encode()).decode()


def decrypt_totp_secret(token: str) -> str:
    return _fernet().decrypt(token.encode()).decode()


def new_totp_secret() -> str:
    return pyotp.random_base32()


def totp_uri(secret: str, username: str) -> str:
    # پارامترها را دستکاری نکن — بند ۱۴.۲: Google Authenticator غیر از
    # SHA1/۶رقم/۳۰ثانیه را بی‌صدا اشتباه می‌خواند. pyotp همین‌ها را پیش‌فرض دارد.
    return pyotp.totp.TOTP(secret).provisioning_uri(name=username, issuer_name="Daftar")


def verify_totp_code(secret: str, code: str, last_counter: int) -> int | None:
    """اگر کد معتبر و جدیدتر از آخرین شمارندهٔ مصرف‌شده بود، شمارندهٔ منطبق را
    برمی‌گرداند تا فراخوان آن را ذخیره کند؛ وگرنه None (شامل replay)."""
    totp = pyotp.TOTP(secret)
    current_counter = int(time.time() // 30)
    for offset in range(-config.TOTP_WINDOW_PERIODS, config.TOTP_WINDOW_PERIODS + 1):
        counter = current_counter + offset
        if counter <= last_counter:
            continue
        expected = totp.at(counter * 30)
        if hmac.compare_digest(expected, code):
            return counter
    return None


_RECOVERY_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"  # بدون 0/O/1/I/L مبهم


def _recovery_part(length: int = 5) -> str:
    return "".join(secrets.choice(_RECOVERY_ALPHABET) for _ in range(length))


def generate_recovery_codes(count: int = 10) -> list[str]:
    return [f"{_recovery_part()}-{_recovery_part()}" for _ in range(count)]


def hash_recovery_code(code: str) -> str:
    # کد بازیابی تصادفی و پرآنتروپی است، نه رمز انتخابی کاربر — هش سریع کافی و
    # درست است؛ Argon2 برای این مورد فقط کندی بی‌فایده اضافه می‌کند.
    return hashlib.sha256(code.encode()).hexdigest()


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_session_id() -> str:
    """شناسهٔ عمومی نشست — چیزی که کلاینت برای «خروج از این دستگاه» می‌فرستد.

    عمداً از token_hash مشتق نمی‌شود: آن مقدار از خودِ توکن نشست ساخته شده و
    نباید هیچ‌وقت از سرور بیرون برود. این فقط یک برچسب تصادفیِ بی‌معناست.
    """
    return secrets.token_hex(16)


def _pending_secret() -> bytes:
    return hashlib.sha256((config.TOTP_ENC_KEY or "unset").encode() + b":pending").digest()


def create_pending_token(user_id: int) -> str:
    """کوکی امضاشدهٔ کوتاه‌عمر بین مرحلهٔ رمز و مرحلهٔ TOTP/بازیابی — بدون نیاز
    به ردیف جداگانه در دیتابیس."""
    payload = json.dumps(
        {"uid": user_id, "exp": int(time.time()) + config.PENDING_TTL_SECONDS},
        separators=(",", ":"),
    ).encode()
    sig = hmac.new(_pending_secret(), payload, hashlib.sha256).digest()
    return f"{base64.urlsafe_b64encode(payload).decode()}.{base64.urlsafe_b64encode(sig).decode()}"


def verify_pending_token(token: str) -> int | None:
    try:
        raw_b64, sig_b64 = token.split(".", 1)
        payload = base64.urlsafe_b64decode(raw_b64.encode())
        sig = base64.urlsafe_b64decode(sig_b64.encode())
    except Exception:
        return None
    if not hmac.compare_digest(sig, hmac.new(_pending_secret(), payload, hashlib.sha256).digest()):
        return None
    try:
        data = json.loads(payload)
    except Exception:
        return None
    if data.get("exp", 0) < time.time():
        return None
    return data.get("uid")
