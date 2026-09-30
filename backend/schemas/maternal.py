from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid
from datetime import date, datetime


# ─── Enumerations ─────────────────────────────────────────────────────────────

class WorkerRole(str, Enum):
    ASHA = "ASHA"
    ANM = "ANM"
    MO = "MO"
    ANGANWADI = "Anganwadi"

class OedemaGrade(str, Enum):
    NONE = "none"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"

class AnemiaGrade(str, Enum):
    NONE = "none"
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"

class UrineAlbumin(str, Enum):
    NIL = "nil"
    TRACE = "trace"
    ONE = "1+"
    TWO = "2+"
    THREE = "3+"
    FOUR = "4+"

class UrineSugar(str, Enum):
    NIL = "nil"
    TRACE = "trace"
    ONE = "1+"
    TWO = "2+"
    THREE = "3+"

class HIVStatus(str, Enum):
    NEGATIVE = "negative"
    POSITIVE = "positive"
    NOT_TESTED = "not_tested"
    REFUSED = "refused"

class VDRLStatus(str, Enum):
    NON_REACTIVE = "non_reactive"
    REACTIVE = "reactive"
    NOT_TESTED = "not_tested"

class IFACompliance(str, Enum):
    GOOD = "good"
    PARTIAL = "partial"
    POOR = "poor"
    NOT_STARTED = "not_started"

class TTVaccinationStatus(str, Enum):
    NOT_GIVEN = "not_given"
    TT1 = "tt1_given"
    TT2 = "tt2_given"
    BOOSTER = "tt_booster_given"

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"


# ─── Sub-models ───────────────────────────────────────────────────────────────

class VisitLocation(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_name: Optional[str] = None


class Vitals(BaseModel):
    systolic_bp: float = Field(..., ge=60, le=250, description="Systolic BP in mmHg")
    diastolic_bp: float = Field(..., ge=40, le=150, description="Diastolic BP in mmHg")
    weight_kg: float = Field(..., ge=25, le=150, description="Maternal weight in kg")
    fundal_height_cm: Optional[float] = Field(None, ge=10, le=45)
    oedema_present: Optional[bool] = None
    oedema_severity: Optional[OedemaGrade] = OedemaGrade.NONE
    pulse_rate_bpm: Optional[float] = Field(None, ge=40, le=200)
    fetal_heart_rate_bpm: Optional[float] = Field(None, ge=80, le=200)


class LabResults(BaseModel):
    hemoglobin_gdl: Optional[float] = Field(None, ge=3, le=20)
    anemia_grade: Optional[AnemiaGrade] = None
    fasting_blood_sugar_mgdl: Optional[float] = None
    pp_blood_sugar_mgdl: Optional[float] = None
    urine_albumin: Optional[UrineAlbumin] = None
    urine_sugar: Optional[UrineSugar] = None
    hiv_status: Optional[HIVStatus] = None
    vdrl_status: Optional[VDRLStatus] = None
    blood_group: Optional[str] = Field(None, pattern=r"^(A|B|AB|O)[+-]$")


class ObstetricHistory(BaseModel):
    gravida: int = Field(..., ge=1)
    para: int = Field(..., ge=0)
    lmp: date
    edd: Optional[date] = None
    gestational_age_weeks: Optional[float] = Field(None, ge=4, le=45)
    previous_stillbirth: Optional[bool] = False
    previous_neonatal_death: Optional[bool] = False
    previous_cesarean: Optional[bool] = False
    previous_preterm_birth: Optional[bool] = False
    previous_low_birth_weight: Optional[bool] = False
    previous_postpartum_hemorrhage: Optional[bool] = False
    number_of_abortions: Optional[int] = Field(0, ge=0)


class Nutrition(BaseModel):
    ifa_tablets_distributed: Optional[int] = Field(None, ge=0)
    ifa_tablets_consumed_last_month: Optional[int] = Field(None, ge=0, le=31)
    ifa_compliance: Optional[IFACompliance] = None
    calcium_tablets_given: Optional[bool] = False
    tt_vaccination_status: Optional[TTVaccinationStatus] = None
    dietary_counseling_done: Optional[bool] = False
    muac_cm: Optional[float] = Field(None, description="Mid-upper arm circumference in cm")


class PMSMAFlags(BaseModel):
    """PMSMA 25 high-risk pregnancy category flags."""
    severe_anemia: bool = False
    moderate_anemia: bool = False
    hypertension: bool = False
    pre_eclampsia: bool = False
    eclampsia: bool = False
    gestational_diabetes: bool = False
    hypothyroidism: bool = False
    hyperthyroidism: bool = False
    heart_disease: bool = False
    renal_disease: bool = False
    epilepsy: bool = False
    hiv_positive: bool = False
    syphilis_reactive: bool = False
    hepatitis_b_carrier: bool = False
    previous_cesarean: bool = False
    previous_stillbirth_nnd: bool = False
    grand_multipara: bool = False
    elderly_primigravida: bool = False
    short_stature: bool = False
    malpresentation: bool = False
    multiple_pregnancy: bool = False
    iugr_suspected: bool = False
    bad_obstetric_history: bool = False
    postdatism: bool = False
    other_high_risk: bool = False


class RiskSummary(BaseModel):
    total_flags_active: int = 0
    risk_level: RiskLevel = RiskLevel.LOW
    referral_recommended: bool = False
    referral_facility: Optional[str] = None
    risk_score: float = Field(0.0, ge=0, le=100)
    computed_at: Optional[datetime] = None


# ─── Root Record ──────────────────────────────────────────────────────────────

class MaternalANCRecord(BaseModel):
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    beneficiary_id: str
    worker_id: str
    worker_role: Optional[WorkerRole] = WorkerRole.ASHA
    anc_contact_number: int = Field(..., ge=1, le=8)
    visit_date: date
    visit_location: Optional[VisitLocation] = None
    vitals: Vitals
    lab_results: LabResults = Field(default_factory=LabResults)
    obstetric_history: ObstetricHistory
    nutrition: Nutrition = Field(default_factory=Nutrition)
    pmsma_flags: PMSMAFlags = Field(default_factory=PMSMAFlags)
    risk_summary: Optional[RiskSummary] = None
    sync_status: SyncStatus = SyncStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    synced_at: Optional[datetime] = None


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class OTPRequestSchema(BaseModel):
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{9,14}$")

class OTPVerifySchema(BaseModel):
    phone_number: str
    otp_code: str

class TokenResponseSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    worker_id: str
    worker_role: Optional[WorkerRole] = None


# ─── API Response Schemas ─────────────────────────────────────────────────────

class RecordSubmitResponse(BaseModel):
    record_id: str
    risk_summary: RiskSummary
    message: str

class WebhookPayload(BaseModel):
    event: str = "maternal_record.synced"
    record: MaternalANCRecord
    dispatched_at: datetime = Field(default_factory=datetime.utcnow)
