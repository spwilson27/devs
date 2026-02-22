// @devs/cli — CLI tool entry point.

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { getDatabase } from "../../core/src/persistence/database.js";
import { initializeSchema } from "../../core/src/persistence/schema.js";
import { StateRepository } from "../../core/src/persistence/state_repository.js";
import { resolveDevsDir } from "../../core/src/persistence.js";
import { SharedEventBus, EVENTBUS_SOCKET_NAME } from "../../core/src/events/SharedEventBus.js";

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

export async function pause(opts: { projectDir?: string; reason?: string } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();
  const db = getDatabase({ fromDir: projectDir });
  try {
    initializeSchema(db);
  } catch (err) {
    console.error("devs: failed to initialise schema:", err);
    return 1;
  }

  const projectRow = db.prepare("SELECT id, name, status, metadata FROM projects ORDER BY id LIMIT 1").get();
  if (!projectRow) {
    console.error("devs: no project found; run 'devs init' first");
    return 2;
  }

  const repo = new StateRepository(db);
  if (projectRow.status === "PAUSED") {
    console.log("Project already paused");
    return 0;
  }

  repo.upsertProject({ id: projectRow.id, name: projectRow.name, status: "PAUSED", metadata: projectRow.metadata });

  try {
    const socketPath = path.join(resolveDevsDir(projectDir), EVENTBUS_SOCKET_NAME);
    const bus = await SharedEventBus.createClient(socketPath);
    bus.publish("PAUSE", { requestedBy: "cli", reason: opts.reason, timestamp: new Date().toISOString() });
    await bus.close();
  } catch (err) {
    // No bus server running; warn but continue
    console.warn("devs: warning: could not publish PAUSE event:", err?.message ?? err);
  }

  console.log("Project Paused");
  return 0;
}

export async function resume(opts: { projectDir?: string } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();
  const db = getDatabase({ fromDir: projectDir });
  try {
    initializeSchema(db);
  } catch (err) {
    console.error("devs: failed to initialise schema:", err);
    return 1;
  }

  const projectRow = db.prepare("SELECT id, name, status, metadata FROM projects ORDER BY id LIMIT 1").get();
  if (!projectRow) {
    console.error("devs: no project found; run 'devs init' first");
    return 2;
  }

  const repo = new StateRepository(db);
  if (projectRow.status === "ACTIVE") {
    console.log("Project already running");
    return 0;
  }

  repo.upsertProject({ id: projectRow.id, name: projectRow.name, status: "ACTIVE", metadata: projectRow.metadata });

  try {
    const socketPath = path.join(resolveDevsDir(projectDir), EVENTBUS_SOCKET_NAME);
    const bus = await SharedEventBus.createClient(socketPath);
    bus.publish("RESUME", { requestedBy: "cli", timestamp: new Date().toISOString() });
    await bus.close();
  } catch (err) {
    console.warn("devs: warning: could not publish RESUME event:", err?.message ?? err);
  }

  console.log("Resuming Orchestration");
  return 0;
}

export async function skip(opts: { projectDir?: string } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();
  const db = getDatabase({ fromDir: projectDir });
  try {
    initializeSchema(db);
  } catch (err) {
    console.error("devs: failed to initialise schema:", err);
    return 1;
  }

  const proj = db.prepare("SELECT id FROM projects ORDER BY id LIMIT 1").get();
  if (!proj) {
    console.error("devs: no project found; run 'devs init' first");
    return 2;
  }
  const projectId = proj.id;

  const repo = new StateRepository(db);

  let task = db.prepare(`
    SELECT t.id, t.status FROM tasks t
    JOIN epics e ON t.epic_id = e.id
    WHERE e.project_id = ? AND t.status = 'in_progress'
    ORDER BY t.id LIMIT 1
  `).get(projectId);

  if (!task) {
    task = db.prepare(`
      SELECT t.id, t.status FROM tasks t
      JOIN epics e ON t.epic_id = e.id
      WHERE e.project_id = ? AND t.status = 'pending'
      ORDER BY t.id LIMIT 1
    `).get(projectId);
  }

  if (!task) {
    console.log("No active task to skip");
    return 0;
  }

  repo.updateTaskStatus(task.id, "SKIPPED");

  try {
    const socketPath = path.join(resolveDevsDir(projectDir), EVENTBUS_SOCKET_NAME);
    const bus = await SharedEventBus.createClient(socketPath);
    bus.publish("STATE_CHANGE", { entityType: 'task', entityId: task.id, previousStatus: task.status, newStatus: 'SKIPPED', timestamp: new Date().toISOString() });
    await bus.close();
  } catch (err) {
    console.warn("devs: warning: could not publish STATE_CHANGE event:", err?.message ?? err);
  }

  console.log("Task skipped:", task.id);
  return 0;
}

