import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { saveRecordOffline } from '../services/syncService';

// Step components
import Step1Beneficiary from '../components/ancform/Step1Beneficiary';
import Step2Vitals from '../components/ancform/Step2Vitals';
import Step3Labs from '../components/ancform/Step3Labs';
import Step4Nutrition from '../components/ancform/Step4Nutrition';
import Step5Flags from '../components/ancform/Step5Flags';

const STEPS = ['step_beneficiary', 'step_vitals', 'step_labs', 'step_nutrition', 'step_flags'];

function StepBar({ current, total }) {
  return (
    <div className="step-bar">
      {Array.from({ length: total }, (_, i) => (
        <React.Fragment key={i}>
          <div className={`step-dot ${i < current ? 'done' : i === current ? 'active' : 'pending'}`}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && <div className={`step-line ${i < current ? 'done' : ''}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const INITIAL_FORM = {
  // Step 1
  beneficiary_id: '',
  anc_contact_number: 1,
  visit_date: new Date().toISOString().split('T')[0],
  gravida: 1,
  para: 0,
  lmp: '',
  edd: '',
  gestational_age_weeks: '',
  previous_stillbirth: false,
  previous_neonatal_death: false,
  previous_cesarean: false,
  previous_preterm_birth: false,
  previous_low_birth_weight: false,
  previous_postpartum_hemorrhage: false,
  number_of_abortions: 0,
  // Step 2
  systolic_bp: '',
  diastolic_bp: '',
  weight_kg: '',
  fundal_height_cm: '',
  oedema_present: false,
  oedema_severity: 'none',
  pulse_rate_bpm: '',
  fetal_heart_rate_bpm: '',
  // Step 3
  hemoglobin_gdl: '',
  fasting_blood_sugar_mgdl: '',
  pp_blood_sugar_mgdl: '',
  urine_albumin: 'nil',
  urine_sugar: 'nil',
  hiv_status: 'not_tested',
  vdrl_status: 'not_tested',
  blood_group: '',
  // Step 4
  ifa_tablets_distributed: '',
  ifa_tablets_consumed_last_month: '',
  ifa_compliance: 'good',
  calcium_tablets_given: false,
  tt_vaccination_status: 'not_given',
  dietary_counseling_done: false,
  muac_cm: '',
  // Step 5
  pmsma_flags: {},
};

export default function ANCFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const prefill = location.state?.beneficiary;
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    ...INITIAL_FORM,
    beneficiary_id: prefill?.beneficiary_id || '',
    anc_contact_number: prefill ? prefill.anc_contact + 1 : 1,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (fields) => setFormData(prev => ({ ...prev, ...fields }));

  const goNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  const goBack = () => {
    if (currentStep === 0) navigate(-1);
    else setCurrentStep(s => s - 1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const record = {
        record_id: uuidv4(),
        worker_id: localStorage.getItem('worker_id') || 'ASHA-001',
        worker_role: localStorage.getItem('worker_role') || 'ASHA',
        anc_contact_number: Number(formData.anc_contact_number),
        visit_date: formData.visit_date,
        vitals: {
          systolic_bp: Number(formData.systolic_bp),
          diastolic_bp: Number(formData.diastolic_bp),
          weight_kg: Number(formData.weight_kg),
          fundal_height_cm: formData.fundal_height_cm ? Number(formData.fundal_height_cm) : undefined,
          oedema_present: formData.oedema_present,
          oedema_severity: formData.oedema_severity,
          pulse_rate_bpm: formData.pulse_rate_bpm ? Number(formData.pulse_rate_bpm) : undefined,
          fetal_heart_rate_bpm: formData.fetal_heart_rate_bpm ? Number(formData.fetal_heart_rate_bpm) : undefined,
        },
        lab_results: {
          hemoglobin_gdl: formData.hemoglobin_gdl ? Number(formData.hemoglobin_gdl) : undefined,
          fasting_blood_sugar_mgdl: formData.fasting_blood_sugar_mgdl ? Number(formData.fasting_blood_sugar_mgdl) : undefined,
          pp_blood_sugar_mgdl: formData.pp_blood_sugar_mgdl ? Number(formData.pp_blood_sugar_mgdl) : undefined,
          urine_albumin: formData.urine_albumin,
          urine_sugar: formData.urine_sugar,
          hiv_status: formData.hiv_status,
          vdrl_status: formData.vdrl_status,
          blood_group: formData.blood_group || undefined,
        },
        obstetric_history: {
          gravida: Number(formData.gravida),
          para: Number(formData.para),
          lmp: formData.lmp,
          edd: formData.edd || undefined,
          gestational_age_weeks: formData.gestational_age_weeks ? Number(formData.gestational_age_weeks) : undefined,
          previous_stillbirth: formData.previous_stillbirth,
          previous_neonatal_death: formData.previous_neonatal_death,
          previous_cesarean: formData.previous_cesarean,
          previous_preterm_birth: formData.previous_preterm_birth,
          previous_low_birth_weight: formData.previous_low_birth_weight,
          previous_postpartum_hemorrhage: formData.previous_postpartum_hemorrhage,
          number_of_abortions: Number(formData.number_of_abortions),
        },
        nutrition: {
          ifa_tablets_distributed: formData.ifa_tablets_distributed ? Number(formData.ifa_tablets_distributed) : undefined,
          ifa_tablets_consumed_last_month: formData.ifa_tablets_consumed_last_month ? Number(formData.ifa_tablets_consumed_last_month) : undefined,
          ifa_compliance: formData.ifa_compliance,
          calcium_tablets_given: formData.calcium_tablets_given,
          tt_vaccination_status: formData.tt_vaccination_status,
          dietary_counseling_done: formData.dietary_counseling_done,
          muac_cm: formData.muac_cm ? Number(formData.muac_cm) : undefined,
        },
        pmsma_flags: formData.pmsma_flags || {},
        beneficiary_id: formData.beneficiary_id || `BEN-${Date.now()}`,
        sync_status: 'pending',
      };

      await saveRecordOffline(record);
      setSaved(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const stepComponents = [
    <Step1Beneficiary key="s1" data={formData} update={update} />,
    <Step2Vitals key="s2" data={formData} update={update} />,
    <Step3Labs key="s3" data={formData} update={update} />,
    <Step4Nutrition key="s4" data={formData} update={update} />,
    <Step5Flags key="s5" data={formData} update={update} />,
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-5)' }}>
        <button className="btn btn-ghost" onClick={goBack} style={{ padding: '6px 10px', fontSize: '1.1rem' }}>
          ←
        </button>
        <div>
          <h1 className="text-subheading">{t('anc_form_title')}</h1>
          <p className="text-xs">{t(`step_${STEPS[currentStep].replace('step_', '')}`)}</p>
        </div>
      </div>

      {/* Step Bar */}
      <StepBar current={currentStep} total={STEPS.length} />

      {/* Step Content */}
      <div className="fade-in-up" key={currentStep}>
        {stepComponents[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3" style={{ marginTop: 'var(--space-6)' }}>
        {currentStep > 0 && (
          <button id="form-back-btn" className="btn btn-secondary" style={{ flex: 1 }} onClick={goBack}>
            ← {t('back')}
          </button>
        )}
        {currentStep < STEPS.length - 1 ? (
          <button id="form-next-btn" className="btn btn-primary" style={{ flex: 2 }} onClick={goNext}>
            {t('next')} →
          </button>
        ) : (
          <button
            id="form-save-btn"
            className="btn btn-primary"
            style={{ flex: 2, background: saved ? 'linear-gradient(135deg,#22c55e,#16a34a)' : undefined }}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? `✓ ${t('saved')}` : saving ? `⟳ ${t('saving')}` : `💾 ${t('save_record')}`}
          </button>
        )}
      </div>
    </div>
  );
}
