// @devs/cli — CLI tool entry point.

import fs from "node:fs";
import path from "node:path";
import { getDatabase } from "../../core/src/persistence/database.js";
import { initializeSchema } from "../../core/src/persistence/schema.js";
import { StateRepository } from "../../core/src/persistence/state_repository.js";
import { resolveDevsDir } from "../../core/src/persistence.js";

export async function init(opts: { projectDir?: string; force?: boolean } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();
  // Resolve .devs directory; fallback to projectDir/.devs if resolution fails
  let devsDir: string;
  try {
    devsDir = resolveDevsDir(projectDir);
  } catch (err) {
    devsDir = path.resolve(projectDir, ".devs");
  }

  // Warn if already initialized (unless forced)
  if (fs.existsSync(devsDir) && !opts.force) {
    console.warn("devs: already initialized at %s", devsDir);
    return 0;
  }

  // Create .devs with restrictive permissions (0700)
  fs.mkdirSync(devsDir, { recursive: true, mode: 0o700 });

  // Ensure a project-level .gitignore contains .devs
  const gitignorePath = path.join(projectDir, ".gitignore");
  try {
    if (!fs.existsSync(gitignorePath)) {
      fs.writeFileSync(gitignorePath, ".devs\n");
    } else {
      const content = fs.readFileSync(gitignorePath, "utf8");
      const lines = content.split(/\r?\n/);
      if (!lines.includes(".devs")) {
        fs.appendFileSync(gitignorePath, "\n# devs runtime state\n.devs\n");
      }
    }
  } catch (err) {
    // Non-fatal: continue even if gitignore cannot be written
  }

  // Initialize the SQLite state via @devs/core persistence
  const db = getDatabase({ fromDir: projectDir });
  try {
    initializeSchema(db);
  } catch (err) {
    console.error("devs: failed to initialise schema:", err);
    return 1;
  }

  // Populate initial project metadata
  try {
    const repo = new StateRepository(db);
    let projectName = path.basename(projectDir);
    try {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, "package.json"), "utf8"));
      if (pkg && typeof pkg.name === "string") projectName = pkg.name;
    } catch {
      // ignore
    }
    repo.upsertProject({ name: projectName, metadata: JSON.stringify({ createdBy: "@devs/cli", createdAt: new Date().toISOString() }) });
  } catch (err) {
    console.error("devs: failed to populate initial project metadata:", err);
    // Not fatal
  }

  console.log("devs: initialized at %s", devsDir);
  return 0;
}

export async function status(opts: { projectDir?: string } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();

  // Resolve .devs directory; fallback to projectDir/.devs if resolution fails
  let devsDir: string;
  try {
    devsDir = resolveDevsDir(projectDir);
  } catch (err) {
    devsDir = path.resolve(projectDir, ".devs");
  }

  const dbPath = path.join(devsDir, "state.sqlite");
  if (!fs.existsSync(devsDir) || !fs.existsSync(dbPath)) {
    throw new Error(`devs: not initialized at ${devsDir}`);
  }

  const db = getDatabase({ fromDir: projectDir });
  const repo = new StateRepository(db);

  // Find the most-recent project row
  let projectRow: any;
  try {
    projectRow = db.prepare("SELECT * FROM projects ORDER BY id DESC LIMIT 1").get();
  } catch (err) {
    throw new Error(`devs: failed to read project metadata: ${err && err.message ? err.message : String(err)}`);
  }

  if (!projectRow) {
    throw new Error("devs: no project metadata found in state store");
  }

  const projectId = Number(projectRow.id);
  const state = repo.getProjectState(projectId);
  if (!state) {
    throw new Error("devs: failed to load project state");
  }

  const epics = state.epics ?? [];
  const tasks = state.tasks ?? [];

  let activeEpic: any = null;
  let activeTask: any = null;

  for (const epic of epics) {
    const epicTasks = tasks.filter((t: any) => t.epic_id === epic.id);
    const nonCompleted = epicTasks.find((t: any) => t.status !== "completed") ?? epicTasks[0];
    if (nonCompleted) {
      activeEpic = epic;
      activeTask = nonCompleted;
      break;
    }
  }

  if (!activeEpic && epics.length > 0) {
    activeEpic = epics[0];
    const epicTasks = tasks.filter((t: any) => t.epic_id === activeEpic.id);
    activeTask = epicTasks[0] ?? null;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "completed").length;
  const percent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    project: {
      id: projectRow.id,
      name: projectRow.name,
      status: projectRow.status,
      current_phase: projectRow.current_phase,
      last_milestone: projectRow.last_milestone,
      metadata: projectRow.metadata,
    },
    active_epic: activeEpic
      ? { id: activeEpic.id, name: activeEpic.name, status: activeEpic.status }
      : null,
    active_task: activeTask
      ? { id: activeTask.id, epic_id: activeTask.epic_id, title: activeTask.title, status: activeTask.status }
      : null,
    progress: { total: totalTasks, completed: completedTasks, percent },
  };
}

export default { init, status };
