"""
FastAPI Application Entrypoint — Maternal Health Module Backend
Run with: uvicorn main:app --reload --port 8000
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import auth, records

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("[INFO] Maternal Health Module API starting...")
    yield
    print("[INFO] Maternal Health Module API shutting down.")


app = FastAPI(
    title="Maternal Health Module API",
    description=(
        "Backend for the ASHA/ANM field data entry PWA. "
        "Handles OTP authentication, ANC record validation, "
        "PMSMA risk scoring, and webhook dispatch."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(records.router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "service": "maternal-health-module", "version": "1.0.0"}
