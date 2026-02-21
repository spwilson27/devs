/**
 * @devs/core — GitIgnoreManager
 *
 * Manages `.gitignore` files for generated projects to enforce the devs
 * git exclusion policy (UNKNOWN-601, UNKNOWN-602):
 *
 * - `.devs/` (Flight Recorder runtime state) MUST always be excluded from
 *   the generated project's git history — the "Project Evolution" trail.
 * - `.agent/` (AOD documentation) MUST always be tracked — never excluded.
 * - `.env` (environment secrets) MUST be excluded.
 *
 * This module operates on the *generated project's* `.gitignore`, NOT on the
 * devs repo itself (the devs repo uses a separate `.devs/.gitignore` strategy).
 */

import fs from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Entries that `GitIgnoreManager` ensures are present in every generated
 * project's `.gitignore`.
 *
 * Rationale per entry:
 *  - `.devs/`       — Flight Recorder state. Developer Agents must never
 *                     accidentally commit devs runtime files into the project.
 *  - `node_modules/` — Standard Node.js/pnpm dependency tree.
 *  - `dist/`        — TypeScript/bundler build output.
 *  - `.env`         — Environment secrets. Must never be committed.
 *  - `.env.local`   — Local environment overrides.
 */
export const STANDARD_IGNORES: readonly string[] = [
  ".devs/",
  "node_modules/",
  "dist/",
  ".env",
  ".env.local",
] as const;

/**
 * Entries that devs ensures are NEVER added to `.gitignore`.
 * These are devs-managed artifacts that must be tracked in VCS for the
 * AOD (Agent-Oriented Documentation) density requirement.
 *
 *  - `.agent/`  — AOD documentation files. Must be tracked so agents can
 *                 query the project's architectural decisions.
 */
export const TRACKED_DEVS_ARTIFACTS: readonly string[] = [
  ".agent/",
] as const;

// ---------------------------------------------------------------------------
// GitIgnoreManagerError
// ---------------------------------------------------------------------------

/**
 * Thrown by `GitIgnoreManager` methods on I/O failure.
 * The underlying OS error is preserved as `cause`.
 */
export class GitIgnoreManagerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GitIgnoreManagerError";
  }
}

// ---------------------------------------------------------------------------
// GitIgnoreManager
// ---------------------------------------------------------------------------

export class GitIgnoreManager {
  /**
   * Ensures that all `STANDARD_IGNORES` entries are present in the project's
   * `.gitignore`. Creates the file if it does not exist. Appends only missing
   * entries — never removes or reorders existing content. Idempotent.
   *
   * @param projectPath - Absolute path to the generated project root.
   * @throws {GitIgnoreManagerError} If the file cannot be read or written.
   */
  static ensureStandardIgnores(projectPath: string): void {
    const gitignorePath = path.join(projectPath, ".gitignore");

    let existingContent = "";
    if (fs.existsSync(gitignorePath)) {
      try {
        existingContent = fs.readFileSync(gitignorePath, "utf8");
      } catch (err) {
        throw new GitIgnoreManagerError(
          `Failed to read .gitignore at '${gitignorePath}'`,
          { cause: err as Error }
        );
      }
    }

    const existingLines = new Set(
      existingContent.split("\n").map((l) => l.trim())
    );

    // An entry matches if the exact string or its de-trailed-slash form is present.
    const missing = STANDARD_IGNORES.filter(
      (entry) =>
        !existingLines.has(entry) &&
        !existingLines.has(entry.replace(/\/$/, ""))
    );

    if (missing.length === 0) return;

    const toAppend =
      "\n# devs internal — auto-added by GitIgnoreManager\n" +
      missing.join("\n") +
      "\n";

    const newContent = existingContent
      ? existingContent.trimEnd() + toAppend
      : toAppend.trimStart();

    try {
      fs.writeFileSync(gitignorePath, newContent, "utf8");
    } catch (err) {
      throw new GitIgnoreManagerError(
        `Failed to write .gitignore at '${gitignorePath}'`,
        { cause: err as Error }
      );
    }
  }

  /**
   * Returns `true` if the relative path matches one of the `STANDARD_IGNORES`
   * entries (i.e., it should be excluded from the project's git history).
   *
   * Used by `SnapshotManager` to pre-screen files before staging.
   *
   * @param relativePath - Path relative to the project root.
   */
  static isDevsIgnored(relativePath: string): boolean {
    return STANDARD_IGNORES.some((entry) => {
      const bare = entry.endsWith("/") ? entry.slice(0, -1) : entry;
      return (
        relativePath === entry ||
        relativePath === bare ||
        relativePath.startsWith(bare + "/")
      );
    });
  }

  /**
   * Returns `true` if the relative path is a devs artifact that should always
   * be tracked (i.e., must NOT be added to `.gitignore`).
   *
   * @param relativePath - Path relative to the project root.
   */
  static isTrackedDevsArtifact(relativePath: string): boolean {
    return TRACKED_DEVS_ARTIFACTS.some((entry) => {
      const bare = entry.endsWith("/") ? entry.slice(0, -1) : entry;
      return (
        relativePath === entry ||
        relativePath === bare ||
        relativePath.startsWith(bare + "/")
      );
    });
  }
}
