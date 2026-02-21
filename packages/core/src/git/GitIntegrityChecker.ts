/**
 * @devs/core — GitIntegrityChecker
 *
 * Provides pre-snapshot and post-snapshot integrity checks for the devs
 * git trail. Two layers of verification are performed:
 *
 *  1. **Workspace verification** (`verifyWorkspace`):
 *     - Dirty detection: uncommitted staged/unstaged/untracked changes that
 *       would pollute the next snapshot. Does NOT trigger on gitignored files.
 *     - HEAD reachability: detects detached HEAD state or a missing HEAD commit
 *       (e.g., a freshly initialised repo with no commits yet).
 *
 *  2. **Object-store integrity** (`checkObjectStoreIntegrity`):
 *     - Lightweight `git fsck --connectivity-only --no-dangling` check that
 *       confirms git objects are reachable without performing a full bit-level
 *       scan. Run before every snapshot to catch corruption early.
 *
 * Both methods return structured result objects — they do NOT throw on
 * violations. The `GitIntegrityViolationError` error class is available for
 * callers that want to convert a failed result into an exception.
 *
 * **Retry utility** (`withRetry`):
 *   A static helper that retries a git operation when transient lock-file
 *   errors occur (`.git/index.lock`, `.git/COMMIT_EDITMSG.lock`, etc.).
 *   Non-transient errors are re-thrown immediately without retrying.
 *
 * Requirement: 8_RISKS-REQ-127
 */

import { simpleGit, type SimpleGit } from "simple-git";
import { resolve } from "node:path";
import upath from "upath";

// ---------------------------------------------------------------------------
// Violation kinds
// ---------------------------------------------------------------------------

/**
 * Classification for an integrity violation.
 *
 * - `"dirty_workspace"` — unstaged/staged/untracked changes that would
 *   pollute the next snapshot commit.
 * - `"detached_head"` — the repository is in a detached HEAD state, which
 *   prevents normal branch-based snapshot commits.
 * - `"missing_head"` — HEAD cannot be resolved (typically a new repo with
 *   no commits; snapshot impossible).
 * - `"object_store_corruption"` — git fsck detected missing or broken objects
 *   in the git object store.
 */
export type ViolationKind =
  | "dirty_workspace"
  | "detached_head"
  | "missing_head"
  | "object_store_corruption";

/**
 * A single integrity violation found during a workspace or object-store check.
 */
export interface IntegrityViolation {
  /** Classification of the violation. */
  kind: ViolationKind;
  /** Human-readable description of the violation. */
  message: string;
  /** Raw output from the git command that surfaced this violation (optional). */
  details?: string;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/**
 * Structured result of `GitIntegrityChecker.verifyWorkspace()`.
 *
 * `passed` is `true` only when ALL of the following hold:
 *  - `isDirty` is `false`
 *  - `isDetachedHead` is `false`
 *  - `headReachable` is `true`
 *  - `violations` is empty
 */
export interface IntegrityCheckResult {
  /** `true` when no violations were found. */
  passed: boolean;
  /** `true` when the workspace contains uncommitted changes. */
  isDirty: boolean;
  /** `true` when HEAD is detached (not pointing to a branch ref). */
  isDetachedHead: boolean;
  /** `true` when `git rev-parse --verify HEAD` resolves successfully. */
  headReachable: boolean;
  /** All violations found. Empty when `passed === true`. */
  violations: IntegrityViolation[];
}

/**
 * Structured result of `GitIntegrityChecker.checkObjectStoreIntegrity()`.
 */
export interface ObjectStoreCheckResult {
  /** `true` when the git object store is healthy. */
  passed: boolean;
  /** Any corruption violations found. Empty when `passed === true`. */
  violations: IntegrityViolation[];
}

// ---------------------------------------------------------------------------
// GitIntegrityViolationError
// ---------------------------------------------------------------------------

/**
 * Error thrown when integrity violations are converted to exceptions.
 *
 * The `violations` array carries all violation records for programmatic
 * inspection by the caller.
 *
 * Usage:
 * ```ts
 * const result = await checker.verifyWorkspace(path);
 * if (!result.passed) {
 *   throw new GitIntegrityViolationError(result.violations);
 * }
 * ```
 */
export class GitIntegrityViolationError extends Error {
  /** All violations that caused this error. */
  readonly violations: IntegrityViolation[];

