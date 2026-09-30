import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../db/dexie';
import { syncPendingRecords, getPendingCount } from '../services/syncService';
import AppIcon from '../components/AppIcon';

// Mock beneficiary data — replace with Dexie/API query in production
const MOCK_BENEFICIARIES = [
  { beneficiary_id: 'BEN-001', name: 'Priya Sharma', village: 'Rampur', anc_contact: 3, risk: 'moderate', age: 24 },
  { beneficiary_id: 'BEN-002', name: 'Sunita Devi', village: 'Khandwa', anc_contact: 1, risk: 'high', age: 31 },
  { beneficiary_id: 'BEN-003', name: 'Meena Kumari', village: 'Bareli', anc_contact: 6, risk: 'low', age: 22 },
  { beneficiary_id: 'BEN-004', name: 'Asha Verma', village: 'Dholpur', anc_contact: 2, risk: 'low', age: 27 },
];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function RiskBadge({ level }) {
  return <span className={`risk-badge ${level}`}>{level.toUpperCase()}</span>;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const workerId = localStorage.getItem('worker_id') || 'ASHA-001';
  const workerRole = localStorage.getItem('worker_role') || 'ASHA';

  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);

  useEffect(() => {
    (async () => {
      const count = await getPendingCount();
      setPendingCount(count);
      const recs = await db.records.orderBy('created_at').reverse().limit(5).toArray();
      setRecentRecords(recs);
    })();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await syncPendingRecords();
      setSyncResult(result);
      const newCount = await getPendingCount();
      setPendingCount(newCount);
    } catch {
      setSyncResult({ synced: 0, failed: pendingCount });
    } finally {
      setIsSyncing(false);
    }
  };

  const highRiskCount = MOCK_BENEFICIARIES.filter(b => b.risk === 'high' || b.risk === 'critical').length;

  return (
    <div className="page dashboard-page fade-in-up">
      {/* Header */}
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Today’s field overview</p>
            <h1 className="text-heading">
              {t('dashboard_greeting', { time: getTimeOfDay(), name: workerId })}
            </h1>
            <p className="text-sm">{t('dashboard_role', { role: workerRole })}</p>
          </div>
          <div className="worker-avatar" aria-label={`Signed in as ${workerId}`}>
            {workerId.slice(0, 1)}<span />
          </div>
        </div>
      </header>

      {/* Sync Banner */}
      {pendingCount > 0 && (
        <div className="glass-card glass-card-sm flex items-center justify-between"
          style={{ marginBottom: 'var(--space-4)', borderColor: 'rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)' }}>
          <div>
            <p className="text-sm" style={{ color: 'var(--color-accent-amber)' }}>
              ⚠ {t('pending_sync', { count: pendingCount })}
            </p>
            {syncResult && (
              <p className="text-xs" style={{ marginTop: 2 }}>
                {syncResult.synced} synced · {syncResult.failed} failed
              </p>
            )}
          </div>
          <button
            id="sync-now-btn"
            className="btn btn-sm"
            onClick={handleSync}
            disabled={isSyncing}
            style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--color-accent-amber)', border: '1px solid rgba(245,158,11,0.3)' }}
          >
            {isSyncing ? <span className="spin">⟳</span> : '↑'} {t('sync_now')}
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stat-grid dashboard-stats">
        <div className="stat-card">
          <span className="stat-icon teal"><AppIcon name="users" size={20} /></span>
          <span className="stat-value">{MOCK_BENEFICIARIES.length}</span>
          <span className="stat-label">{t('total_beneficiaries')}</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon plum"><AppIcon name="clipboard" size={20} /></span>
          <span className="stat-value">2</span>
          <span className="stat-label">{t('todays_visits')}</span>
        </div>
        <div className="stat-card risk-stat">
          <span className="stat-icon coral"><AppIcon name="alert" size={20} /></span>
          <span className="stat-value" style={{ color: 'var(--color-risk-high)' }}>{highRiskCount}</span>
          <span className="stat-label">{t('high_risk')}</span>
        </div>
        <div className="stat-card synced-stat">
          <span className="stat-icon green"><AppIcon name="check" size={20} /></span>
          <span className="stat-value" style={{ color: 'var(--color-risk-low)' }}>
            {recentRecords.filter(r => r.sync_status === 'synced').length}
          </span>
          <span className="stat-label">{t('synced_today')}</span>
        </div>
      </div>

      <section className="quick-actions" aria-labelledby="quick-actions-title">
        <div className="section-title-row"><div><p className="eyebrow">Care actions</p><h2 id="quick-actions-title">What would you like to do?</h2></div></div>
        <div className="action-grid">
          <button id="add-new-anc-btn" className="action-card primary-action" onClick={() => navigate('/anc/new')}>
            <span className="action-icon"><AppIcon name="plus" size={24} /></span><span><strong>{t('add_new_anc')}</strong><small>Record vitals, labs and pregnancy risks</small></span><AppIcon name="chevron" size={20} />
          </button>
          <button id="start-mental-health-checkin-btn" className="action-card wellbeing-action" onClick={() => navigate('/mental-health/new')}>
            <span className="action-icon"><AppIcon name="heart" size={24} /></span><span><strong>Wellbeing check-in</strong><small>Support emotional health before and after birth</small></span><AppIcon name="chevron" size={20} />
          </button>
        </div>
      </section>

      {/* Beneficiary List */}
      <section className="records-section">
        <div className="section-header">
          <div className="section-icon"><AppIcon name="users" size={19} /></div>
          <div><p className="eyebrow">Care list</p><h2 className="text-subheading">{t('recent_records')}</h2></div>
        </div>

        {recentRecords.length > 0 ? (
          recentRecords.map(rec => (
            <button
              key={rec.record_id}
              id={`record-${rec.record_id}`}
              className="beneficiary-card"
              onClick={() => navigate(`/records/${rec.record_id}`)}
            >
              <div className="beneficiary-avatar">
                {rec.beneficiary_id?.slice(0, 1) || 'B'}
              </div>
              <div className="beneficiary-info">
                <div className="beneficiary-name">{rec.beneficiary_id}</div>
                <div className="beneficiary-meta">
                  ANC #{rec.anc_contact_number} · {rec.visit_date}
                </div>
                <div style={{ marginTop: 4 }}>
                  <RiskBadge level={rec.risk_summary?.risk_level || 'low'} />
                  {rec.sync_status === 'pending' && (
                    <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--color-accent-amber)' }}>⚠ Pending sync</span>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <>
            {MOCK_BENEFICIARIES.map(b => (
              <button
                key={b.beneficiary_id}
                id={`beneficiary-${b.beneficiary_id}`}
                className="beneficiary-card"
                onClick={() => navigate('/anc/new', { state: { beneficiary: b } })}
              >
                <div className="beneficiary-avatar">{b.name.slice(0, 1)}</div>
                <div className="beneficiary-info">
                  <div className="beneficiary-name">{b.name}</div>
                  <div className="beneficiary-meta">
                    {b.village} · ANC #{b.anc_contact} · Age {b.age}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <RiskBadge level={b.risk} />
                  </div>
                </div>
                <AppIcon name="chevron" size={19} className="card-chevron" />
              </button>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
