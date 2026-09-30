"""
OTP Service (Mock Implementation)
In production, replace the send logic with an SMS gateway 
(e.g., Twilio, MSG91, AWS SNS).

Mock mode: any phone number gets OTP_MOCK_CODE from .env
"""

import random
import string
import time
import os
from typing import Optional

# In-memory OTP store: { phone_number: { code, expires_at } }
# In production, replace with Redis or a DB-backed store.
_otp_store: dict[str, dict] = {}

OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))
OTP_MOCK_MODE = os.getenv("OTP_MOCK_MODE", "true").lower() == "true"
OTP_MOCK_CODE = os.getenv("OTP_MOCK_CODE", "123456")


def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))


async def send_otp(phone_number: str) -> bool:
    """
    Generate and send an OTP to the given phone number.
    Returns True on success.
    """
    otp_code = OTP_MOCK_CODE if OTP_MOCK_MODE else _generate_otp()
    expires_at = time.time() + OTP_EXPIRY_SECONDS

    _otp_store[phone_number] = {
        "code": otp_code,
        "expires_at": expires_at,
    }

    if OTP_MOCK_MODE:
        # In mock mode, print to console (visible in dev server logs)
        print(f"[OTP MOCK] Phone: {phone_number}  Code: {otp_code}")
        return True

    # --- Production SMS gateway integration point ---
    # Example with MSG91:
    # async with httpx.AsyncClient() as client:
    #     resp = await client.post(
    #         "https://api.msg91.com/api/v5/otp",
    #         json={"template_id": "...", "mobile": phone_number, "otp": otp_code},
    #         headers={"authkey": os.getenv("MSG91_AUTH_KEY")}
    #     )
    # return resp.status_code == 200
    return True


async def verify_otp(phone_number: str, submitted_code: str) -> bool:
    """
    Verify submitted OTP for a phone number.
    Returns True if valid and not expired.
    """
    entry = _otp_store.get(phone_number)
    if not entry:
        return False

    if time.time() > entry["expires_at"]:
        del _otp_store[phone_number]
        return False

    if entry["code"] != submitted_code:
        return False

    # One-time use — remove after successful verification
    del _otp_store[phone_number]
    return True


def clear_expired_otps() -> None:
    """Housekeeping — remove expired OTP entries from memory store."""
    now = time.time()
    expired = [phone for phone, entry in _otp_store.items() if entry["expires_at"] < now]
    for phone in expired:
        del _otp_store[phone]
