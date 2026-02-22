import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import type Database from "better-sqlite3";

import { createDatabase, closeDatabase } from "../../src/persistence/database.js";
import { initializeSchema } from "../../src/persistence/schema.js";
import { StateRepository } from "../../src/persistence/state_repository.js";
import { InputIngestor } from "../../src/InputIngestor.js";
import { LocalityGuard } from "../../src/LocalityGuard.js";

function makeTestDbPath(): string {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return resolve(tmpdir(), `devs-input-ingestor-test-${unique}`, ".devs", "state.sqlite");
}

function rowCount(db: Database.Database, table: string): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
}

describe("InputIngestor and LocalityGuard", () => {
  let db: Database.Database;
  let repo: StateRepository;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = makeTestDbPath();
    db = createDatabase({ dbPath: testDbPath });
    initializeSchema(db);
    repo = new StateRepository(db);
  });

  afterEach(() => {
    db.close();
    closeDatabase();
    const testRoot = resolve(dirname(testDbPath), "..");
    if (existsSync(testRoot)) {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });

  it("ingests a project brief and user journeys into projects+documents", () => {
    const ingestor = new InputIngestor(repo);
    const projectId = ingestor.ingest({
      projectName: "alpha-test",
      brief: "# Project Brief\n\nThis is the PRD.",
      userJourneys: [{ name: "journey-1", steps: ["step1"] }],
    });

    expect(typeof projectId).toBe("number");

    const docs = db.prepare("SELECT name, content FROM documents WHERE project_id = ? ORDER BY id").all(projectId);
    expect(docs.length).toBeGreaterThanOrEqual(2);

    const brief = docs.find((d: any) => d.name === "Project Brief");
    expect(brief).toBeTruthy();
    expect(brief.content).toContain("PRD");

    const journeys = docs.find((d: any) => d.name === "User Journeys");
    expect(journeys).toBeTruthy();
    expect(journeys.content).toContain("journey-1");
  });

  it("enforces data locality: findings are persisted and agent cleared", async () => {
    // Prepare a project to attach findings to.
    const projectId = repo.upsertProject({ name: "locality-project" });
    const guard = new LocalityGuard(repo, projectId);

    class FakeAgent {
      async act() {
        // Simulate agent writing ephemeral findings and private state.
        (this as any).findings = [
          { name: "Market Research Results", content: "# Market Research\nFindings" },
        ];
        (this as any).state = { cursor: 123 };
        return { success: true };
      }
    }

    const agent = new FakeAgent();
    await guard.runTurn(agent, () => (agent as any).act());

    // Agent should not retain ephemeral keys.
    expect((agent as any).findings).toBeUndefined();
    expect((agent as any).state).toBeUndefined();

    // The findings must have been written to documents or agent_logs; check documents.
    const rows = db.prepare("SELECT name, content FROM documents WHERE project_id = ?").all(projectId);
    const found = rows.find((r: any) => r.name === "Market Research Results");
    expect(found).toBeTruthy();
    expect(found.content).toContain("Market Research");
  });
});
