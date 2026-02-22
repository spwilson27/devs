/**
 * packages/core/test/chaos/sqlite_integrity.test.ts
 *
 * Chaos test for SQLite integrity under abrupt child process termination.
 * Skipped by default to avoid flakiness in CI; enable with RUN_CHAOS_TEST=true.
 */

import { it, expect } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';
import Database from 'better-sqlite3';

const runChaos = process.env.RUN_CHAOS_TEST === 'true';

(runChaos ? it : it.skip)('sqlite chaos integrity (enable with RUN_CHAOS_TEST=true)', async () => {
  const dbPath = join(tmpdir(), `sqlite-chaos-${randomUUID()}.sqlite`);
  const script = join(__dirname, 'child_writer.js');

  const iterations = 5;
  const minDelay = 20;
  const maxDelay = 200;
  const intervalMs = 5;

  for (let i = 0; i < iterations; i++) {
    const child = spawn(process.execPath, [script, dbPath, String(intervalMs)], { stdio: 'ignore' });

    // random delay
    const delay = minDelay + Math.floor(Math.random() * (maxDelay - minDelay));
    await new Promise((res) => setTimeout(res, delay));

    // force kill
    try {
      if (child.pid !== undefined) process.kill(child.pid, 'SIGKILL');
    } catch (e) {}

    // wait for process exit (with a short fallback)
    await new Promise((res) => {
      child.on('exit', () => res(null));
      child.on('error', () => res(null));
      setTimeout(() => res(null), 200);
    });

    // open db and check integrity
    const db = new Database(dbPath, { readonly: true });
    const row = db.prepare('PRAGMA integrity_check').get();
    const val = row && (row.integrity_check ?? Object.values(row)[0]);
    expect(String(val)).toMatch(/ok/i);
    db.close();
  }
}, 120000);
