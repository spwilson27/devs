import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import Database from "better-sqlite3";
import { init } from "../src/index.js";

function makeTempProject(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "devs-cli-test-"));
  // Create a package.json marking this as the project root
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "cli-test-project", private: true }));
  return dir;
}

describe("devs status live sync (integration)", () => {
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

  it("reflects state changes after a manual state update and event emit", { timeout: 10000 }, async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    const devsDir = resolve(tmp, ".devs");
    const dbPath = resolve(devsDir, "state.sqlite");
    const db = new Database(dbPath);

    try {
      // Insert a dummy epic to attach tasks to
      db.prepare(`INSERT INTO epics (name, status) VALUES (?, ?)`).run("sync-test-epic", "in_progress");
      const epicRow = db.prepare(`SELECT id FROM epics WHERE name = ? ORDER BY id DESC LIMIT 1`).get("sync-test-epic");
      expect(epicRow).toBeDefined();
      const epicId = epicRow.id;

      // Spawn the CLI status command as a separate process (simulates a long-running TUI or watcher)
      const node = process.execPath;
      const bin = resolve(__dirname, "../src/bin.ts");
      const proc = spawn(node, [bin, "status"], { cwd: tmp, stdio: ["ignore", "pipe", "pipe"] });

      let out = "";
      proc.stdout.on("data", (d) => { out += d.toString(); });

      // Short delay to let the process start
      await new Promise((res) => setTimeout(res, 50));

      // Update the state store by adding a task
      db.prepare(`INSERT INTO tasks (epic_id, title, status) VALUES (?, ?, ?)`).run(epicId, "sync-test-task", "pending");

      // Best-effort: emit a STATE_CHANGE event via core events module if available
      try {
        const events = await import("../../core/src/events.js");
        if (events && typeof events.emit === "function") {
          events.emit("STATE_CHANGE", { projectDir: tmp });
        }
      } catch (err) {
        // ignore if not present
      }

      // Wait a short time for any live watcher to react
      await new Promise((res) => setTimeout(res, 200));

      // Terminate the spawned process
      try { proc.kill(); } catch {}

      // The CLI output should include the newly added task when live-sync works.
      expect(out).toContain("sync-test-task");
    } finally {
      db.close();
    }
  });
});
