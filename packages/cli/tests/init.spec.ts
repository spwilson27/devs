import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import Database from "better-sqlite3";
import { init } from "../src/index.js";
import { CORE_TABLES } from "../../core/src/persistence/schema.js";

function makeTempProject(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "devs-cli-test-"));
  // Create a package.json marking this as the project root
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "cli-test-project", private: true }));
  return dir;
}

describe("devs init CLI", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTempProject();
  });

  afterEach(() => {
    try {
      if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
    } catch (err) {
      // ignore
    }
  });

  it("creates .devs with state.sqlite and core tables", async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    const devsPath = resolve(tmp, ".devs");
    expect(existsSync(devsPath)).toBe(true);

    const dbPath = resolve(devsPath, "state.sqlite");
    expect(existsSync(dbPath)).toBe(true);

    const db = new Database(dbPath);
    try {
      for (const tbl of CORE_TABLES) {
        const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tbl);
        expect(row).toBeDefined();
        expect(row.name).toBe(tbl);
      }
    } finally {
      db.close();
    }
  });
});
