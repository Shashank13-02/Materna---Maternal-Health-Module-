"""
Auth Router — OTP-based phone authentication
POST /auth/request-otp  → Send OTP to phone
POST /auth/verify-otp   → Verify OTP, return JWT
"""

import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, status
from jose import jwt

from schemas.maternal import OTPRequestSchema, OTPVerifySchema, TokenResponseSchema
from services.otp_service import send_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["Authentication"])

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 12

# Mock worker registry — replace with DB lookup in production
WORKER_REGISTRY: dict[str, dict] = {
    "+911234567890": {"worker_id": "ASHA-001", "role": "ASHA"},
    "+919876543210": {"worker_id": "ANM-001", "role": "ANM"},
    "+910000000000": {"worker_id": "DEMO-001", "role": "ASHA"},
}


def _create_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({**data, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/request-otp", status_code=200)
async def request_otp(body: OTPRequestSchema):
    """Request an OTP for phone number login."""
    success = await send_otp(body.phone_number)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Failed to send OTP. Please try again.",
        )
    return {"message": "OTP sent successfully", "expires_in_seconds": 300}


@router.post("/verify-otp", response_model=TokenResponseSchema)
async def verify_otp_endpoint(body: OTPVerifySchema):
    """Verify OTP and return a JWT access token."""
    valid = await verify_otp(body.phone_number, body.otp_code)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP.",
        )

    worker = WORKER_REGISTRY.get(body.phone_number, {
        "worker_id": f"WORKER-{body.phone_number[-4:]}",
        "role": "ASHA"
    })

    token = _create_token({
        "sub": body.phone_number,
        "worker_id": worker["worker_id"],
        "role": worker["role"],
    })

    return TokenResponseSchema(
        access_token=token,
        worker_id=worker["worker_id"],
        worker_role=worker["role"],
    )
