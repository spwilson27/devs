/**
 * @devs/core — GitClient
 *
 * A thin, typed wrapper over `simple-git` that provides the git operations
 * required by the devs snapshot strategy. All paths are normalized via `upath`
 * before being handed to git to ensure cross-platform consistency.
 *
 * Requirement: TAS-012
 */

import { simpleGit, type SimpleGit } from "simple-git";
import upath from "upath";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// GitError
// ---------------------------------------------------------------------------

/**
 * Thrown by all GitClient methods when a git operation fails.
 * Wraps the underlying error as `cause` for full stack inspection.
 */
export class GitError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options as ErrorOptions);
    this.name = "GitError";
  }
}

// ---------------------------------------------------------------------------
// WorkspaceStatus
// ---------------------------------------------------------------------------

/**
 * Structured representation of the current workspace git state.
 *
 * - `isClean` — true when there are no staged, unstaged, or untracked changes.
 * - `staged` — files added to the index but not yet committed.
 * - `unstaged` — tracked files with modifications not yet staged.
 * - `untracked` — files unknown to git.
 */
export interface WorkspaceStatus {
  isClean: boolean;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

// ---------------------------------------------------------------------------
// GitClient
// ---------------------------------------------------------------------------

/**
 * Thin wrapper over `simple-git` scoped to a specific working directory.
 *
 * All public methods throw `GitError` on failure.
 */
export class GitClient {
  private readonly git: SimpleGit;
  /** Normalized absolute working directory passed to simple-git. */
  readonly workingDir: string;

  /**
   * @param workingDir - Absolute path to the git working directory.
   */
  constructor(workingDir: string) {
    const normalized = upath.normalize(resolve(workingDir));
    this.workingDir = normalized;
    this.git = simpleGit({ baseDir: normalized });
  }

  // ── initRepository ──────────────────────────────────────────────────────

  /**
   * Initializes a git repository at `path` if one does not already exist.
   * This method is idempotent — calling it on an existing repo is a no-op.
   *
   * @param path - Target directory path (absolute or relative to cwd).
   * @throws {GitError} If the init operation fails.
   */
  async initRepository(path: string): Promise<void> {
    const normalized = upath.normalize(resolve(path));
    const git = simpleGit({ baseDir: normalized });

    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        await git.init();
      }
    } catch (err) {
      throw new GitError(
        `Failed to initialize repository at '${normalized}'`,
        { cause: err as Error }
      );
    }
  }

  // ── status ──────────────────────────────────────────────────────────────

  /**
   * Returns a structured snapshot of the current workspace state.
   *
   * @throws {GitError} If the status command fails.
   */
  async status(): Promise<WorkspaceStatus> {
    try {
      const result = await this.git.status();
      const staged = [...result.staged];
      const stagedSet = new Set(staged);

      return {
        isClean: result.isClean(),
        staged,
        // Files modified but NOT yet staged (exclude those already in staged)
        unstaged: result.modified.filter((f) => !stagedSet.has(f)),
        untracked: [...result.not_added],
      };
    } catch (err) {
      throw new GitError("Failed to get git status", { cause: err as Error });
    }
  }

  // ── add ──────────────────────────────────────────────────────────────────

  /**
   * Stages one or more files (or glob patterns) for the next commit.
   * All paths are normalized via `upath` before being passed to git.
   *
   * @param files - A single path/glob, or an array of paths/globs.
   * @throws {GitError} If the add operation fails.
   */
  async add(files: string | string[]): Promise<void> {
    const fileList = Array.isArray(files) ? files : [files];
    const normalized = fileList.map((f) => upath.normalize(f));

    try {
      await this.git.add(normalized);
    } catch (err) {
      throw new GitError(
        `Failed to stage files: ${normalized.join(", ")}`,
        { cause: err as Error }
      );
    }
  }

  // ── commit ───────────────────────────────────────────────────────────────

  /**
   * Creates a commit with the given message and returns the resulting SHA hash.
   *
   * Before committing, `user.name` and `user.email` are set to local defaults
   * (`devs-agent` / `devs@local`) if they are not already configured in the
   * repository. This prevents commit failures in environments where no global
   * git identity has been set.
   *
   * @param message - Descriptive commit message.
   * @returns The full SHA-1 commit hash.
   * @throws {GitError} If the commit fails.
   */
  async commit(message: string): Promise<string> {
    try {
      await this.ensureUserIdentity();
      const result = await this.git.commit(message);
      return result.commit;
    } catch (err) {
      if (err instanceof GitError) throw err;
      throw new GitError(
        `Failed to commit with message: "${message}"`,
        { cause: err as Error }
      );
    }
  }

  // ── private helpers ──────────────────────────────────────────────────────

  /**
   * Sets local `user.name` / `user.email` git config defaults if they are
   * not already present. This avoids relying on host-level git configuration.
   */
  private async ensureUserIdentity(): Promise<void> {
    const nameResult = await this.git.getConfig("user.name");
    if (!nameResult.value) {
      await this.git.addConfig("user.name", "devs-agent", false, "local");
    }

    const emailResult = await this.git.getConfig("user.email");
    if (!emailResult.value) {
      await this.git.addConfig("user.email", "devs@local", false, "local");
    }
  }
}
