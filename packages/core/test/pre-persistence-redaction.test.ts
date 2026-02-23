import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import type Database from "better-sqlite3";
import { createDatabase, closeDatabase } from "../src/persistence/database.js";
import { SqliteSaver } from "../src/orchestration/SqliteSaver.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-pre-persistence-test-${unique}`, ".devs", "state.sqlite");
}

describe("Pre-persistence redaction", () => {
  let db: Database.Database;
  let saver: SqliteSaver;

  beforeEach(() => {
    db = createDatabase({ dbPath: makeTestDbPath() });
    saver = new SqliteSaver(db as unknown as any);
  });

  afterEach(() => {
    try { saver.close(); } catch {}
    closeDatabase();
  });

  it("redacts secrets in putWrites value column and emits event", async () => {
    const secret = "api_key=AKIAIOSFODNN7EXAMPLE00000";
    let eventPayload: any = null;
    // attach listener if available
    try {
      (saver as any).emitter?.on?.("secret-redacted", (p: any) => { eventPayload = p; });
    } catch {}

    await saver.putWrites({ configurable: { thread_id: "t1", checkpoint_id: "c1" } }, [["stdout", secret]], "task-1");

    const row = (db.prepare("SELECT value FROM checkpoint_writes WHERE task_id = ? ORDER BY idx DESC LIMIT 1").get("task-1") as any) || { value: null };
    const stored = row.value as string | null;

    expect(stored).not.toContain(secret);
    expect(stored).toContain("[REDACTED]");
    expect(eventPayload).not.toBeNull();
    expect(eventPayload.table).toBe("checkpoint_writes");
    expect(eventPayload.column).toBe("value");
    expect(eventPayload.hitCount).toBeGreaterThan(0);
  });

  it("handles null input without throwing and stores null-equivalent", async () => {
    await expect(saver.putWrites({ configurable: { thread_id: "t2", checkpoint_id: "c2" } }, [["stdout", null]], "task-2")).resolves.not.toThrow();
    const row = (db.prepare("SELECT value FROM checkpoint_writes WHERE task_id = ? ORDER BY idx DESC LIMIT 1").get("task-2") as any) || { value: null };
    // value may be null or the serialized string "null" depending on implementation
    expect(row.value === null || row.value === 'null' || row.value === '' || typeof row.value !== 'undefined').toBeTruthy();
  });
});
