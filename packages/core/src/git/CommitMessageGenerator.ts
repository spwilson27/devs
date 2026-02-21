/**
 * @devs/core — CommitMessageGenerator
 *
 * Generates git commit messages in the devs conventional commit format.
 * Every task-completion commit includes a structured footer with:
 *  - `TASK-ID: {taskId}` — for easy machine-readable grep-ability.
 *  - `devs-state-snapshot: {hash_or_compact_json}` — a compact representation
 *    of the critical state fields at the time of the snapshot, satisfying the
 *    state-integrity audit trail requirement.
 *
 * Generated message format:
 * ```
 * task: complete {taskId}
 *
 * TASK-ID: {taskId}
 * devs-state-snapshot: {hash_or_compact_json}
 * ```
 *
 * The snapshot value is capped at MAX_SNAPSHOT_CHARS characters to ensure the
 * footer stays within git's recommended message size (< 1 KB total).
 *
 * Requirement: 8_RISKS-REQ-085
 */

// ---------------------------------------------------------------------------
// StateSnapshotData
// ---------------------------------------------------------------------------

/**
 * Compact state snapshot passed to the commit footer.
 *
 * If `hash` is present and non-empty it is used verbatim as the snapshot
 * value (e.g., a SHA-256 of the current SQLite WAL state).
 * Otherwise the remaining fields are serialized as compact JSON (e.g.,
 * `{"projects":3,"requirements":42}`).
 */
export interface StateSnapshotData {
  /** Pre-computed hash of the current SQLite state. Used directly if present. */
  hash?: string;
  /** Number of active projects (compact summary field). */
  projects?: number;
  /** Number of requirements in the state (compact summary field). */
  requirements?: number;
  /** Any additional compact state fields to include in the footer snapshot. */
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Maximum character length for the `devs-state-snapshot` footer value.
 * Chosen so the complete commit message stays comfortably under 1 KB.
 */
const MAX_SNAPSHOT_CHARS = 900;

// ---------------------------------------------------------------------------
// CommitMessageGenerator
// ---------------------------------------------------------------------------

/**
 * Generates conventional commit messages with state snapshot footers.
 *
 * This class is stateless — all methods are static and can be called
 * without instantiation.
 */
export class CommitMessageGenerator {
  /**
   * Generates a conventional commit message with a state snapshot footer.
   *
   * Message structure:
   * ```
   * task: complete {taskId}
   *
   * TASK-ID: {taskId}
   * devs-state-snapshot: {snapshotValue}
   * ```
   *
   * The `snapshotValue` is:
   *  - `metadata.hash` if present and non-empty (used verbatim).
   *  - A compact JSON string of the remaining `metadata` fields otherwise.
   *
   * Truncated to MAX_SNAPSHOT_CHARS with a `...` suffix if oversized.
   *
   * @param taskId   - The unique identifier of the completed task.
   * @param metadata - State snapshot data: either a `hash` for direct use or
   *                   compact fields serialized as JSON.
   * @returns A multi-line commit message string.
   *
   * Requirements: 8_RISKS-REQ-085
   */
  static generate(taskId: string, metadata: StateSnapshotData): string {
    const snapshotValue = CommitMessageGenerator._formatSnapshotValue(metadata);

    const title = `task: complete ${taskId}`;
    const footer = [`TASK-ID: ${taskId}`, `devs-state-snapshot: ${snapshotValue}`].join(
      "\n"
    );

    return `${title}\n\n${footer}`;
  }

  // ── private helpers ────────────────────────────────────────────────────────

  /**
   * Formats the snapshot value for the commit footer.
   *
   * Uses the `hash` field directly if it is a non-empty string.
   * Otherwise builds a compact JSON object from all non-`hash` fields.
   * Caps the result at MAX_SNAPSHOT_CHARS characters.
   */
  private static _formatSnapshotValue(metadata: StateSnapshotData): string {
    let value: string;

    if (typeof metadata.hash === "string" && metadata.hash.length > 0) {
      // Use the pre-computed hash verbatim.
      value = metadata.hash;
    } else {
      // Build a compact JSON object from all non-hash fields.
      const compact: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(metadata)) {
        if (k !== "hash") {
          compact[k] = v;
        }
      }
      value = JSON.stringify(compact);
    }

    if (value.length > MAX_SNAPSHOT_CHARS) {
      return value.substring(0, MAX_SNAPSHOT_CHARS) + "...";
    }

    return value;
  }
}
