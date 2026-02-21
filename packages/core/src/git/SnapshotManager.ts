/**
 * @devs/core — SnapshotManager
 *
 * Manages the "Project Evolution" git trail for generated projects.
 *
 * The SnapshotManager wraps `GitClient` and enforces the devs git exclusion
 * policy (UNKNOWN-601):
 *  - `.devs/` (Flight Recorder runtime state) is NEVER included in any
 *    project snapshot commit. This is achieved by ensuring the exclusion is
 *    written to `.gitignore` via `GitIgnoreManager.ensureStandardIgnores()`
 *    before the first `git add .` is performed.
 *  - `.agent/` (AOD documentation) IS tracked — it must appear in the
 *    project's git history for the AOD density requirement.
 *
 * State-file git strategy (UNKNOWN-601):
 *  `.devs/state.sqlite` is excluded from the standard project git repository.
 *  The Flight Recorder does NOT need a "Shadow Git" at this stage — exclusion
 *  via `.gitignore` is sufficient. Future phases may introduce versioned
 *  snapshots of the state database if replay / rollback semantics are needed.
 *
 * Requirement: UNKNOWN-601, UNKNOWN-602
 */

import { GitClient, type WorkspaceStatus } from "./GitClient.js";
import { GitIgnoreManager } from "./GitIgnoreManager.js";

// ---------------------------------------------------------------------------
// SnapshotOptions
// ---------------------------------------------------------------------------

export interface SnapshotOptions {
  /** Absolute path to the generated project root. */
  projectPath: string;
}

// ---------------------------------------------------------------------------
// SnapshotManager
// ---------------------------------------------------------------------------

export class SnapshotManager {
  private readonly git: GitClient;
  private readonly projectPath: string;

  constructor(options: SnapshotOptions) {
    this.projectPath = options.projectPath;
    this.git = new GitClient(options.projectPath);
  }

  /**
   * Initializes the project's git repository and ensures that the standard
   * devs exclusions (`.devs/`, `.env`, etc.) are present in `.gitignore`
   * before any staging operation is performed. Idempotent.
   *
   * Must be called once before `takeSnapshot()`.
   *
   * @throws {GitError} If the repository cannot be initialized.
   * @throws {GitIgnoreManagerError} If `.gitignore` cannot be written.
   */
  async initialize(): Promise<void> {
    await this.git.initRepository(this.projectPath);
    GitIgnoreManager.ensureStandardIgnores(this.projectPath);
  }

  /**
   * Stages all eligible project files (respecting `.gitignore`, which
   * excludes `.devs/`) and creates a snapshot commit.
   *
   * The `.devs/` directory is guaranteed to be absent from every snapshot
   * commit because `initialize()` writes its exclusion into `.gitignore`
   * before any `git add .` is called.
   *
   * @param message - Descriptive commit message for the snapshot.
   * @returns The SHA-1 hash of the created commit.
   * @throws {GitError} If staging or committing fails.
   */
  async takeSnapshot(message: string): Promise<string> {
    await this.git.add(".");
    return this.git.commit(message);
  }

  /**
   * Returns the current workspace status.
   *
   * @throws {GitError} If the status command fails.
   */
  async getStatus(): Promise<WorkspaceStatus> {
    return this.git.status();
  }
}
