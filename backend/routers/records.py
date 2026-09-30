"""
Records Router — ANC record submission and validation
POST /records/submit  → Validate, run risk engine, dispatch webhook
GET  /records/{record_id} → Retrieve a submitted record (mock store)
"""

import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Header, status
from jose import jwt, JWTError

from schemas.maternal import (
    MaternalANCRecord, RecordSubmitResponse, SyncStatus
)
from services.risk_engine import run_risk_engine
from services.webhook_service import dispatch_webhook

router = APIRouter(prefix="/records", tags=["ANC Records"])

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"

# In-memory record store — replace with PostgreSQL / Firestore in production
_record_store: dict[str, MaternalANCRecord] = {}


async def _get_current_worker(authorization: str = Header(...)) -> dict:
    """JWT bearer token dependency."""
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise ValueError()
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"worker_id": payload["worker_id"], "role": payload.get("role")}
    except (JWTError, ValueError, AttributeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing authorization token.",
        )


@router.post("/submit", response_model=RecordSubmitResponse, status_code=201)
async def submit_record(
    record: MaternalANCRecord,
    worker: dict = Depends(_get_current_worker),
):
    """
    Submit a finalized ANC record.
    1. Validates structure via Pydantic
    2. Runs PMSMA risk engine
    3. Persists to store
    4. Dispatches webhook to central platform
    """
    # Stamp worker ID from JWT (security: don't trust client-supplied worker_id)
    record.worker_id = worker["worker_id"]
    record.sync_status = SyncStatus.PENDING
    record.synced_at = None

    # Run risk engine
    enriched_flags, risk_summary = run_risk_engine(record)
    record.pmsma_flags = enriched_flags
    record.risk_summary = risk_summary

    # Persist
    _record_store[record.record_id] = record

    # Dispatch webhook
    webhook_result = await dispatch_webhook(record)
    if webhook_result["status"] == "success":
        record.sync_status = SyncStatus.SYNCED
        record.synced_at = datetime.now(timezone.utc)
    else:
        record.sync_status = SyncStatus.FAILED

    return RecordSubmitResponse(
        record_id=record.record_id,
        risk_summary=risk_summary,
        message=f"Record submitted. Risk level: {risk_summary.risk_level.value.upper()}. "
                f"Webhook: {webhook_result['status']}.",
    )


@router.get("/{record_id}", response_model=MaternalANCRecord)
async def get_record(
    record_id: str,
    worker: dict = Depends(_get_current_worker),
):
    """Retrieve a previously submitted ANC record by ID."""
    record = _record_store.get(record_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Record '{record_id}' not found.",
        )
    return record


@router.get("/", response_model=list[MaternalANCRecord])
async def list_records(
    worker: dict = Depends(_get_current_worker),
    limit: int = 50,
):
    """List all submitted records (filtered by worker in production)."""
    records = list(_record_store.values())
    return records[-limit:]
