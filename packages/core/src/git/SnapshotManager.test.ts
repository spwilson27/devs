/**
 * @devs/core — SnapshotManager unit tests
 *
 * Requirements: UNKNOWN-601, UNKNOWN-602
 *
 * `simple-git` is mocked so no real git process is spawned.
 * `GitClient` is used directly (not mocked) so the full call-chain through
 * SnapshotManager → GitClient → simple-git is exercised.
 *
 * Integration tests (real git) live in packages/core/test/git/exclusion_integration.test.ts.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { SnapshotManager } from "./SnapshotManager.js";

vi.mock("simple-git");

// ---------------------------------------------------------------------------
// Mock helpers (mirrors GitClient.test.ts pattern)
// ---------------------------------------------------------------------------

type MockGitInstance = {
  init: Mock;
  checkIsRepo: Mock;
  status: Mock;
  add: Mock;
  commit: Mock;
  getConfig: Mock;
  addConfig: Mock;
};

function makeCleanStatusResult() {
  return {
    isClean: () => true,
    staged: [] as string[],
    modified: [] as string[],
    not_added: [] as string[],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SnapshotManager", () => {
  let tmpDir: string;
  let mockGit: MockGitInstance;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-snapshot-test-"));
    vi.clearAllMocks();

    mockGit = {
      init: vi.fn().mockResolvedValue({}),
      checkIsRepo: vi.fn().mockResolvedValue(false),
      status: vi.fn().mockResolvedValue(makeCleanStatusResult()),
      add: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue({ commit: "abc1234" }),
      getConfig: vi.fn().mockResolvedValue({ value: "existing-value" }),
      addConfig: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(simpleGit).mockReturnValue(
      mockGit as unknown as ReturnType<typeof simpleGit>
    );
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ── initialize ─────────────────────────────────────────────────────────────

  describe("initialize", () => {
    it("calls git.checkIsRepo to determine if init is needed", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      expect(mockGit.checkIsRepo).toHaveBeenCalled();
    });

    it("calls git.init() when the directory is not a git repo", async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      expect(mockGit.init).toHaveBeenCalled();
    });

    it("does not call git.init() when the repo already exists", async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      expect(mockGit.init).not.toHaveBeenCalled();
    });

    it("creates .gitignore with .devs/ exclusion after initialization", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      const gitignorePath = path.join(tmpDir, ".gitignore");
      expect(fs.existsSync(gitignorePath)).toBe(true);
      const content = fs.readFileSync(gitignorePath, "utf8");
      expect(content).toContain(".devs/");
    });

    it("ensures .gitignore does not contain .agent/ (tracked artifact)", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      const content = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      expect(content).not.toContain(".agent/");
    });

    it("is idempotent — calling twice does not duplicate .gitignore entries", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      await sm.initialize();
      const content = fs.readFileSync(
        path.join(tmpDir, ".gitignore"),
        "utf8"
      );
      const devsLines = content
        .split("\n")
        .filter((l) => l.trim() === ".devs/");
      expect(devsLines.length).toBe(1);
    });

    it("preserves a pre-existing .gitignore while adding .devs/", async () => {
      const gitignorePath = path.join(tmpDir, ".gitignore");
      fs.writeFileSync(gitignorePath, "# project ignores\n*.log\n", "utf8");
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      const content = fs.readFileSync(gitignorePath, "utf8");
      expect(content).toContain("*.log");
      expect(content).toContain(".devs/");
    });
  });

  // ── takeSnapshot ────────────────────────────────────────────────────────────

  describe("takeSnapshot", () => {
    it("stages all files using git add '.'", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      await sm.takeSnapshot("chore: initial snapshot");
      expect(mockGit.add).toHaveBeenCalledWith(["."]);
    });

    it("creates a commit with the given message", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      await sm.takeSnapshot("chore: initial snapshot");
      expect(mockGit.commit).toHaveBeenCalledWith("chore: initial snapshot");
    });

    it("returns the commit SHA from the underlying git operation", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      const sha = await sm.takeSnapshot("chore: initial snapshot");
      expect(sha).toBe("abc1234");
    });

    it("calls add before commit", async () => {
      const callOrder: string[] = [];
      mockGit.add.mockImplementation(async () => {
        callOrder.push("add");
      });
      mockGit.commit.mockImplementation(async () => {
        callOrder.push("commit");
        return { commit: "sha123" };
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.initialize();
      await sm.takeSnapshot("test order");
      expect(callOrder).toEqual(["add", "commit"]);
    });
  });

  // ── createTaskSnapshot ───────────────────────────────────────────────────────

  describe("createTaskSnapshot", () => {
    it("calls add('.') when the workspace has changes", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-001", {});
      expect(mockGit.add).toHaveBeenCalledWith(["."]);
    });

    it("calls commit when the workspace has changes", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-001", {});
      expect(mockGit.commit).toHaveBeenCalled();
    });

    it("generates commit message containing the taskId", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-abc-123", {});
      expect(mockGit.commit).toHaveBeenCalledWith(
        expect.stringContaining("task-abc-123")
      );
    });

    it("generates the standard commit message: 'task: complete task {taskId}'", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-007", {});
      expect(mockGit.commit).toHaveBeenCalledWith(
        "task: complete task task-007"
      );
    });

    it("returns the commit hash from the underlying git operation", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });
      mockGit.commit.mockResolvedValue({ commit: "deadbeef1234" });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      const hash = await sm.createTaskSnapshot("task-001", {});
      expect(hash).toBe("deadbeef1234");
    });

    it("returns null when workspace is clean (no changes detected)", async () => {
      // Default mockGit.status returns a clean workspace
      const sm = new SnapshotManager({ projectPath: tmpDir });
      const result = await sm.createTaskSnapshot("task-001", {});
      expect(result).toBeNull();
    });

    it("does not call add or commit when workspace is clean", async () => {
      // Default mockGit.status returns a clean workspace
      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-001", {});
      expect(mockGit.add).not.toHaveBeenCalled();
      expect(mockGit.commit).not.toHaveBeenCalled();
    });

    it("propagates GitError when git operations fail (invalid state)", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });
      mockGit.add.mockRejectedValue(new Error("not a git repository"));

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await expect(sm.createTaskSnapshot("task-001", {})).rejects.toThrow();
    });

    it("calls add before commit (ordering guarantee)", async () => {
      const callOrder: string[] = [];
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });
      mockGit.add.mockImplementation(async () => {
        callOrder.push("add");
      });
      mockGit.commit.mockImplementation(async () => {
        callOrder.push("commit");
        return { commit: "sha123" };
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      await sm.createTaskSnapshot("task-001", {});
      expect(callOrder).toEqual(["add", "commit"]);
    });

    it("accepts optional context with taskName (does not affect commit message)", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["src/index.ts"],
        not_added: [],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      const hash = await sm.createTaskSnapshot("task-001", {
        taskName: "Setup Project",
      });
      // The commit message is still the standard format
      expect(mockGit.commit).toHaveBeenCalledWith(
        "task: complete task task-001"
      );
      expect(hash).toBe("abc1234");
    });
  });

  // ── getStatus ────────────────────────────────────────────────────────────────

  describe("getStatus", () => {
    it("returns workspace status reflecting staged files", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: ["src/index.ts"],
        modified: [],
        not_added: ["README.md"],
      });

      const sm = new SnapshotManager({ projectPath: tmpDir });
      const status = await sm.getStatus();
      expect(status.isClean).toBe(false);
      expect(status.staged).toContain("src/index.ts");
      expect(status.untracked).toContain("README.md");
    });

    it("returns a clean status when there are no changes", async () => {
      const sm = new SnapshotManager({ projectPath: tmpDir });
      const status = await sm.getStatus();
      expect(status.isClean).toBe(true);
      expect(status.staged).toHaveLength(0);
    });
  });
});
