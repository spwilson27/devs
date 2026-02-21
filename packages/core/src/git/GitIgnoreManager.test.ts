/**
 * @devs/core — GitIgnoreManager unit tests
 *
 * Requirements: UNKNOWN-601, UNKNOWN-602
 *
 * Uses real filesystem operations in isolated temp directories.
 * No git process or simple-git mock required.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  GitIgnoreManager,
  GitIgnoreManagerError,
  STANDARD_IGNORES,
  TRACKED_DEVS_ARTIFACTS,
} from "./GitIgnoreManager.js";

describe("GitIgnoreManager", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-gitignore-test-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ── ensureStandardIgnores ────────────────────────────────────────────────

  describe("ensureStandardIgnores", () => {
    it("creates .gitignore when one does not exist", () => {
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      expect(fs.existsSync(path.join(tmpDir, ".gitignore"))).toBe(true);
    });

    it("writes all STANDARD_IGNORES entries to a new .gitignore", () => {
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      for (const entry of STANDARD_IGNORES) {
        expect(content).toContain(entry);
      }
    });

    it("includes .devs/ in a newly created .gitignore", () => {
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      expect(content).toContain(".devs/");
    });

    it("appends .devs/ to an existing .gitignore that lacks it", () => {
      const gitignorePath = path.join(tmpDir, ".gitignore");
      fs.writeFileSync(gitignorePath, "node_modules/\ndist/\n", "utf8");
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(gitignorePath, "utf8");
      expect(content).toContain(".devs/");
    });

    it("preserves existing entries in the .gitignore when appending", () => {
      const gitignorePath = path.join(tmpDir, ".gitignore");
      fs.writeFileSync(
        gitignorePath,
        "# My project\n*.log\n.DS_Store\n",
        "utf8"
      );
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(gitignorePath, "utf8");
      expect(content).toContain("*.log");
      expect(content).toContain(".DS_Store");
    });

    it("does not add duplicate entries when .devs/ is already present", () => {
      const gitignorePath = path.join(tmpDir, ".gitignore");
      fs.writeFileSync(gitignorePath, ".devs/\nnode_modules/\n", "utf8");
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(gitignorePath, "utf8");
      const devsLines = content
        .split("\n")
        .filter((l) => l.trim() === ".devs/");
      expect(devsLines.length).toBe(1);
    });

    it("is idempotent — calling twice produces identical .gitignore content", () => {
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const afterFirst = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const afterSecond = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      expect(afterFirst).toBe(afterSecond);
    });

    it("does NOT add .agent/ to .gitignore (it is a tracked devs artifact)", () => {
      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const content = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      expect(content).not.toContain(".agent/");
    });

    it("handles a .gitignore that already has all entries (no file modification)", () => {
      const gitignorePath = path.join(tmpDir, ".gitignore");
      const allEntries = [...STANDARD_IGNORES].join("\n") + "\n";
      fs.writeFileSync(gitignorePath, allEntries, "utf8");
      const mtimeBefore = fs.statSync(gitignorePath).mtimeMs;

      // Allow time for mtime to change if file were written
      const start = Date.now();
      while (Date.now() - start < 10) { /* busy wait 10ms */ }

      GitIgnoreManager.ensureStandardIgnores(tmpDir);
      const mtimeAfter = fs.statSync(gitignorePath).mtimeMs;
      // File should not have been rewritten (no changes needed)
      expect(mtimeAfter).toBe(mtimeBefore);
    });

    it("throws GitIgnoreManagerError when the project directory does not exist", () => {
      expect(() =>
        GitIgnoreManager.ensureStandardIgnores("/nonexistent/path/xyz_devs")
      ).toThrow(GitIgnoreManagerError);
    });
  });

  // ── isDevsIgnored ────────────────────────────────────────────────────────

  describe("isDevsIgnored", () => {
    it("returns true for '.devs/'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".devs/")).toBe(true);
    });

    it("returns true for '.devs' (without trailing slash)", () => {
      expect(GitIgnoreManager.isDevsIgnored(".devs")).toBe(true);
    });

    it("returns true for '.devs/state.sqlite'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".devs/state.sqlite")).toBe(true);
    });

    it("returns true for '.devs/flight_recorder/events.db'", () => {
      expect(
        GitIgnoreManager.isDevsIgnored(".devs/flight_recorder/events.db")
      ).toBe(true);
    });

    it("returns true for '.env'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".env")).toBe(true);
    });

    it("returns false for '.env.example'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".env.example")).toBe(false);
    });

    it("returns false for '.agent/'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".agent/")).toBe(false);
    });

    it("returns false for '.agent/memory.md'", () => {
      expect(GitIgnoreManager.isDevsIgnored(".agent/memory.md")).toBe(false);
    });

    it("returns false for 'README.md'", () => {
      expect(GitIgnoreManager.isDevsIgnored("README.md")).toBe(false);
    });

    it("returns false for 'src/index.ts'", () => {
      expect(GitIgnoreManager.isDevsIgnored("src/index.ts")).toBe(false);
    });
  });

  // ── isTrackedDevsArtifact ────────────────────────────────────────────────

  describe("isTrackedDevsArtifact", () => {
    it("returns true for '.agent/'", () => {
      expect(GitIgnoreManager.isTrackedDevsArtifact(".agent/")).toBe(true);
    });

    it("returns true for '.agent' (without trailing slash)", () => {
      expect(GitIgnoreManager.isTrackedDevsArtifact(".agent")).toBe(true);
    });

    it("returns true for '.agent/memory.md'", () => {
      expect(
        GitIgnoreManager.isTrackedDevsArtifact(".agent/memory.md")
      ).toBe(true);
    });

    it("returns true for '.agent/packages/core/git/GitClient.agent.md'", () => {
      expect(
        GitIgnoreManager.isTrackedDevsArtifact(
          ".agent/packages/core/git/GitClient.agent.md"
        )
      ).toBe(true);
    });

    it("returns false for '.devs/'", () => {
      expect(GitIgnoreManager.isTrackedDevsArtifact(".devs/")).toBe(false);
    });

    it("returns false for '.devs/state.sqlite'", () => {
      expect(
        GitIgnoreManager.isTrackedDevsArtifact(".devs/state.sqlite")
      ).toBe(false);
    });

    it("returns false for 'README.md'", () => {
      expect(GitIgnoreManager.isTrackedDevsArtifact("README.md")).toBe(false);
    });
  });

  // ── STANDARD_IGNORES constant ────────────────────────────────────────────

  describe("STANDARD_IGNORES", () => {
    it("contains '.devs/'", () => {
      expect(STANDARD_IGNORES).toContain(".devs/");
    });

    it("does not contain '.agent/'", () => {
      expect(STANDARD_IGNORES).not.toContain(".agent/");
    });

    it("contains '.env'", () => {
      expect(STANDARD_IGNORES).toContain(".env");
    });
  });

  // ── TRACKED_DEVS_ARTIFACTS constant ─────────────────────────────────────

  describe("TRACKED_DEVS_ARTIFACTS", () => {
    it("contains '.agent/'", () => {
      expect(TRACKED_DEVS_ARTIFACTS).toContain(".agent/");
    });

    it("does not contain '.devs/'", () => {
      expect(TRACKED_DEVS_ARTIFACTS).not.toContain(".devs/");
    });
  });
});
