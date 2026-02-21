/**
 * @devs/core — CommitMessageGenerator unit tests
 *
 * Requirements: 8_RISKS-REQ-085
 *
 * Verifies that generated commit messages conform to the devs conventional
 * commit format with state snapshot footers.
 */

import { describe, it, expect } from "vitest";
import {
  CommitMessageGenerator,
  type StateSnapshotData,
} from "./CommitMessageGenerator.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the first line (subject) of a commit message. */
function subject(msg: string): string {
  return msg.split("\n")[0];
}

/** Returns all lines after the first blank line separator (the footer block). */
function footer(msg: string): string {
  const idx = msg.indexOf("\n\n");
  return idx === -1 ? "" : msg.slice(idx + 2);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CommitMessageGenerator", () => {
  // ── generate — title (subject line) ───────────────────────────────────────

  describe("generate — title", () => {
    it("includes the taskId in the subject line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(subject(msg)).toContain("task-001");
    });

    it("generates the conventional commit title 'task: complete {taskId}'", () => {
      const msg = CommitMessageGenerator.generate("task-007", {});
      expect(subject(msg)).toBe("task: complete task-007");
    });

    it("uses 'task' as the conventional commit type", () => {
      const msg = CommitMessageGenerator.generate("abc-123", {});
      expect(subject(msg)).toMatch(/^task:/);
    });

    it("subject line does not contain a newline", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(subject(msg)).not.toContain("\n");
    });

    it("handles taskIds with special characters (hyphens, underscores, dots)", () => {
      const msg = CommitMessageGenerator.generate("phase_1.task-042", {});
      expect(subject(msg)).toBe("task: complete phase_1.task-042");
    });
  });

  // ── generate — footer ──────────────────────────────────────────────────────

  describe("generate — footer", () => {
    it("footer contains 'TASK-ID: {taskId}' line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(footer(msg)).toContain("TASK-ID: task-001");
    });

    it("footer contains 'devs-state-snapshot:' line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(footer(msg)).toContain("devs-state-snapshot:");
    });

    it("footer TASK-ID matches the provided taskId exactly", () => {
      const taskId = "phase-2-task-099";
      const msg = CommitMessageGenerator.generate(taskId, {});
      expect(footer(msg)).toContain(`TASK-ID: ${taskId}`);
    });

    it("footer TASK-ID is on its own line (grep-able)", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      const lines = footer(msg).split("\n");
      const taskIdLine = lines.find((l) => l.startsWith("TASK-ID:"));
      expect(taskIdLine).toBeDefined();
      expect(taskIdLine).toBe("TASK-ID: task-001");
    });

    it("footer devs-state-snapshot is on its own line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      expect(snapshotLine).toBeDefined();
    });

    it("subject and footer are separated by a blank line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(msg).toContain("\n\n");
    });
  });

  // ── generate — snapshot value (hash) ──────────────────────────────────────

  describe("generate — snapshot value with hash", () => {
    it("uses the hash value directly when metadata.hash is provided", () => {
      const hash = "sha256:abc123def456";
      const msg = CommitMessageGenerator.generate("task-001", { hash });
      expect(footer(msg)).toContain(`devs-state-snapshot: ${hash}`);
    });

    it("uses a SHA-1 commit hash as the snapshot value", () => {
      const sha1 = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
      const msg = CommitMessageGenerator.generate("task-001", { hash: sha1 });
      expect(footer(msg)).toContain(`devs-state-snapshot: ${sha1}`);
    });

    it("does not include the hash key in the JSON when hash is the only field", () => {
      const msg = CommitMessageGenerator.generate("task-001", {
        hash: "abc123",
      });
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      // Should be the raw hash value, not JSON containing it
      expect(snapshotLine).toBe("devs-state-snapshot: abc123");
    });
  });

  // ── generate — snapshot value (compact JSON) ───────────────────────────────

  describe("generate — snapshot value as compact JSON", () => {
    it("serializes compact state fields as JSON when no hash is provided", () => {
      const metadata: StateSnapshotData = { projects: 3, requirements: 42 };
      const msg = CommitMessageGenerator.generate("task-001", metadata);
      expect(footer(msg)).toContain(
        `devs-state-snapshot: ${JSON.stringify({ projects: 3, requirements: 42 })}`
      );
    });

    it("produces '{}' for an empty metadata object", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      expect(snapshotLine).toBe("devs-state-snapshot: {}");
    });

    it("excludes the 'hash' key from JSON when other fields are also present", () => {
      const msg = CommitMessageGenerator.generate("task-001", {
        hash: "abc123",
        projects: 5,
      });
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      // hash field should not leak into JSON — only non-hash fields included
      expect(snapshotLine).not.toContain("hash");
    });

    it("includes all non-hash fields in the compact JSON", () => {
      const metadata: StateSnapshotData = { projects: 2, requirements: 15 };
      const msg = CommitMessageGenerator.generate("task-001", metadata);
      expect(footer(msg)).toContain('"projects":2');
      expect(footer(msg)).toContain('"requirements":15');
    });
  });

  // ── generate — size constraints ────────────────────────────────────────────

  describe("generate — size constraints", () => {
    it("total message fits within 1KB (1024 bytes) for typical state snapshots", () => {
      const metadata: StateSnapshotData = {
        projects: 5,
        requirements: 200,
      };
      const msg = CommitMessageGenerator.generate("task-001", metadata);
      expect(Buffer.byteLength(msg, "utf8")).toBeLessThan(1024);
    });

    it("truncates an oversized snapshot value to stay within 1KB", () => {
      const longHash = "x".repeat(2000);
      const msg = CommitMessageGenerator.generate("task-001", {
        hash: longHash,
      });
      expect(Buffer.byteLength(msg, "utf8")).toBeLessThan(1024);
    });

    it("appends '...' suffix when the snapshot value is truncated", () => {
      const longHash = "x".repeat(2000);
      const msg = CommitMessageGenerator.generate("task-001", {
        hash: longHash,
      });
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      expect(snapshotLine).toMatch(/\.\.\.$/);
    });

    it("does not truncate a snapshot that is within the size limit", () => {
      const shortHash = "sha256:abc123";
      const msg = CommitMessageGenerator.generate("task-001", {
        hash: shortHash,
      });
      const lines = footer(msg).split("\n");
      const snapshotLine = lines.find((l) =>
        l.startsWith("devs-state-snapshot:")
      );
      expect(snapshotLine).toBe(`devs-state-snapshot: ${shortHash}`);
      expect(snapshotLine).not.toMatch(/\.\.\.$/);
    });
  });

  // ── generate — conventional commit format ─────────────────────────────────

  describe("generate — conventional commit format", () => {
    it("follows the 'type: description' conventional commit format", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(subject(msg)).toMatch(/^\w+: .+/);
    });

    it("uses 'task' as the commit type (not 'feat' or 'chore')", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(subject(msg)).toMatch(/^task:/);
    });

    it("has a non-empty subject line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(subject(msg).trim().length).toBeGreaterThan(0);
    });

    it("full message string starts with the subject line", () => {
      const msg = CommitMessageGenerator.generate("task-001", {});
      expect(msg).toMatch(/^task: complete task-001/);
    });
  });
});
