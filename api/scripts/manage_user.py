#!/usr/bin/env python3
"""تغییر نام کاربری، رمز عبور، یا بازنشانی TOTP برای کاربر تک‌نفرهٔ موجود —
مکمل create_user.py (که فقط برای ساخت کاربر اول است و اگر کاربری باشد
امتناع می‌کند). بند ۱۴.۲: بدون ثبت‌نام عمومی، همه‌چیز فقط از CLI روی سرور.

اجرا: cd api && source .venv/bin/activate && python scripts/manage_user.py
یا داخل Docker: docker compose exec app /app/api/.venv/bin/python /app/api/scripts/manage_user.py
"""

import getpass
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(API_DIR))

from app import security  # noqa: E402
from app.db import get_connection  # noqa: E402


def _load_user(conn):
    user = conn.execute("SELECT * FROM user LIMIT 1").fetchone()
    if user is None:
        print("هیچ کاربری وجود ندارد — اول scripts/create_user.py را اجرا کن.")
        sys.exit(1)
    return user


def _invalidate_sessions(conn) -> None:
    # جدول session کاربر را جدا نگه نمی‌دارد (تک‌کاربره است)، پس خالی‌کردنش
    # یعنی همه‌جا باید دوباره وارد شوی — رفتار درست بعد از تغییر رمز/TOTP.
    conn.execute("DELETE FROM session")


def change_username(conn) -> None:
    user = _load_user(conn)
    print(f"نام کاربری فعلی: {user['username']}")
    new_username = input("نام کاربری جدید: ").strip()
    while not new_username:
        new_username = input("نام کاربری جدید (نمی‌تواند خالی باشد): ").strip()
    conn.execute("UPDATE user SET username = ? WHERE id = ?", (new_username, user["id"]))
    conn.commit()
    # نشست‌ها به نام کاربری وابسته نیستند (جدول session ستون user_id ندارد،
    # چون تک‌کاربره است) — نشست‌های فعال معتبر می‌مانند، نیازی به ورود دوباره نیست.
    print(f"نام کاربری به «{new_username}» تغییر کرد.")


def change_password(conn) -> None:
    user = _load_user(conn)
    password = getpass.getpass("رمز عبور جدید: ")
    confirm = getpass.getpass("تکرار رمز عبور جدید: ")
    while not password or password != confirm:
        print("رمزها یکی نیستند یا خالی‌اند.")
        password = getpass.getpass("رمز عبور جدید: ")
        confirm = getpass.getpass("تکرار رمز عبور جدید: ")

    conn.execute(
        "UPDATE user SET password_hash = ? WHERE id = ?",
        (security.hash_password(password), user["id"]),
    )
    _invalidate_sessions(conn)
    conn.commit()
    print("رمز عبور تغییر کرد. همهٔ نشست‌های فعال باطل شدند — باید دوباره وارد شوی.")


def reset_totp(conn) -> None:
    user = _load_user(conn)
    print("این کار راز TOTP فعلی و کدهای بازیابی فعلی را باطل می‌کند.")
    confirm = input("ادامه می‌دهی؟ (بله/نه) ").strip().lower()
    if confirm not in ("بله", "y", "yes"):
        print("لغو شد.")
        return

    totp_secret = security.new_totp_secret()
    conn.execute(
        "UPDATE user SET totp_secret = ?, totp_last_counter = 0 WHERE id = ?",
        (security.encrypt_totp_secret(totp_secret), user["id"]),
    )
    conn.execute("DELETE FROM recovery_code")
    recovery_codes = security.generate_recovery_codes()
    for code in recovery_codes:
        conn.execute(
            "INSERT INTO recovery_code (code_hash, used_at) VALUES (?, NULL)",
            (security.hash_recovery_code(code),),
        )
    _invalidate_sessions(conn)
    conn.commit()

    uri = security.totp_uri(totp_secret, user["username"])
    print("\n" + "=" * 60)
    print("TOTP بازنشانی شد. این‌ها را جایی امن نگه دار — دیگر نشان داده نمی‌شوند.")
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

    print("\nکدهای بازیابی یک‌بارمصرف جدید:")
    for code in recovery_codes:
        print(f"  {code}")

    input("\nبعد از ذخیرهٔ راز TOTP و کدهای بازیابی، Enter بزن... ")
    print("همهٔ نشست‌های فعال باطل شدند — باید دوباره وارد شوی.")


def main() -> None:
    conn = get_connection()
    try:
        user = _load_user(conn)
        print(f"کاربر فعلی: {user['username']}\n")
        print("۱) تغییر نام کاربری")
        print("۲) تغییر رمز عبور")
        print("۳) بازنشانی TOTP (+ کدهای بازیابی جدید)")
        print("۴) خروج بدون تغییر")
        choice = input("\nانتخاب: ").strip()

        if choice == "1" or choice == "۱":
            change_username(conn)
        elif choice == "2" or choice == "۲":
            change_password(conn)
        elif choice == "3" or choice == "۳":
            reset_totp(conn)
        else:
            print("چیزی تغییر نکرد.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
