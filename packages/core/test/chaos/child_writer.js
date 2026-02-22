#!/usr/bin/env node
const Database = require('better-sqlite3');

const dbPath = process.argv[2];
const intervalMs = Number(process.argv[3] || 10);
const maxWrites = Number(process.argv[4] || 1e9);

if (!dbPath) {
  console.error('Usage: child_writer.js <dbPath> [intervalMs] [maxWrites]');
  process.exit(2);
}

const db = new Database(dbPath);

// Best-effort configuration
try { db.pragma('journal_mode = WAL'); } catch (e) {}
try { db.pragma('synchronous = NORMAL'); } catch (e) {}

// Ensure schema exists (idempotent)
db.exec(`CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  type TEXT,
  checkpoint BLOB NOT NULL,
  metadata BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
)`);

const stmt = db.prepare('INSERT OR REPLACE INTO checkpoints (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, type, checkpoint, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)');

let counter = 0;

function writeOne() {
  const threadId = 'chaos-' + process.pid;
  const checkpointId = 'cp-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
  const tr = db.transaction(() => {
    stmt.run(threadId, '', checkpointId, null, 'json', JSON.stringify({ id: checkpointId, ts: new Date().toISOString(), v: counter }), JSON.stringify({ step: counter }));
  });
  tr();
  counter++;
  if (counter % 100 === 0) {
    try { db.pragma('wal_checkpoint(TRUNCATE)'); } catch (e) {}
  }
  if (counter >= maxWrites) process.exit(0);
}

setInterval(writeOne, intervalMs);

process.on('SIGTERM', ()=> process.exit(0));
process.on('SIGINT', ()=> process.exit(0));
