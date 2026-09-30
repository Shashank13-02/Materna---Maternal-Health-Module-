import React from 'react';
import { useTranslation } from 'react-i18next';

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <div className="toggle-row">
      <div>
        <span className="text-body" style={{ fontSize: '0.9rem' }}>{label}</span>
        {hint && <p className="form-hint">{hint}</p>}
      </div>
      <label className="toggle">
        <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function IFAComplianceBar({ compliance }) {
  const colors = { good: 'var(--color-risk-low)', partial: 'var(--color-risk-moderate)', poor: 'var(--color-risk-high)', not_started: 'var(--color-text-muted)' };
  const widths = { good: '100%', partial: '55%', poor: '25%', not_started: '5%' };
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: widths[compliance] || '0%',
          background: colors[compliance] || 'var(--color-text-muted)',
          borderRadius: 3, transition: 'width 0.4s ease'
        }} />
      </div>
    </div>
  );
}

export default function Step4Nutrition({ data, update }) {
  const { t } = useTranslation();

  return (
    <div>
      {/* IFA */}
      <div className="section-header">
        <div className="section-icon">💊</div>
        <h2 className="text-subheading">IFA Supplementation</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="ifa-distributed">{t('ifa_distributed')}</label>
            <input id="ifa-distributed" className="input" type="number" min="0" max="200"
              placeholder="tablets" inputMode="numeric"
              value={data.ifa_tablets_distributed}
              onChange={e => update({ ifa_tablets_distributed: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="ifa-consumed">{t('ifa_consumed')}</label>
            <input id="ifa-consumed" className="input" type="number" min="0" max="31"
              placeholder="0–31" inputMode="numeric"
              value={data.ifa_tablets_consumed_last_month}
              onChange={e => update({ ifa_tablets_consumed_last_month: e.target.value })} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="ifa-compliance">{t('ifa_compliance')}</label>
          <select id="ifa-compliance" className="input select"
            value={data.ifa_compliance} onChange={e => update({ ifa_compliance: e.target.value })}>
            <option value="good">Good — takes daily without missing</option>
            <option value="partial">Partial — misses occasionally</option>
            <option value="poor">Poor — rarely takes</option>
            <option value="not_started">Not Started</option>
          </select>
          <IFAComplianceBar compliance={data.ifa_compliance} />
        </div>
      </div>

      {/* Supplements & Vaccines */}
      <div className="section-header">
        <div className="section-icon">💉</div>
        <h2 className="text-subheading">Vaccines & Supplements</h2>
      </div>
      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="tt-status">{t('tt_status')}</label>
          <select id="tt-status" className="input select"
            value={data.tt_vaccination_status}
            onChange={e => update({ tt_vaccination_status: e.target.value })}>
            <option value="not_given">Not Given</option>
            <option value="tt1_given">TT1 Given</option>
            <option value="tt2_given">TT2 Given</option>
            <option value="tt_booster_given">TT Booster Given</option>
          </select>
        </div>
        <Toggle id="calcium-given" label={t('calcium_given')}
          hint="500mg calcium tablets"
          checked={data.calcium_tablets_given}
          onChange={v => update({ calcium_tablets_given: v })} />
        <Toggle id="dietary-counseling" label={t('dietary_counseling')}
          hint="Nutrition education provided this visit"
          checked={data.dietary_counseling_done}
          onChange={v => update({ dietary_counseling_done: v })} />
      </div>

      {/* MUAC */}
      <div className="section-header">
        <div className="section-icon">📏</div>
        <h2 className="text-subheading">Nutritional Status</h2>
      </div>
      <div className="glass-card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="muac">{t('muac')}</label>
          <input id="muac" className="input" type="number" min="10" max="40" step="0.1"
            placeholder="e.g. 23.5 cm" inputMode="decimal"
            value={data.muac_cm}
            onChange={e => update({ muac_cm: e.target.value })} />
          <p className="form-hint">
            MUAC &lt;21 cm = acute malnutrition risk · &lt;23 cm = moderate risk
          </p>
          {data.muac_cm && Number(data.muac_cm) < 21 && (
            <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '0.8rem', color: 'var(--color-risk-high)', fontWeight: 600 }}>
              🚨 MUAC &lt;21 cm — Severe Maternal Malnutrition Risk
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
