#!/usr/bin/env python3
"""راه‌اندازی اولیه — بند ۱۴.۲: «ثبت‌نام عمومی وجود ندارد، کاربر اولیه با یک
اسکریپت CLI ساخته می‌شود». یک‌بار اجرا شود.

اجرا: cd api && source .venv/bin/activate && python scripts/create_user.py
"""

import getpass
import os
import sys
from datetime import UTC, datetime
from pathlib import Path

API_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_DIR))

ENV_PATH = API_DIR / ".env"


def ensure_totp_key() -> None:
    if os.environ.get("DAFTAR_TOTP_ENC_KEY"):
        return

    existing = ENV_PATH.read_text() if ENV_PATH.exists() else ""
    for line in existing.splitlines():
        if line.startswith("DAFTAR_TOTP_ENC_KEY="):
            os.environ["DAFTAR_TOTP_ENC_KEY"] = line.split("=", 1)[1].strip()
            return

    from cryptography.fernet import Fernet

    key = Fernet.generate_key().decode()
    with ENV_PATH.open("a") as f:
        f.write(f"DAFTAR_TOTP_ENC_KEY={key}\n")
    os.environ["DAFTAR_TOTP_ENC_KEY"] = key
    print(f"کلید رمزنگاری TOTP ساخته و در {ENV_PATH} نوشته شد.")


def main() -> None:
    ensure_totp_key()

    from app import security
    from app.db import get_connection, init_db

    init_db()
    conn = get_connection()

    existing = conn.execute("SELECT COUNT(*) AS n FROM user").fetchone()
    if existing["n"] > 0:
        print("یک کاربر از قبل وجود دارد؛ این اسکریپت فقط برای راه‌اندازی اولیه است.")
        conn.close()
        return

    username = input("نام کاربری: ").strip()
    while not username:
        username = input("نام کاربری (نمی‌تواند خالی باشد): ").strip()

    password = getpass.getpass("رمز عبور: ")
    confirm = getpass.getpass("تکرار رمز عبور: ")
    while not password or password != confirm:
        print("رمزها یکی نیستند یا خالی‌اند.")
        password = getpass.getpass("رمز عبور: ")
        confirm = getpass.getpass("تکرار رمز عبور: ")

    totp_secret = security.new_totp_secret()
    now = datetime.now(UTC).isoformat()

    conn.execute(
        "INSERT INTO user (username, password_hash, totp_secret, totp_last_counter, created_at) "
        "VALUES (?, ?, ?, 0, ?)",
        (username, security.hash_password(password), security.encrypt_totp_secret(totp_secret), now),
    )

    recovery_codes = security.generate_recovery_codes()
    for code in recovery_codes:
        conn.execute(
            "INSERT INTO recovery_code (code_hash, used_at) VALUES (?, NULL)",
            (security.hash_recovery_code(code),),
        )
    conn.commit()
    conn.close()

    uri = security.totp_uri(totp_secret, username)
    print("\n" + "=" * 60)
    print("کاربر ساخته شد. این‌ها را جایی امن نگه دار — دیگر نشان داده نمی‌شوند.")
    print("=" * 60)
    print(f"\nراز TOTP: {totp_secret}")
    print(f"آدرس ثبت: {uri}\n")

    try:
        import qrcode

        qr = qrcode.QRCode(border=1)
        qr.add_data(uri)
        qr.make()
        qr.print_ascii(invert=True)
    except Exception:
        print("(نمایش QR در ترمینال ممکن نشد؛ آدرس ثبت بالا را دستی وارد کن.)")

    print("\nکدهای بازیابی یک‌بارمصرف:")
    for code in recovery_codes:
        print(f"  {code}")

    input("\nبعد از ذخیرهٔ راز TOTP و کدهای بازیابی، Enter بزن... ")
    print("تمام شد.")


if __name__ == "__main__":
    main()
