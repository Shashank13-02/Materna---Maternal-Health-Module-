// Dexie IndexedDB schema for offline ANC record storage

import Dexie from 'dexie';

export const db = new Dexie('MaternalHealthDB');

db.version(1).stores({
  // Primary ANC record store — indexed by sync status for efficient sync queue queries
  records: 'record_id, beneficiary_id, worker_id, visit_date, sync_status, created_at',

  // Beneficiary registry (cached from server or created locally)
  beneficiaries: 'beneficiary_id, name, phone, village, anc_count',

  // Sync event log for auditing
  sync_log: '++id, record_id, status, attempted_at',
});

// Legacy custom check-ins retained for compatibility; separation is NOT access
// control or encryption. The new self-check neither reads nor writes this table.
db.version(2).stores({
  records: 'record_id, beneficiary_id, worker_id, visit_date, sync_status, created_at',
  beneficiaries: 'beneficiary_id, name, phone, village, anc_count',
  sync_log: '++id, record_id, status, attempted_at',
  mental_health_checkins: 'checkin_id, beneficiary_id, worker_id, assessment_date, care_stage, priority, follow_up_due, created_at',
});

export default db;
