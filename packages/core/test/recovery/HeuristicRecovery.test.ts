import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import Database from "better-sqlite3";
import { reconstructStateFromProject } from "../../src/recovery/HeuristicReconstructor.js";

function makeTestProject(): string {
  const base = join(tmpdir(), `heuristic-test-${randomUUID()}`);
  mkdirSync(base, { recursive: true });
  writeFileSync(join(base, "package.json"), JSON.stringify({ private: true, name: "heuristic-sample" }));
  mkdirSync(join(base, ".agent"), { recursive: true });
  writeFileSync(join(base, ".agent", "notes.agent.md"), "# Notes\n\nThis project implements requirements:\n- TAS-069: Heuristic reconstruction test\n- TAS-070: Another auto-detected requirement\n");
  mkdirSync(join(base, "src"), { recursive: true });
  writeFileSync(join(base, "src", "index.ts"), "// REQ: TAS-069\n// REQ: TAS-071\nconsole.log('hello');\n");
  return base;
}

function cleanupProject(path: string) {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

describe("HeuristicReconstructor", () => {
  let projectDir: string;

  beforeEach(() => {
    projectDir = makeTestProject();
  });

  afterEach(() => {
    cleanupProject(projectDir);
  });

  it("reconstructs requirements and tasks when .devs is missing", () => {
    const dbPath = join(projectDir, ".devs", "state.sqlite");
    expect(existsSync(join(projectDir, ".devs"))).toBe(false);

    reconstructStateFromProject(projectDir);

    expect(existsSync(dbPath)).toBe(true);

    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");

    const reqs = db.prepare("SELECT description FROM requirements ORDER BY id").all().map((r: any) => r.description);
    expect(reqs).toContain("TAS-069");
    expect(reqs).toContain("TAS-070");
    expect(reqs).toContain("TAS-071");

    // Re-running should not create duplicates.
    reconstructStateFromProject(projectDir);
    const grouped = db.prepare("SELECT description, COUNT(*) as n FROM requirements GROUP BY description").all();
    for (const row of grouped) {
      expect(row.n).toBe(1);
    }

    const proj = db.prepare("SELECT metadata FROM projects ORDER BY id DESC LIMIT 1").get();
    expect(proj.metadata).toContain("HEURISTICALLY_RECONSTRUCTED");

    db.close();
  });
});