  constructor(violations: IntegrityViolation[]) {
    const summary = violations.map((v) => v.message).join("; ");
    super(
      violations.length === 0
        ? "Git integrity check failed (no violations recorded)"
        : `Git integrity violations detected: ${summary}`
    );
    this.name = "GitIntegrityViolationError";
    this.violations = violations;
  }
}

// ---------------------------------------------------------------------------
// Transient error detection
// ---------------------------------------------------------------------------

/** Patterns that indicate a transient git lock-file error worth retrying. */
const TRANSIENT_LOCK_PATTERNS = [
  /Unable to create .+\.lock/i,
  /\.lock'?\s*:\s*File exists/i,
  /could not lock config file/i,
];

/**
 * Returns `true` when the given error message looks like a transient git
 * lock-file conflict that will resolve if the operation is retried.
 */
function isTransientLockError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return TRANSIENT_LOCK_PATTERNS.some((pattern) => pattern.test(msg));
}

// ---------------------------------------------------------------------------
// GitIntegrityChecker
// ---------------------------------------------------------------------------

/**
 * Git workspace and object-store integrity checker.
 *
 * Instantiate once and reuse across multiple checks — the class is stateless
 * between calls.
 *
 * Requirement: 8_RISKS-REQ-127
 */
export class GitIntegrityChecker {
  // ── verifyWorkspace ───────────────────────────────────────────────────────

  /**
   * Runs a two-part workspace verification:
   *  1. Dirty detection via `git status` (ignores gitignored files).
   *  2. HEAD reachability via `git rev-parse --verify HEAD`.
   *  3. Branch check via `git symbolic-ref --quiet HEAD`.
   *
   * All three checks are performed regardless of individual failures — the
   * result captures all violations found in a single pass.
   *
   * @param path - Absolute path to the git working directory.
   * @returns Structured integrity check result. Never throws.
   */
  async verifyWorkspace(path: string): Promise<IntegrityCheckResult> {
    const normalized = upath.normalize(resolve(path));
    const git = simpleGit({ baseDir: normalized });

    const violations: IntegrityViolation[] = [];
    let isDirty = false;
    let isDetachedHead = false;
    let headReachable = true;

    // ── 1. Dirty workspace check ─────────────────────────────────────────
    // git.status() uses `git status` internally and does NOT include ignored
    // files unless explicitly requested with --ignored. This matches the
    // `git status --porcelain` semantics described in the requirement.
    try {
      const statusResult = await git.status();
      if (!statusResult.isClean()) {
        isDirty = true;
        const dirtyFiles = [
          ...statusResult.staged,
          ...statusResult.modified.filter(
            (f) => !statusResult.staged.includes(f)
          ),
          ...statusResult.not_added,
        ];
        violations.push({
          kind: "dirty_workspace",
          message: `Workspace has ${dirtyFiles.length} uncommitted change(s): ${dirtyFiles.slice(0, 5).join(", ")}${dirtyFiles.length > 5 ? " …" : ""}`,
          details: dirtyFiles.join("\n"),
        });
      }
    } catch (err) {
      // If status itself fails, treat as a dirty/unknown state to be safe
      isDirty = true;
      violations.push({
        kind: "dirty_workspace",
        message: `Failed to read workspace status: ${err instanceof Error ? err.message : String(err)}`,
      });
    }

    // ── 2. HEAD reachability check ────────────────────────────────────────
    try {
      await git.raw(["rev-parse", "--verify", "HEAD"]);
      headReachable = true;
    } catch (err) {
      headReachable = false;
      violations.push({
        kind: "missing_head",
        message: `HEAD is not reachable — the repository may have no commits yet or the HEAD pointer is corrupt.`,
        details: err instanceof Error ? err.message : String(err),
      });
    }

    // ── 3. Detached HEAD check ─────────────────────────────────────────────
    // `git symbolic-ref --quiet HEAD` exits non-zero on detached HEAD.
    // We only flag this as detached if HEAD is actually reachable (a missing
    // HEAD already reported as missing_head above).
    try {
      await git.raw(["symbolic-ref", "--quiet", "HEAD"]);
      isDetachedHead = false;
    } catch (err) {
      if (headReachable) {
        // HEAD resolves but is not a branch ref → detached HEAD
        isDetachedHead = true;
        violations.push({
          kind: "detached_head",
          message: `HEAD is in a detached state. Checkout a branch before taking a snapshot.`,
          details: err instanceof Error ? err.message : String(err),
        });
      }
      // If HEAD is not reachable, we skip adding detached_head (missing_head already covers it)
    }

    const passed = violations.length === 0;
    return { passed, isDirty, isDetachedHead, headReachable, violations };
  }