export async function rewind(opts: { projectDir?: string; taskId?: number } = {}) {
  const projectDir = opts.projectDir ?? process.cwd();
  if (opts.taskId === undefined || opts.taskId === null) {
    console.error("devs: missing taskId");
    return 2;
  }

  const db = getDatabase({ fromDir: projectDir });
  try {
    initializeSchema(db);
  } catch (err) {
    // ignore
  }

  const taskRow = db.prepare("SELECT id, git_commit_hash FROM tasks WHERE id = ?").get(opts.taskId);
  if (!taskRow) {
    console.error("devs: task not found");
    return 2;
  }
  const hash = taskRow.git_commit_hash;
  if (!hash) {
    console.error("devs: task has no associated git_commit_hash");
    return 2;
  }

  // Prevent destructive action if there are uncommitted changes
  try {
    const status = execSync("git status --porcelain", { cwd: projectDir }).toString().trim();
    if (status) {
      console.error("devs: uncommitted changes present; commit or stash before rewinding");
      return 3;
    }
  } catch (err) {
    console.error("devs: git error checking status:", err?.message ?? err);
    return 4;
  }

  // Verify commit exists and perform hard reset
  try {
    execSync(`git rev-parse --verify ${hash}`, { cwd: projectDir });
  } catch (err) {
    console.error("devs: commit hash not found in repository:", hash);
    return 4;
  }

  try {
    execSync(`git reset --hard ${hash}`, { cwd: projectDir });
  } catch (err) {
    console.error("devs: git reset failed:", err?.message ?? err);
    return 5;
  }

  const repo = new StateRepository(db);

  // Mark subsequent tasks as pending and set target to in_progress
  const later = db.prepare("SELECT id FROM tasks WHERE id > ? ORDER BY id").all(opts.taskId) as { id: number }[];
  for (const r of later) {
    repo.updateTaskStatus(r.id, "pending");
  }

  repo.updateTaskStatus(opts.taskId, "in_progress");

  // Update project metadata to record current task
  const proj = db.prepare("SELECT id, name, status, metadata FROM projects ORDER BY id LIMIT 1").get();
  if (proj) {
    let meta: any = {};
    try {
      meta = proj.metadata ? JSON.parse(proj.metadata) : {};
    } catch (e) {
      meta = { _raw_metadata: proj.metadata };
    }
    meta.current_task = opts.taskId;
    repo.upsertProject({ id: proj.id, name: proj.name, status: proj.status, metadata: JSON.stringify(meta) });
  }

  try {
    const socketPath = path.join(resolveDevsDir(projectDir), EVENTBUS_SOCKET_NAME);
    const bus = await SharedEventBus.createClient(socketPath);
    bus.publish("REWIND", { requestedBy: "cli", taskId: opts.taskId, commit: hash, timestamp: new Date().toISOString() });
    await bus.close();
  } catch (err) {
    // No bus available — non-fatal
  }

  console.log("Rewound to task", opts.taskId, "commit", hash);
  return 0;
}

export default { init, status, pause, resume, skip, rewind };
