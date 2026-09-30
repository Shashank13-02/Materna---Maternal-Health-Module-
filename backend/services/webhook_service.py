"""
Webhook Dispatcher Service
Sends finalized maternal ANC records to the central risk-scoring platform
via encrypted webhook POST requests.
"""

import os
import hmac
import hashlib
import json
import httpx
from datetime import datetime

from schemas.maternal import MaternalANCRecord, WebhookPayload

WEBHOOK_URL = os.getenv("CENTRAL_PLATFORM_WEBHOOK_URL", "")
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "dev-secret")


def _compute_hmac_signature(payload_bytes: bytes) -> str:
    """
    Compute HMAC-SHA256 signature for webhook payload verification.
    Central platform should verify: hmac.compare_digest(received_sig, expected_sig)
    """
    sig = hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    return f"sha256={sig}"


async def dispatch_webhook(record: MaternalANCRecord) -> dict:
    """
    Serialize and dispatch a finalized maternal record to the central platform.
    Returns a result dict with status and details.
    """
    if not WEBHOOK_URL:
        return {"status": "skipped", "reason": "CENTRAL_PLATFORM_WEBHOOK_URL not configured"}

    payload = WebhookPayload(
        event="maternal_record.synced",
        record=record,
        dispatched_at=datetime.utcnow(),
    )

    payload_bytes = payload.model_dump_json().encode("utf-8")
    signature = _compute_hmac_signature(payload_bytes)

    headers = {
        "Content-Type": "application/json",
        "X-Maternal-Signature": signature,
        "X-Event-Type": "maternal_record.synced",
        "X-Record-ID": record.record_id,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                WEBHOOK_URL,
                content=payload_bytes,
                headers=headers,
            )
        if response.status_code in (200, 201, 202):
            return {"status": "success", "http_status": response.status_code}
        else:
            return {
                "status": "failed",
                "http_status": response.status_code,
                "body": response.text[:500],
            }
    except httpx.TimeoutException:
        return {"status": "failed", "reason": "timeout"}
    except httpx.RequestError as exc:
        return {"status": "failed", "reason": str(exc)}
