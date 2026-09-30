// Sync Service — manages offline queue and sync to FastAPI backend

import { db } from '../db/dexie';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeader() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Save a new ANC record to IndexedDB with sync_status = 'pending'
 */
export async function saveRecordOffline(record) {
  const entry = {
    ...record,
    sync_status: 'pending',
    created_at: new Date().toISOString(),
  };
  await db.records.put(entry);
  return entry;
}

/**
 * Attempt to sync all pending records to the backend.
 * Returns { synced: N, failed: N }
 */
export async function syncPendingRecords(onProgress) {
  const pending = await db.records
    .where('sync_status')
    .equals('pending')
    .toArray();

  let synced = 0;
  let failed = 0;

  for (const record of pending) {
    try {
      const response = await axios.post(
        `${API_BASE}/records/submit`,
        record,
        { headers: { 'Content-Type': 'application/json', ...getAuthHeader() } }
      );

      await db.records.update(record.record_id, {
        sync_status: 'synced',
        synced_at: new Date().toISOString(),
        risk_summary: response.data.risk_summary,
      });

      await db.sync_log.add({
        record_id: record.record_id,
        status: 'synced',
        attempted_at: new Date().toISOString(),
      });

      synced++;
      onProgress?.({ type: 'synced', record_id: record.record_id });
    } catch (err) {
      await db.records.update(record.record_id, { sync_status: 'failed' });
      await db.sync_log.add({
        record_id: record.record_id,
        status: 'failed',
        attempted_at: new Date().toISOString(),
        error: err.message,
      });
      failed++;
      onProgress?.({ type: 'failed', record_id: record.record_id, error: err.message });
    }
  }

  return { synced, failed, total: pending.length };
}

/**
 * Get count of pending (unsynced) records
 */
export async function getPendingCount() {
  return db.records.where('sync_status').equals('pending').count();
}

/**
 * Listen for online event and auto-sync
 */
export function registerAutoSync(onComplete) {
  const handler = async () => {
    const result = await syncPendingRecords();
    onComplete?.(result);
  };
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
