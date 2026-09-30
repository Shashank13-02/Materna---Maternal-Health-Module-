import React from 'react';
import { useTranslation } from 'react-i18next';

function HbIndicator({ hb }) {
  if (!hb) return null;
  const v = Number(hb);
  let color, label;
  if (v >= 11) { color = 'var(--color-risk-low)'; label = '✓ Normal (≥11 g/dL)'; }
  else if (v >= 10) { color = 'var(--color-risk-moderate)'; label = '⚠ Mild Anemia (10–10.9)'; }
  else if (v >= 7) { color = 'var(--color-risk-moderate)'; label = '⚠ Moderate Anemia (7–9.9)'; }
  else { color = 'var(--color-risk-high)'; label = '🚨 Severe Anemia (<7)'; }
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8, marginTop: 8,
      background: `${color}18`, border: `1px solid ${color}40`,
      fontSize: '0.8rem', fontWeight: 600, color
    }}>{label}</div>
  );
}

function BSIndicator({ fbs, ppbs }) {
  if (!fbs && !ppbs) return null;
  const gdm = (fbs && Number(fbs) >= 92) || (ppbs && Number(ppbs) >= 153);
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 8, marginTop: 8,
      background: gdm ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
      border: `1px solid ${gdm ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
      fontSize: '0.8rem', fontWeight: 600,
      color: gdm ? 'var(--color-risk-high)' : 'var(--color-risk-low)'
    }}>
      {gdm ? '🚨 Gestational Diabetes Suspected (IADPSG criteria)' : '✓ Blood Sugar Normal'}
    </div>
  );
}

export default function Step3Labs({ data, update }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* Hemoglobin */}
      <div className="section-header">
        <div className="section-icon">🩸</div>
        <h2 className="text-subheading">Hemoglobin & Anemia</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="hemoglobin">{t('hemoglobin')}</label>
          <input id="hemoglobin" className="input" type="number" min="3" max="20" step="0.1"
            placeholder="e.g. 10.5" inputMode="decimal"
            value={data.hemoglobin_gdl}
            onChange={e => update({ hemoglobin_gdl: e.target.value })} />
        </div>
        <HbIndicator hb={data.hemoglobin_gdl} />
      </div>

      {/* Blood Sugar */}
      <div className="section-header">
        <div className="section-icon">🍬</div>
        <h2 className="text-subheading">Blood Sugar</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="fbs">{t('fbs')}</label>
            <input id="fbs" className="input" type="number" min="50" max="500"
              placeholder="mg/dL" inputMode="numeric"
              value={data.fasting_blood_sugar_mgdl}
              onChange={e => update({ fasting_blood_sugar_mgdl: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="ppbs">{t('ppbs')}</label>
            <input id="ppbs" className="input" type="number" min="50" max="600"
              placeholder="mg/dL" inputMode="numeric"
              value={data.pp_blood_sugar_mgdl}
              onChange={e => update({ pp_blood_sugar_mgdl: e.target.value })} />
          </div>
        </div>
        <BSIndicator fbs={data.fasting_blood_sugar_mgdl} ppbs={data.pp_blood_sugar_mgdl} />
      </div>

      {/* Urine Dipstick */}
      <div className="section-header">
        <div className="section-icon">🧪</div>
        <h2 className="text-subheading">Urine Dipstick</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3">
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="urine-albumin">{t('urine_albumin')}</label>
            <select id="urine-albumin" className="input select"
              value={data.urine_albumin} onChange={e => update({ urine_albumin: e.target.value })}>
              {['nil','trace','1+','2+','3+','4+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="urine-sugar">{t('urine_sugar')}</label>
            <select id="urine-sugar" className="input select"
              value={data.urine_sugar} onChange={e => update({ urine_sugar: e.target.value })}>
              {['nil','trace','1+','2+','3+'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Screening Tests */}
      <div className="section-header">
        <div className="section-icon">🔬</div>
        <h2 className="text-subheading">Screening Tests</h2>
      </div>
      <div className="glass-card">
        <div className="form-group">
          <label className="form-label" htmlFor="hiv-status">{t('hiv_status')}</label>
          <select id="hiv-status" className="input select"
            value={data.hiv_status} onChange={e => update({ hiv_status: e.target.value })}>
            <option value="not_tested">Not Tested</option>
            <option value="negative">Negative</option>
            <option value="positive">Positive</option>
            <option value="refused">Refused Testing</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="vdrl-status">{t('vdrl_status')}</label>
          <select id="vdrl-status" className="input select"
            value={data.vdrl_status} onChange={e => update({ vdrl_status: e.target.value })}>
            <option value="not_tested">Not Tested</option>
            <option value="non_reactive">Non-Reactive</option>
            <option value="reactive">Reactive</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="blood-group">{t('blood_group')}</label>
          <select id="blood-group" className="input select"
            value={data.blood_group} onChange={e => update({ blood_group: e.target.value })}>
            <option value="">— Not recorded —</option>
            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
