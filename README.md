<p align="center">
  <img src="frontend/public/favicon.svg" alt="Materna Logo" width="80" />
</p>

<h1 align="center">Materna — Maternal Health Module</h1>

<p align="center">
  <strong>A digital health platform for community health workers and mothers, built to reduce preventable maternal deaths through early risk identification, evidence-based screening, and seamless data flow from the field to the facility.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React%20+%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/PWA-Offline%20First-FF6D00?style=for-the-badge&logo=pwa&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</p>

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [What Materna Does](#-what-materna-does)
- [Architecture](#-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [PMSMA Risk Engine](#-pmsma-risk-engine)
- [Mother Wellbeing Check-In](#-mother-wellbeing-check-in)
- [Clinical Evidence & Safety](#-clinical-evidence--safety)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## 🩺 The Problem

**India accounts for nearly 13% of global maternal deaths.** Every year, thousands of mothers die from preventable causes — severe anemia, pre-eclampsia, postpartum hemorrhage, and undetected high-risk pregnancies — because critical health data never reaches the right person in time.

The root causes are systemic:

- **ASHA and ANM workers** in rural India collect antenatal care (ANC) data on paper registers. By the time it reaches a district hospital, it is too late for timely intervention.
- **No automated risk scoring** — Field workers rely on memory and experience to identify high-risk pregnancies among the 25 PMSMA (Pradhan Mantri Surakshit Matritva Abhiyan) categories.
- **Connectivity gaps** — Many sub-centres and villages have intermittent or no internet. Data collected offline is often lost or delayed by weeks.
- **Maternal mental health is invisible** — Perinatal depression and anxiety affect 1 in 5 mothers, but screening is almost never done at the community level. Mothers at home have no private, accessible way to check in on their wellbeing.

## 💡 What Materna Does

Materna is a **full-stack digital health module** with two complementary surfaces:

### For Community Health Workers (ASHA / ANM / MO)
A mobile-first **Progressive Web App (PWA)** for digitised ANC data entry with:
- Structured multi-step form covering vitals, labs, obstetric history, nutrition, and immunisation
- **Automated PMSMA risk scoring** that evaluates all 25 high-risk pregnancy categories in real-time
- Offline-first architecture — records are saved locally and auto-synced when connectivity returns
- Secure webhook dispatch to the central health platform with HMAC-signed payloads

### For Mothers at Home
A **private, no-login-required wellbeing check-in** using validated clinical instruments:
- **PHQ-9** (depression screening) and **GAD-7** (anxiety screening)
- Immediate safety support for self-harm, psychosis, and domestic violence indicators
- No data stored, no backend calls — answers exist only in browser memory during the session
- Culturally sensitive support messages with Indian helpline numbers (Tele-MANAS 14416, ERSS 112)

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        MOTHERS AT HOME                          │
│                                                                  │
│   Browser → /wellbeing → PHQ-9 + GAD-7 + Safety Questions       │
│   (No login, no storage, no backend calls — memory only)         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    FIELD WORKERS (ASHA/ANM)                      │
│                                                                  │
│   PWA (React + Vite)  ←→  IndexedDB (Dexie)  ←→  Sync Service   │
│         │                                             │          │
│         └── OTP Login ──→ JWT Token ──────────────────┘          │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTPS (JSON)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BACKEND (FastAPI)                           │
│                                                                  │
│   /auth/request-otp    →  OTP Service (SMS Gateway / Mock)       │
│   /auth/verify-otp     →  JWT Token Generation                   │
│   /records/submit      →  Pydantic Validation                    │
│                        →  PMSMA Risk Engine (25 flags)           │
│                        →  Webhook Dispatch (HMAC-SHA256)         │
│   /records/{id}        →  Record Retrieval                       │
│   /health              →  Service Health Check                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Webhook POST
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│               CENTRAL HEALTH PLATFORM (External)                 │
│                                                                  │
│   Receives HMAC-signed maternal records for facility-level       │
│   dashboards, district reporting, and intervention tracking      │
└──────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Offline-First PWA** | Service worker + IndexedDB via Dexie.js — works without internet, auto-syncs on reconnection |
| **OTP Authentication** | Phone-based login for field workers with JWT session management (mock mode for dev) |
| **Multi-Step ANC Form** | 5-step digitised form: Beneficiary → Vitals → Labs → Nutrition → Risk Flags |
| **PMSMA Risk Engine** | Auto-detects high-risk conditions from clinical data with weighted scoring (0–100 scale) |
| **Auto Referral** | Recommends referral facility based on risk level (CHC/FRU for high, District Hospital for critical) |
| **Webhook Dispatch** | HMAC-SHA256 signed payloads to central platform for real-time data flow |
| **Bilingual (EN/HI)** | i18next-powered English and Hindi interface with persistent language preference |
| **Mother Wellbeing** | PHQ-9 + GAD-7 validated instruments — no login, no storage, immediate safety support |
| **Validated Scoring** | WHO/ICMR anemia grading, IADPSG/MoHFW GDM criteria, ACOG pre-eclampsia detection |
| **JSON API** | All endpoints return structured JSON responses with Pydantic schema validation |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python API framework |
| **Pydantic v2** | Schema validation with 220+ lines of type-safe maternal health models |
| **python-jose** | JWT token generation and verification |
| **httpx** | Async HTTP client for webhook dispatch |
| **Uvicorn** | ASGI server |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool with HMR |
| **React Router v7** | Client-side routing |
| **Dexie.js** | IndexedDB wrapper for offline data persistence |
| **i18next** | Internationalisation (English + Hindi) |
| **Workbox** | Service worker for PWA offline capability |
| **Axios** | HTTP client for API communication |

---

## 📁 Project Structure

```
maternal_health_module/
├── backend/
│   ├── main.py                      # FastAPI app entry point
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment variable template
│   ├── routers/
│   │   ├── auth.py                  # OTP authentication endpoints
│   │   └── records.py               # ANC record CRUD endpoints
│   ├── schemas/
│   │   └── maternal.py              # Pydantic models (220+ lines)
│   └── services/
│       ├── otp_service.py           # OTP generation & verification
│       ├── risk_engine.py           # PMSMA 25-flag risk scoring
│       └── webhook_service.py       # HMAC-signed webhook dispatch
├── frontend/
│   ├── index.html                   # App entry
│   ├── package.json                 # Node dependencies
│   ├── vite.config.js               # Vite + PWA configuration
│   ├── public/                      # Static assets & icons
│   └── src/
│       ├── App.jsx                  # Root component & routing
│       ├── clinical/
│       │   ├── screening.js         # PHQ-9/GAD-7 instruments & scoring
│       │   └── screening.test.js    # Clinical scoring test suite
│       ├── components/
│       │   ├── AppIcon.jsx          # SVG icon system
│       │   └── ancform/             # Multi-step ANC form components
│       │       ├── Step1Beneficiary.jsx
│       │       ├── Step2Vitals.jsx
│       │       ├── Step3Labs.jsx
│       │       ├── Step4Nutrition.jsx
│       │       └── Step5Flags.jsx
│       ├── db/
│       │   └── dexie.js             # IndexedDB schema
│       ├── i18n/
│       │   └── index.js             # English + Hindi translations
│       ├── pages/
│       │   ├── OTPLoginPage.jsx     # Phone authentication
│       │   ├── DashboardPage.jsx    # Worker dashboard
│       │   ├── ANCFormPage.jsx      # ANC data entry wizard
│       │   └── MotherWellbeingPage.jsx  # PHQ-9/GAD-7 check-in
│       └── services/
│           └── syncService.js       # Offline sync manager
├── docs/
│   ├── CLINICAL_EVIDENCE.md         # Literature review & instrument permissions
│   └── HARDWARE_AI_ROADMAP.md       # Future hardware/AI integration plan
├── schema/
│   └── maternal_record.schema.json  # JSON Schema for interoperability
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your SECRET_KEY and other settings

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will be available at `http://localhost:5173`

### Quick Test (Mock Mode)

1. Open `http://localhost:5173/wellbeing` — the mother's check-in works immediately (no login needed)
2. For staff features, go to `/login` and use any phone number with OTP `123456` (mock mode)
3. After login, you'll land on the dashboard to create ANC records

---

## 📡 API Reference

All endpoints return **JSON responses** with `Content-Type: application/json`.

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/request-otp` | Send OTP to phone number | None |
| `POST` | `/auth/verify-otp` | Verify OTP, receive JWT token | None |

### ANC Records

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/records/submit` | Submit an ANC record (validated, risk-scored, webhook dispatched) | Bearer JWT |
| `GET` | `/records/{record_id}` | Retrieve a specific record | Bearer JWT |
| `GET` | `/records/` | List all submitted records | Bearer JWT |

### System

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/health` | Service health check | None |

### Example: Submit an ANC Record

```bash
curl -X POST http://localhost:8000/records/submit \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "beneficiary_id": "BEN-001",
    "worker_id": "ASHA-001",
    "anc_contact_number": 1,
    "visit_date": "2026-09-30",
    "vitals": {
      "systolic_bp": 145,
      "diastolic_bp": 95,
      "weight_kg": 62
    },
    "obstetric_history": {
      "gravida": 2,
      "para": 1,
      "lmp": "2026-03-15"
    }
  }'
```

**Response** (JSON):
```json
{
  "record_id": "a1b2c3d4-...",
  "risk_summary": {
    "total_flags_active": 1,
    "risk_level": "moderate",
    "referral_recommended": false,
    "referral_facility": null,
    "risk_score": 23.1,
    "computed_at": "2026-09-30T01:00:00Z"
  },
  "message": "Record submitted. Risk level: MODERATE. Webhook: skipped."
}
```

---

## 🧮 PMSMA Risk Engine

The risk engine evaluates all **25 PMSMA high-risk pregnancy categories** defined under India's national maternal health programme.

### Auto-Detected Conditions (from structured data)

| Condition | Detection Logic | Source |
|---|---|---|
| **Severe Anemia** | Hemoglobin < 7.0 g/dL | WHO/ICMR grading |
| **Moderate Anemia** | Hemoglobin 7.0–9.9 g/dL | WHO/ICMR grading |
| **Hypertension** | Systolic ≥ 140 or Diastolic ≥ 90 mmHg | Standard clinical criteria |
| **Pre-eclampsia** | Hypertension + proteinuria (urine albumin ≥ 1+) after 20 weeks | ACOG criteria |
| **Gestational Diabetes** | FBS ≥ 92 mg/dL or 2h-PPBS ≥ 153 mg/dL | IADPSG / MoHFW criteria |
| **HIV Positive** | Lab result = positive | Lab-confirmed |
| **Syphilis** | VDRL = reactive | Lab-confirmed |
| **Previous C-section** | Obstetric history flag | Self-reported |
| **Grand Multipara** | Para ≥ 5 | Standard definition |
| **Bad Obstetric History** | ≥ 2 abortions or previous PPH | Clinical criteria |

### Risk Scoring

Each active flag carries a **clinical severity weight** (1–5 points):

| Weight | Examples |
|---|---|
| **5 (Critical)** | Eclampsia |
| **4 (Severe)** | Pre-eclampsia, severe anemia, HIV, heart/renal disease |
| **3 (Significant)** | GDM, hypertension, epilepsy, IUGR, multiple pregnancy |
| **2 (Moderate)** | Previous C-section, hypothyroidism, grand multipara |
| **1 (Mild)** | Short stature, postdatism |

The raw score is **normalised to 0–100** and classified:

| Score Range | Risk Level | Referral |
|---|---|---|
| 0–19 | 🟢 Low | Not recommended |
| 20–39 | 🟡 Moderate | Not recommended |
| 40–59 | 🟠 High | → Community Health Centre / FRU |
| 60–100 | 🔴 Critical | → District Hospital / CEmONC |

---

## 🌸 Mother Wellbeing Check-In

The `/wellbeing` route provides mothers with a **private, evidence-based mental health check-in** using two validated clinical instruments:

### Instruments Used

| Instrument | Purpose | Items | Score Range |
|---|---|---|---|
| **PHQ-9** | Depression symptom screening | 9 questions | 0–27 |
| **GAD-7** | Generalised anxiety screening | 7 questions | 0–21 |

Both instruments use a 2-week recall period with 4 frequency options (Not at all → Nearly every day).

### Safety-First Design

- **No data is stored** — answers exist only in React memory during the session
- **No backend calls** — the check-in is fully client-side
- **No login required** — accessible to any mother immediately
- **Immediate safety support** — positive self-harm responses (PHQ-9 Q9) or danger indicators trigger immediate help before form completion
- **Emergency contacts** — Tele-MANAS (14416), ERSS (112) displayed prominently

### What It Is Not

This is **not** a diagnostic tool, therapy replacement, or validated triage system. It is a structured way for a mother to reflect on her wellbeing and be connected to professional help. See [`docs/CLINICAL_EVIDENCE.md`](docs/CLINICAL_EVIDENCE.md) for the full literature review.

---

## 🔬 Clinical Evidence & Safety

Detailed clinical evidence, instrument permissions, support policies, and safety considerations are documented in:

- **[`docs/CLINICAL_EVIDENCE.md`](docs/CLINICAL_EVIDENCE.md)** — Literature review, PHQ-9/GAD-7 permissions, support action policies, and validation requirements
- **[`docs/HARDWARE_AI_ROADMAP.md`](docs/HARDWARE_AI_ROADMAP.md)** — Future hardware integration (wearables, BP monitoring) and AI/ML evaluation plan

Key clinical sources informing the design:
- WHO Integration Guide (2022)
- ACOG Patient Screening / CPG 4 (2023)
- NICE NG225 §1.6 (2022)
- ICMR Ethical Guidelines for AI in Healthcare (2023)

---

## 🗺 Roadmap

| Phase | Status | Description |
|---|---|---|
| ✅ Core Backend | Complete | FastAPI with OTP auth, ANC records, risk engine, webhook dispatch |
| ✅ PWA Frontend | Complete | Offline-first React app with multi-step ANC form |
| ✅ Wellbeing Check-In | Complete | PHQ-9/GAD-7 with safety-first support actions |
| ✅ Bilingual Support | Complete | English + Hindi (i18next) |
| 🔲 Database Integration | Planned | PostgreSQL / Firestore replacing in-memory stores |
| 🔲 SMS Gateway | Planned | Real OTP delivery via MSG91 / AWS SNS |
| 🔲 Hindi Clinical Validation | Planned | Validated Hindi translations of PHQ-9/GAD-7 |
| 🔲 Wearable Integration | Research | Health Connect / HealthKit for sleep and activity data |
| 🔲 AI-Assisted FAQ | Research | Retrieval-based educational content with clinical review |

---

## 🤝 Contributing

Contributions are welcome! Please keep these guidelines in mind:

1. **Clinical changes** (screening instruments, risk thresholds, support messages) require documented evidence and ideally clinical review
2. **Run tests** before submitting: `cd frontend && node --test src/clinical/screening.test.js`
3. **Do not** add AI-generated medical advice, diagnosis language, or unvalidated screening tools
4. Follow the existing code style and add appropriate documentation

---

## 📄 License

This project is open-source. See individual instrument attributions in [`docs/CLINICAL_EVIDENCE.md`](docs/CLINICAL_EVIDENCE.md).

PHQ-9 and GAD-7 instruments are used under [Pfizer's public access permission (2010)](https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care). Attribution is retained. This permission does not imply Pfizer endorses Materna.

---

## ⚠️ Disclaimer

> **Materna is a prototype, not a clinically validated or regulated medical device.**
>
> - The PMSMA risk engine uses weighted scoring based on clinical literature but has **not been externally validated**
> - The wellbeing check-in uses published PHQ-9/GAD-7 instruments but the **home administration has not been validated** for this specific population
> - This software does **not** make calls, dispatch emergency services, or automatically notify clinicians
> - It should **not** be used as the sole basis for clinical decisions
> - Local clinical validation, ethical review, and regulatory assessment are required before real-world deployment
>
> **If you or someone you know is in crisis, please contact emergency services immediately.**
> - 🇮🇳 Tele-MANAS: **14416** (24/7) | Emergency: **112**

---

<p align="center">
  Built with ❤️ for maternal health in India
</p>
