"""
PMSMA Risk Engine
Evaluates the 25 PMSMA (Pradhan Mantri Surakshit Matritva Abhiyan) 
high-risk pregnancy categories and computes a risk score.

Risk Score Methodology:
  - Each active flag contributes a weighted score (1–5) based on clinical severity.
  - Final risk_score is normalized to 0–100.
  - risk_level thresholds: low<20, moderate 20–39, high 40–59, critical≥60
  - referral_recommended = True when risk_level is high or critical.
"""

from datetime import datetime, date
from schemas.maternal import (
    MaternalANCRecord, PMSMAFlags, RiskSummary, RiskLevel
)

# ─── Flag Weights ──────────────────────────────────────────────────────────────
# Each flag maps to a clinical severity weight (1 = mild risk, 5 = critical risk)
FLAG_WEIGHTS: dict[str, int] = {
    "eclampsia": 5,
    "pre_eclampsia": 4,
    "severe_anemia": 4,
    "hiv_positive": 4,
    "heart_disease": 4,
    "renal_disease": 4,
    "eclampsia": 5,
    "syphilis_reactive": 3,
    "gestational_diabetes": 3,
    "hypertension": 3,
    "epilepsy": 3,
    "multiple_pregnancy": 3,
    "malpresentation": 3,
    "iugr_suspected": 3,
    "moderate_anemia": 2,
    "hypothyroidism": 2,
    "hyperthyroidism": 2,
    "hepatitis_b_carrier": 2,
    "previous_cesarean": 2,
    "previous_stillbirth_nnd": 2,
    "grand_multipara": 2,
    "bad_obstetric_history": 2,
    "elderly_primigravida": 2,
    "short_stature": 1,
    "postdatism": 1,
    "other_high_risk": 1,
}

# Maximum possible score (sum of all max weights)
MAX_POSSIBLE_SCORE = sum(FLAG_WEIGHTS.values())


def _derive_anemia_grade(hb: float | None) -> str:
    """WHO/ICMR anemia grading for pregnant women."""
    if hb is None:
        return "unknown"
    if hb >= 11.0:
        return "none"
    elif hb >= 10.0:
        return "mild"
    elif hb >= 7.0:
        return "moderate"
    else:
        return "severe"


def _detect_gestational_diabetes(fbs: float | None, ppbs: float | None) -> bool:
    """
    IADPSG / MoHFW criteria for gestational diabetes detection:
      FBS ≥ 92 mg/dL  OR  2h-PPBS ≥ 153 mg/dL
    """
    if fbs is not None and fbs >= 92:
        return True
    if ppbs is not None and ppbs >= 153:
        return True
    return False


def _detect_hypertension(systolic: float, diastolic: float) -> bool:
    """
    Hypertension in pregnancy: systolic ≥ 140 OR diastolic ≥ 90
    """
    return systolic >= 140 or diastolic >= 90


def _detect_pre_eclampsia(
    systolic: float,
    diastolic: float,
    urine_albumin: str | None,
    gestational_age_weeks: float | None
) -> bool:
    """
    Pre-eclampsia: Hypertension + proteinuria after 20 weeks
    (urine albumin 1+ or greater)
    """
    hypertensive = _detect_hypertension(systolic, diastolic)
    proteinuria = urine_albumin is not None and urine_albumin not in ["nil", "trace"]
    after_20_weeks = gestational_age_weeks is not None and gestational_age_weeks >= 20
    return hypertensive and proteinuria and after_20_weeks


def _detect_grand_multipara(para: int) -> bool:
    """Grand multipara: para ≥ 5"""
    return para >= 5


def _detect_elderly_primigravida(gravida: int, lmp: date | None) -> bool:
    """
    Elderly primigravida: first pregnancy (gravida=1) with maternal age ≥ 35.
    Age derived from LMP proxy — placeholder logic; full DOB field recommended.
    """
    # Without DOB, this flag should be manually set by field worker
    return False


