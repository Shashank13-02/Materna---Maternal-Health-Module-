import React from 'react';
import { useTranslation } from 'react-i18next';

function BPGauge({ systolic, diastolic }) {
  const isHigh = systolic >= 140 || diastolic >= 90;
  const isBorderline = systolic >= 130 || diastolic >= 85;
  const color = isHigh ? 'var(--color-risk-high)' : isBorderline ? 'var(--color-risk-moderate)' : 'var(--color-risk-low)';
  const label = isHigh ? '🚨 Hypertensive' : isBorderline ? '⚠ Borderline' : '✓ Normal';
  if (!systolic || !diastolic) return null;
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8, marginTop: 8,
      background: `${color}18`, border: `1px solid ${color}40`,
      fontSize: '0.8rem', fontWeight: 600, color
    }}>
      {label} · {systolic}/{diastolic} mmHg
    </div>
  );
}

function Toggle({ id, checked, onChange, label }) {
  return (
    <div className="toggle-row">
      <span className="text-body" style={{ fontSize: '0.9rem' }}>{label}</span>
      <label className="toggle">
        <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function Step2Vitals({ data, update }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Blood Pressure */}
      <div className="section-header">
        <div className="section-icon">🩺</div>
        <h2 className="text-subheading">Blood Pressure</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="systolic">{t('systolic_bp')} *</label>
            <input id="systolic" className="input" type="number" min="60" max="250"
              placeholder="e.g. 120" inputMode="numeric"
              value={data.systolic_bp}
              onChange={e => update({ systolic_bp: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="diastolic">{t('diastolic_bp')} *</label>
            <input id="diastolic" className="input" type="number" min="40" max="150"
              placeholder="e.g. 80" inputMode="numeric"
              value={data.diastolic_bp}
              onChange={e => update({ diastolic_bp: e.target.value })} />
          </div>
        </div>
        <BPGauge systolic={Number(data.systolic_bp)} diastolic={Number(data.diastolic_bp)} />
      </div>

      {/* Weight & Fundal Height */}
      <div className="section-header">
        <div className="section-icon">⚖️</div>
        <h2 className="text-subheading">Measurements</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="weight">{t('weight_kg')} *</label>
            <input id="weight" className="input" type="number" min="25" max="150" step="0.1"
              placeholder="e.g. 58.5" inputMode="decimal"
              value={data.weight_kg}
              onChange={e => update({ weight_kg: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="fundal-height">{t('fundal_height')}</label>
            <input id="fundal-height" className="input" type="number" min="10" max="45" step="0.5"
              placeholder="cm" inputMode="decimal"
              value={data.fundal_height_cm}
              onChange={e => update({ fundal_height_cm: e.target.value })} />
          </div>
        </div>

        <div className="flex gap-3">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="pulse-rate">{t('pulse_rate')}</label>
            <input id="pulse-rate" className="input" type="number" min="40" max="200"
              placeholder="bpm" inputMode="numeric"
              value={data.pulse_rate_bpm}
              onChange={e => update({ pulse_rate_bpm: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="fhr">{t('fetal_heart_rate')}</label>
            <input id="fhr" className="input" type="number" min="80" max="200"
              placeholder="bpm" inputMode="numeric"
              value={data.fetal_heart_rate_bpm}
              onChange={e => update({ fetal_heart_rate_bpm: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Oedema */}
      <div className="section-header">
        <div className="section-icon">🫧</div>
        <h2 className="text-subheading">Oedema</h2>
      </div>
      <div className="glass-card">
        <Toggle id="oedema-present" label={t('oedema_present')}
          checked={data.oedema_present}
          onChange={v => update({ oedema_present: v, oedema_severity: v ? 'mild' : 'none' })} />

        {data.oedema_present && (
          <div className="form-group" style={{ marginTop: 'var(--space-3)', marginBottom: 0 }}>
            <label className="form-label" htmlFor="oedema-severity">{t('oedema_severity')}</label>
            <select id="oedema-severity" className="input select"
              value={data.oedema_severity}
              onChange={e => update({ oedema_severity: e.target.value })}>
              <option value="mild">Mild (pitting, ankles)</option>
              <option value="moderate">Moderate (up to knees)</option>
              <option value="severe">Severe (generalised)</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
