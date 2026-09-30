import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const ALL_FLAGS = [
  { key: 'severe_anemia',          label: 'Severe Anemia (Hb <7)',        icon: '🩸', weight: 4 },
  { key: 'moderate_anemia',        label: 'Moderate Anemia (Hb 7–9.9)',   icon: '🩸', weight: 2 },
  { key: 'hypertension',           label: 'Hypertension in Pregnancy',    icon: '🫀', weight: 3 },
  { key: 'pre_eclampsia',          label: 'Pre-Eclampsia',                icon: '⚠️', weight: 4 },
  { key: 'eclampsia',              label: 'Eclampsia',                    icon: '🚨', weight: 5 },
  { key: 'gestational_diabetes',   label: 'Gestational Diabetes',         icon: '🍬', weight: 3 },
  { key: 'hypothyroidism',         label: 'Hypothyroidism',               icon: '🦋', weight: 2 },
  { key: 'hyperthyroidism',        label: 'Hyperthyroidism',              icon: '🦋', weight: 2 },
  { key: 'heart_disease',          label: 'Heart Disease',                icon: '🫀', weight: 4 },
  { key: 'renal_disease',          label: 'Renal Disease',                icon: '🫘', weight: 4 },
  { key: 'epilepsy',               label: 'Epilepsy',                     icon: '⚡', weight: 3 },
  { key: 'hiv_positive',           label: 'HIV Positive',                 icon: '🔴', weight: 4 },
  { key: 'syphilis_reactive',      label: 'Syphilis (VDRL Reactive)',     icon: '🔬', weight: 3 },
  { key: 'hepatitis_b_carrier',    label: 'Hepatitis B Carrier',          icon: '🧬', weight: 2 },
  { key: 'previous_cesarean',      label: 'Previous Cesarean Section',    icon: '🔪', weight: 2 },
  { key: 'previous_stillbirth_nnd',label: 'Previous Stillbirth / NND',   icon: '💔', weight: 2 },
  { key: 'grand_multipara',        label: 'Grand Multipara (≥5 deliveries)', icon: '👩', weight: 2 },
  { key: 'elderly_primigravida',   label: 'Elderly Primigravida (≥35 yrs)', icon: '👩‍🦳', weight: 2 },
  { key: 'short_stature',          label: 'Short Stature (<145 cm)',      icon: '📏', weight: 1 },
  { key: 'malpresentation',        label: 'Malpresentation',              icon: '👶', weight: 3 },
  { key: 'multiple_pregnancy',     label: 'Multiple Pregnancy',           icon: '👶👶', weight: 3 },
  { key: 'iugr_suspected',         label: 'IUGR Suspected',               icon: '📉', weight: 3 },
  { key: 'bad_obstetric_history',  label: 'Bad Obstetric History',        icon: '📋', weight: 2 },
  { key: 'postdatism',             label: 'Postdatism (>40 weeks)',       icon: '📅', weight: 1 },
  { key: 'other_high_risk',        label: 'Other High-Risk Condition',    icon: '⚠️', weight: 1 },
];

const MAX_SCORE = ALL_FLAGS.reduce((s, f) => s + f.weight, 0);

function computeRisk(flags) {
  const rawScore = ALL_FLAGS.reduce((s, f) => s + (flags[f.key] ? f.weight : 0), 0);
  const normalized = Math.min(Math.round((rawScore / MAX_SCORE) * 100), 100);
  const activeCount = ALL_FLAGS.filter(f => flags[f.key]).length;

  let level = 'low';
  if (normalized >= 60) level = 'critical';
  else if (normalized >= 40) level = 'high';
  else if (normalized >= 20) level = 'moderate';

  const referral = level === 'high' || level === 'critical';
  const facility = level === 'critical' ? 'District Hospital / CEmONC' : level === 'high' ? 'CHC / FRU' : null;

  return { score: normalized, level, activeCount, referral, facility };
}

const RISK_COLORS = {
  low: 'var(--color-risk-low)',
  moderate: 'var(--color-risk-moderate)',
  high: 'var(--color-risk-high)',
  critical: 'var(--color-risk-critical)'
};

export default function Step5Flags({ data, update }) {
  const { t } = useTranslation();
  const flags = data.pmsma_flags || {};

  const toggleFlag = (key, val) => update({ pmsma_flags: { ...flags, [key]: val } });
  const risk = useMemo(() => computeRisk(flags), [flags]);

  return (
    <div>
      {/* Risk Summary Card */}
      <div className="glass-card" style={{
        marginBottom: 'var(--space-5)',
        borderColor: `${RISK_COLORS[risk.level]}40`,
        background: `${RISK_COLORS[risk.level]}08`
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div>
            <p className="text-label">PMSMA Risk Score</p>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: RISK_COLORS[risk.level], lineHeight: 1.1 }}>
              {risk.score}
              <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/100</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className={`risk-badge ${risk.level}`} style={{ fontSize: '0.85rem', padding: '5px 12px' }}>
              {risk.level.toUpperCase()}
            </span>
            <p className="text-xs" style={{ marginTop: 6 }}>{risk.activeCount} flags active</p>
          </div>
        </div>

        {/* Score Bar */}
        <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
          <div style={{
            height: '100%', width: `${risk.score}%`,
            background: `linear-gradient(90deg, var(--color-primary), ${RISK_COLORS[risk.level]})`,
            borderRadius: 4, transition: 'width 0.5s ease'
          }} />
        </div>

        {risk.referral && (
          <div style={{
            padding: '8px 12px', borderRadius: 8,
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-risk-high)'
          }}>
            🏥 Referral Recommended → {risk.facility}
          </div>
        )}
      </div>

      {/* Flag Checklist */}
      <div className="section-header">
        <div className="section-icon">🚩</div>
        <h2 className="text-subheading">{t('flags_title')}</h2>
      </div>
      <p className="text-sm" style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
        {t('flags_subtitle')}
      </p>

      <div className="glass-card">
        {ALL_FLAGS.map(flag => (
          <div key={flag.key} className="toggle-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1rem' }}>{flag.icon}</span>
              <div>
                <span className="text-body" style={{ fontSize: '0.875rem' }}>{flag.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  {Array.from({ length: flag.weight }, (_, i) => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: flags[flag.key] ? RISK_COLORS[flag.weight >= 4 ? 'high' : flag.weight >= 3 ? 'moderate' : 'low'] : 'rgba(255,255,255,0.1)'
                    }} />
                  ))}
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>Weight: {flag.weight}</span>
                </div>
              </div>
            </div>
            <label className="toggle">
              <input
                id={`flag-${flag.key}`}
                type="checkbox"
                checked={!!flags[flag.key]}
                onChange={e => toggleFlag(flag.key, e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
