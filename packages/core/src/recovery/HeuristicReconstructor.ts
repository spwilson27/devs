/**
 * packages/core/src/recovery/HeuristicReconstructor.ts
 *
 * Heuristic state reconstruction scans project .agent/ markdown files and
 * source code comments to extract requirement identifiers and rebuilds a
 * minimal Flight Recorder state.sqlite when the `.devs/` DB is missing.
 *
 * This is intentionally best-effort and marks reconstructed state via project
 * metadata: { reconstructed: true, method: 'HEURISTICALLY_RECONSTRUCTED' }.
 */

import { existsSync, readFileSync, readdirSync, statSync, openSync, closeSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import Database from "better-sqlite3";
import { ensureDirSync } from "fs-extra";
import { findProjectRoot } from "../persistence.js";
import { STATE_FILE_PATH } from "../constants.js";
import { initializeSchema } from "../persistence/schema.js";
import { StateRepository } from "../persistence/state_repository.js";

export function reconstructStateFromProject(projectDir: string = process.cwd()): void {
  const root = findProjectRoot(projectDir);
  if (root === null) {
    throw new Error(`Cannot find project root from '${projectDir}'`);
  }

  const dbPath = resolve(root, STATE_FILE_PATH);

  // Nothing to do if DB already exists.
  if (existsSync(dbPath)) return;

  // Ensure .devs directory exists and pre-create the database file with
  // restrictive permissions (0600) before opening with better-sqlite3.
  ensureDirSync(dirname(dbPath));
  try {
    const fd = openSync(dbPath, "w", 0o600);
    closeSync(fd);
  } catch (err) {
    // Best-effort: if file creation fails we'll still try to open the DB and
    // let better-sqlite3 handle it.
  }

  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");

  // Initialize core schema.
  initializeSchema(db);

  const repo = new StateRepository(db);

  // Derive a project name from package.json if available.
  let projectName = basename(root);
  try {
    const pkg = readFileSync(resolve(root, "package.json"), "utf8");
    const parsed = JSON.parse(pkg);
    if (parsed && typeof parsed.name === "string") projectName = parsed.name;
  } catch {
    // ignore
  }

  const metadata = JSON.stringify({ reconstructed: true, method: "HEURISTICALLY_RECONSTRUCTED" });
  const projectId = repo.upsertProject({ name: projectName, metadata });

  // Heuristic ID regex (matches common forms like TAS-069, REQ-12, etc.).
  const ID_REGEX = /[A-Z]{2,}[-_]\d{2,}/g;

  const idsFound: Map<string, Set<string>> = new Map();

  function collectIdsFromText(text: string, filePath: string) {
    const matches = text.match(ID_REGEX);
    if (!matches) return;
    for (const m of matches) {
      if (!idsFound.has(m)) idsFound.set(m, new Set());
      idsFound.get(m)!.add(filePath);
    }
  }

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const p = resolve(dir, name);
      let s: any;
      try {
        s = statSync(p);
      } catch {
        continue;
      }
      if (s.isDirectory()) {
        walk(p);
      } else if (s.isFile()) {
        try {
          const txt = readFileSync(p, "utf8");
          collectIdsFromText(txt, p);
        } catch {
          // ignore unreadable files
        }
      }
    }
  }

  // Scan .agent docs and source files.
  walk(resolve(root, ".agent"));
  walk(resolve(root, "src"));

  const ids = Array.from(idsFound.keys());
  if (ids.length === 0) {
    db.close();
    return;
  }

  // Insert requirements (avoid duplicates by checking existing descriptions).
  const existing = db
    .prepare("SELECT description FROM requirements WHERE project_id = ?")
    .all(projectId)
    .map((r: any) => r.description) as string[];

  const newReqs = ids
    .filter((id) => !existing.includes(id))
    .map((id) => ({ project_id: projectId, description: id, metadata: JSON.stringify({ source: "heuristic", files: Array.from(idsFound.get(id)!) }) }));

  if (newReqs.length > 0) repo.saveRequirements(newReqs as any);

  // Create a single heuristic epic and tasks mapping to requirements.
  repo.saveEpics([{ project_id: projectId, name: "Heuristic Reconstruction", order_index: 0, status: "HEURISTICALLY_RECONSTRUCTED" }]);
  const epicRow = db.prepare("SELECT id FROM epics WHERE project_id = ? ORDER BY id DESC LIMIT 1").get(projectId) as { id: number };
  const epicId = epicRow.id;

  // Insert tasks only for requirement ids that don't already have a task with the same title.
  const existingTasks = db
    .prepare("SELECT title FROM tasks t JOIN epics e ON t.epic_id = e.id WHERE e.project_id = ?")
    .all(projectId)
    .map((r: any) => r.title) as string[];

  const tasksToInsert = ids
    .map((id) => ({ epic_id: epicId, title: `Implement ${id}`, description: `Auto-generated task for ${id}`, status: "pending" }))
    .filter((t) => !existingTasks.includes(t.title));

  if (tasksToInsert.length > 0) repo.saveTasks(tasksToInsert as any);

  db.close();
}