def evaluate_flags(record: MaternalANCRecord) -> PMSMAFlags:
    """
    Auto-evaluate PMSMA flags from structured record data.
    Merges auto-detected flags with any manually-set flags from the field worker.
    """
    existing = record.pmsma_flags
    vitals = record.vitals
    labs = record.lab_results
    obs = record.obstetric_history

    hb = labs.hemoglobin_gdl
    anemia = _derive_anemia_grade(hb)

    auto_flags = PMSMAFlags(
        severe_anemia=anemia == "severe" or existing.severe_anemia,
        moderate_anemia=anemia == "moderate" or existing.moderate_anemia,
        hypertension=_detect_hypertension(vitals.systolic_bp, vitals.diastolic_bp) or existing.hypertension,
        pre_eclampsia=_detect_pre_eclampsia(
            vitals.systolic_bp,
            vitals.diastolic_bp,
            labs.urine_albumin.value if labs.urine_albumin else None,
            obs.gestational_age_weeks
        ) or existing.pre_eclampsia,
        eclampsia=existing.eclampsia,
        gestational_diabetes=_detect_gestational_diabetes(
            labs.fasting_blood_sugar_mgdl, labs.pp_blood_sugar_mgdl
        ) or existing.gestational_diabetes,
        hypothyroidism=existing.hypothyroidism,
        hyperthyroidism=existing.hyperthyroidism,
        heart_disease=existing.heart_disease,
        renal_disease=existing.renal_disease,
        epilepsy=existing.epilepsy,
        hiv_positive=(labs.hiv_status and labs.hiv_status.value == "positive") or existing.hiv_positive,
        syphilis_reactive=(labs.vdrl_status and labs.vdrl_status.value == "reactive") or existing.syphilis_reactive,
        hepatitis_b_carrier=existing.hepatitis_b_carrier,
        previous_cesarean=obs.previous_cesarean or existing.previous_cesarean,
        previous_stillbirth_nnd=(obs.previous_stillbirth or obs.previous_neonatal_death) or existing.previous_stillbirth_nnd,
        grand_multipara=_detect_grand_multipara(obs.para) or existing.grand_multipara,
        elderly_primigravida=existing.elderly_primigravida,
        short_stature=existing.short_stature,
        malpresentation=existing.malpresentation,
        multiple_pregnancy=existing.multiple_pregnancy,
        iugr_suspected=existing.iugr_suspected,
        bad_obstetric_history=(obs.number_of_abortions >= 2) or obs.previous_postpartum_hemorrhage or existing.bad_obstetric_history,
        postdatism=existing.postdatism,
        other_high_risk=existing.other_high_risk,
    )

    return auto_flags


def compute_risk_summary(flags: PMSMAFlags) -> RiskSummary:
    """
    Compute risk score, level, and referral recommendation from active flags.
    """
    flag_dict = flags.model_dump()
    raw_score = sum(
        FLAG_WEIGHTS.get(flag_name, 1)
        for flag_name, active in flag_dict.items()
        if active
    )
    active_count = sum(1 for v in flag_dict.values() if v)

    normalized_score = min(round((raw_score / MAX_POSSIBLE_SCORE) * 100, 1), 100.0)

    if normalized_score < 20:
        level = RiskLevel.LOW
    elif normalized_score < 40:
        level = RiskLevel.MODERATE
    elif normalized_score < 60:
        level = RiskLevel.HIGH
    else:
        level = RiskLevel.CRITICAL

    referral = level in (RiskLevel.HIGH, RiskLevel.CRITICAL)
    referral_facility = None
    if level == RiskLevel.CRITICAL:
        referral_facility = "District Hospital / CEmONC Centre"
    elif level == RiskLevel.HIGH:
        referral_facility = "Community Health Centre / FRU"

    return RiskSummary(
        total_flags_active=active_count,
        risk_level=level,
        referral_recommended=referral,
        referral_facility=referral_facility,
        risk_score=normalized_score,
        computed_at=datetime.utcnow(),
    )


def run_risk_engine(record: MaternalANCRecord) -> tuple[PMSMAFlags, RiskSummary]:
    """
    Full risk pipeline:
    1. Auto-evaluate PMSMA flags from structured clinical data
    2. Compute weighted risk score and level
    Returns (enriched_flags, risk_summary)
    """
    enriched_flags = evaluate_flags(record)
    risk_summary = compute_risk_summary(enriched_flags)
    return enriched_flags, risk_summary