  // ── checkObjectStoreIntegrity ─────────────────────────────────────────────

  /**
   * Runs a lightweight connectivity-only git fsck on the object store.
   *
   * Uses `git fsck --connectivity-only --no-dangling` which only verifies
   * that all reachable objects exist and are linked correctly — it does NOT
   * perform a full bit-level integrity check. This keeps the check fast
   * enough to run before every snapshot.
   *
   * `--no-dangling` suppresses warnings about unreachable (dangling) objects
   * that are normal after `git rebase`, `git reset`, etc.
   *
   * @param path - Absolute path to the git working directory.
   * @returns Structured object-store check result. Never throws.
   */
  async checkObjectStoreIntegrity(
    path: string
  ): Promise<ObjectStoreCheckResult> {
    const normalized = upath.normalize(resolve(path));
    const git = simpleGit({ baseDir: normalized });

    const violations: IntegrityViolation[] = [];

    try {
      // Exit code 0 = no issues (stdout may contain informational messages).
      // Non-zero exit code → simple-git throws, indicating corruption.
      await git.raw([
        "fsck",
        "--connectivity-only",
        "--no-dangling",
        "--quiet",
      ]);
    } catch (err) {
      violations.push({
        kind: "object_store_corruption",
        message: `Git object store integrity check failed. Snapshot aborted to prevent history corruption.`,
        details: err instanceof Error ? err.message : String(err),
      });
    }

    return { passed: violations.length === 0, violations };
  }

  // ── withRetry (static) ────────────────────────────────────────────────────

  /**
   * Wraps a git operation with automatic retry for transient lock-file errors.
   *
   * Git lock-file conflicts (`.git/index.lock`, `.git/COMMIT_EDITMSG.lock`)
   * are a common source of transient failures when multiple processes interact
   * with the same repository. This helper retries the operation up to
   * `maxAttempts` times with an exponential backoff.
   *
   * Non-transient errors (permission denied, repository not found, etc.) are
   * re-thrown immediately without retrying.
   *
   * @param operation    - Async git operation to retry.
   * @param options.maxAttempts - Maximum number of attempts (default: 3).
   * @param options.backoffMs   - Base delay between retries in milliseconds
   *                             (default: 100; each retry doubles this).
   * @returns The result of the operation on success.
   * @throws The last error if all attempts fail.
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: { maxAttempts?: number; backoffMs?: number } = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;
    const backoffMs = options.backoffMs ?? 100;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (err) {
        if (!isTransientLockError(err)) {
          // Non-transient: re-throw immediately
          throw err;
        }

        lastError = err;

        if (attempt < maxAttempts) {
          // Exponential backoff: 100ms, 200ms, 400ms, ...
          const delay = backoffMs * Math.pow(2, attempt - 1);
          if (delay > 0) {
            await new Promise<void>((resolve) => setTimeout(resolve, delay));
          }
        }
      }
    }

    throw lastError;
  }
}
