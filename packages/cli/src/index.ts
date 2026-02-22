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

export default { init };
