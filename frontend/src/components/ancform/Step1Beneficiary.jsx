import React from 'react';
import { useTranslation } from 'react-i18next';

function Toggle({ id, checked, onChange, label, hint }) {
  return (
    <div className="toggle-row">
      <div>
        <span className="text-body" style={{ fontSize: '0.9rem' }}>{label}</span>
        {hint && <p className="form-hint">{hint}</p>}
      </div>
      <label className="toggle" aria-label={label}>
        <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

export default function Step1Beneficiary({ data, update }) {
  const { t } = useTranslation();

  const computeEDD = (lmpDate) => {
    if (!lmpDate) return '';
    const d = new Date(lmpDate);
    d.setDate(d.getDate() + 280);
    return d.toISOString().split('T')[0];
  };

  const handleLMPChange = (val) => {
    const edd = computeEDD(val);
    const lmpDate = new Date(val);
    const today = new Date();
    const diffMs = today - lmpDate;
    const weeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    update({ lmp: val, edd, gestational_age_weeks: weeks > 0 ? weeks : '' });
  };

  return (
    <div>
      {/* Beneficiary Info */}
      <div className="section-header">
        <div className="section-icon">👤</div>
        <h2 className="text-subheading">{t('step_beneficiary')}</h2>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="beneficiary-id">{t('beneficiary_id')} *</label>
          <input id="beneficiary-id" className="input" type="text"
            placeholder="e.g. RCH-MH-2024-001"
            value={data.beneficiary_id}
            onChange={e => update({ beneficiary_id: e.target.value })}
            required
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="anc-contact">{t('anc_contact_label')} *</label>
          <select id="anc-contact" className="input select"
            value={data.anc_contact_number}
            onChange={e => update({ anc_contact_number: Number(e.target.value) })}
          >
            {[1,2,3,4,5,6,7,8].map(n => (
              <option key={n} value={n}>Contact {n} (ANC {n})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Obstetric History */}
      <div className="section-header">
        <div className="section-icon">🗓️</div>
        <h2 className="text-subheading">Obstetric History</h2>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="gravida">{t('gravida_label')} *</label>
            <input id="gravida" className="input" type="number" min="1" max="20"
              value={data.gravida} onChange={e => update({ gravida: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="para">{t('para_label')} *</label>
            <input id="para" className="input" type="number" min="0" max="20"
              value={data.para} onChange={e => update({ para: e.target.value })} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="lmp">{t('lmp_label')} *</label>
          <input id="lmp" className="input" type="date"
            value={data.lmp} max={new Date().toISOString().split('T')[0]}
            onChange={e => handleLMPChange(e.target.value)} />
        </div>

        <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="edd">{t('edd_label')}</label>
            <input id="edd" className="input" type="date"
              value={data.edd} readOnly style={{ opacity: 0.7 }} />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="gest-age">{t('gestational_age')}</label>
            <input id="gest-age" className="input" type="number"
              value={data.gestational_age_weeks} readOnly style={{ opacity: 0.7 }}
              placeholder="Auto-calc" />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="num-abortions">{t('num_abortions')}</label>
          <input id="num-abortions" className="input" type="number" min="0" max="10"
            value={data.number_of_abortions}
            onChange={e => update({ number_of_abortions: e.target.value })} />
        </div>
      </div>

      {/* Previous Complications */}
      <div className="section-header">
        <div className="section-icon">⚠️</div>
        <h2 className="text-subheading">Previous Complications</h2>
      </div>
      <div className="glass-card">
        <Toggle id="prev-stillbirth" label={t('prev_stillbirth')}
          checked={data.previous_stillbirth} onChange={v => update({ previous_stillbirth: v })} />
        <Toggle id="prev-nnd" label={t('prev_neonatal_death')}
          checked={data.previous_neonatal_death} onChange={v => update({ previous_neonatal_death: v })} />
        <Toggle id="prev-cesarean" label={t('prev_cesarean')}
          checked={data.previous_cesarean} onChange={v => update({ previous_cesarean: v })} />
        <Toggle id="prev-preterm" label={t('prev_preterm')}
          checked={data.previous_preterm_birth} onChange={v => update({ previous_preterm_birth: v })} />
        <Toggle id="prev-lbw" label={t('prev_lbw')}
          checked={data.previous_low_birth_weight} onChange={v => update({ previous_low_birth_weight: v })} />
        <Toggle id="prev-pph" label={t('prev_pph')}
          checked={data.previous_postpartum_hemorrhage} onChange={v => update({ previous_postpartum_hemorrhage: v })} />
      </div>
    </div>
  );
}
