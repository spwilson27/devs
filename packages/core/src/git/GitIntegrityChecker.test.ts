/**
 * @devs/core — GitIntegrityChecker unit tests
 *
 * Requirement: 8_RISKS-REQ-127
 *
 * `simple-git` is mocked so no real git process is spawned.
 * Tests cover: dirty workspace detection, HEAD reachability, object store
 * integrity checks, and transient-failure retry logic.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { simpleGit } from "simple-git";
import {
  GitIntegrityChecker,
  GitIntegrityViolationError,
  type IntegrityCheckResult,
} from "./GitIntegrityChecker.js";

vi.mock("simple-git");

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

type MockGitInstance = {
  status: Mock;
  raw: Mock;
};

function makeCleanStatusResult() {
  return {
    isClean: () => true,
    staged: [] as string[],
    modified: [] as string[],
    not_added: [] as string[],
  };
}

function makeDirtyStatusResult(modified = ["src/app.ts"]) {
  return {
    isClean: () => false,
    staged: [] as string[],
    modified,
    not_added: [] as string[],
  };
}

function makeUntrackedStatusResult(untracked = ["new-file.ts"]) {
  return {
    isClean: () => false,
    staged: [] as string[],
    modified: [] as string[],
    not_added: untracked,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("GitIntegrityChecker", () => {
  const projectPath = "/test/project";
  let mockGit: MockGitInstance;
  let checker: GitIntegrityChecker;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGit = {
      status: vi.fn().mockResolvedValue(makeCleanStatusResult()),
      // raw() returns stdout for known commands; throws on git error
      raw: vi.fn().mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse") return Promise.resolve("abc1234\n");
        if (args[0] === "symbolic-ref") return Promise.resolve("refs/heads/main\n");
        if (args[0] === "fsck") return Promise.resolve(""); // empty = no issues
        return Promise.resolve("");
      }),
    };

    vi.mocked(simpleGit).mockReturnValue(
      mockGit as unknown as ReturnType<typeof simpleGit>
    );

    checker = new GitIntegrityChecker();
  });

  // ── verifyWorkspace — clean state ─────────────────────────────────────────

  describe("verifyWorkspace — clean workspace", () => {
    it("returns passed: true when workspace is clean and HEAD is on a branch", async () => {
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(true);
    });

    it("returns an empty violations array when all checks pass", async () => {
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.violations).toHaveLength(0);
    });

    it("returns isDirty: false when status is clean", async () => {
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDirty).toBe(false);
    });

    it("returns isDetachedHead: false when HEAD is on a branch", async () => {
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDetachedHead).toBe(false);
    });

    it("returns headReachable: true when rev-parse resolves", async () => {
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.headReachable).toBe(true);
    });

    it("calls git.status() to check for uncommitted changes", async () => {
      await checker.verifyWorkspace(projectPath);
      expect(mockGit.status).toHaveBeenCalled();
    });

    it("calls git.raw(['rev-parse', '--verify', 'HEAD']) to check HEAD reachability", async () => {
      await checker.verifyWorkspace(projectPath);
      expect(mockGit.raw).toHaveBeenCalledWith(
        expect.arrayContaining(["rev-parse", "--verify", "HEAD"])
      );
    });

    it("calls git.raw(['symbolic-ref', '--quiet', 'HEAD']) to check for detached HEAD", async () => {
      await checker.verifyWorkspace(projectPath);
      expect(mockGit.raw).toHaveBeenCalledWith(
        expect.arrayContaining(["symbolic-ref", "--quiet", "HEAD"])
      );
    });
  });

  // ── verifyWorkspace — dirty state ─────────────────────────────────────────

  describe("verifyWorkspace — dirty workspace", () => {
    it("returns passed: false when workspace has modified files", async () => {
      mockGit.status.mockResolvedValue(makeDirtyStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(false);
    });

    it("returns isDirty: true when workspace has unstaged changes", async () => {
      mockGit.status.mockResolvedValue(makeDirtyStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDirty).toBe(true);
    });

    it("returns a dirty_workspace violation when modified files exist", async () => {
      mockGit.status.mockResolvedValue(makeDirtyStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.violations.some((v) => v.kind === "dirty_workspace")).toBe(
        true
      );
    });

    it("returns passed: false when workspace has untracked files", async () => {
      mockGit.status.mockResolvedValue(makeUntrackedStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(false);
    });

    it("returns isDirty: true when untracked files are present", async () => {
      mockGit.status.mockResolvedValue(makeUntrackedStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDirty).toBe(true);
    });

    it("does NOT trigger on gitignored files (status() excludes ignored files by default)", async () => {
      // git.status() from simple-git does NOT include ignored files unless
      // explicitly requested. A clean status with only ignored files → isClean() = true.
      mockGit.status.mockResolvedValue(makeCleanStatusResult());
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDirty).toBe(false);
      expect(result.passed).toBe(true);
    });

    it("includes modified file names in the violation message", async () => {
      mockGit.status.mockResolvedValue(
        makeDirtyStatusResult(["src/important.ts"])
      );
      const result = await checker.verifyWorkspace(projectPath);
      const dirtyViolation = result.violations.find(
        (v) => v.kind === "dirty_workspace"
      );
      expect(dirtyViolation?.message).toMatch(/src\/important\.ts/);
    });
  });

  // ── verifyWorkspace — HEAD state ─────────────────────────────────────────

  describe("verifyWorkspace — detached HEAD", () => {
    it("returns passed: false when HEAD is detached (symbolic-ref fails)", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse") return Promise.resolve("abc1234\n");
        if (args[0] === "symbolic-ref")
          return Promise.reject(new Error("fatal: ref HEAD is not a symbolic ref"));
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(false);
    });

    it("returns isDetachedHead: true when symbolic-ref fails", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse") return Promise.resolve("abc1234\n");
        if (args[0] === "symbolic-ref")
          return Promise.reject(new Error("fatal: ref HEAD is not a symbolic ref"));
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.isDetachedHead).toBe(true);
    });

    it("returns a detached_head violation when HEAD is detached", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse") return Promise.resolve("abc1234\n");
        if (args[0] === "symbolic-ref")
          return Promise.reject(new Error("not a symbolic ref"));
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.violations.some((v) => v.kind === "detached_head")).toBe(
        true
      );
    });
  });

  describe("verifyWorkspace — missing HEAD", () => {
    it("returns passed: false when HEAD cannot be resolved (no commits yet)", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse")
          return Promise.reject(
            new Error("fatal: ambiguous argument 'HEAD': unknown revision")
          );
        if (args[0] === "symbolic-ref") return Promise.resolve("refs/heads/main\n");
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(false);
    });

    it("returns headReachable: false when rev-parse fails", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse")
          return Promise.reject(
            new Error("fatal: ambiguous argument 'HEAD'")
          );
        if (args[0] === "symbolic-ref") return Promise.resolve("refs/heads/main\n");
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.headReachable).toBe(false);
    });

    it("returns a missing_head violation when HEAD cannot be resolved", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse")
          return Promise.reject(new Error("unknown revision"));
        if (args[0] === "symbolic-ref") return Promise.resolve("refs/heads/main\n");
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.violations.some((v) => v.kind === "missing_head")).toBe(
        true
      );
    });
  });

  describe("verifyWorkspace — multiple violations", () => {
    it("reports both dirty_workspace and detached_head violations simultaneously", async () => {
      mockGit.status.mockResolvedValue(makeDirtyStatusResult());
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "rev-parse") return Promise.resolve("abc1234\n");
        if (args[0] === "symbolic-ref")
          return Promise.reject(new Error("not a symbolic ref"));
        return Promise.resolve("");
      });
      const result = await checker.verifyWorkspace(projectPath);
      expect(result.passed).toBe(false);
      const kinds = result.violations.map((v) => v.kind);
      expect(kinds).toContain("dirty_workspace");
      expect(kinds).toContain("detached_head");
    });
  });

  // ── checkObjectStoreIntegrity ─────────────────────────────────────────────

  describe("checkObjectStoreIntegrity", () => {
    it("returns passed: true when git fsck reports no issues", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "fsck") return Promise.resolve(""); // empty = healthy
        return Promise.resolve("");
      });
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      expect(result.passed).toBe(true);
    });

    it("returns an empty violations array for a healthy object store", async () => {
      mockGit.raw.mockResolvedValue("");
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      expect(result.violations).toHaveLength(0);
    });

    it("calls git fsck with --connectivity-only and --no-dangling flags", async () => {
      await checker.checkObjectStoreIntegrity(projectPath);
      expect(mockGit.raw).toHaveBeenCalledWith(
        expect.arrayContaining([
          "fsck",
          "--connectivity-only",
          "--no-dangling",
        ])
      );
    });

    it("returns passed: false when git fsck throws (indicating corruption)", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "fsck")
          return Promise.reject(new Error("error: object file is empty"));
        return Promise.resolve("");
      });
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      expect(result.passed).toBe(false);
    });

    it("returns an object_store_corruption violation when fsck fails", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "fsck")
          return Promise.reject(new Error("error: object file is empty"));
        return Promise.resolve("");
      });
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      expect(
        result.violations.some((v) => v.kind === "object_store_corruption")
      ).toBe(true);
    });

    it("includes the fsck error message in the violation details", async () => {
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "fsck")
          return Promise.reject(new Error("error: object file is empty at /objs/ab/cd"));
        return Promise.resolve("");
      });
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      const violation = result.violations.find(
        (v) => v.kind === "object_store_corruption"
      );
      expect(violation?.details).toMatch(/empty/);
    });

    it("returns passed: true when fsck output is non-empty but exit code is 0", async () => {
      // Some fsck messages are informational (warnings) but not errors (exit 0)
      mockGit.raw.mockImplementation((args: string[]) => {
        if (args[0] === "fsck") return Promise.resolve("Checking connectivity: done.\n");
        return Promise.resolve("");
      });
      const result = await checker.checkObjectStoreIntegrity(projectPath);
      expect(result.passed).toBe(true);
    });
  });

  // ── GitIntegrityViolationError ────────────────────────────────────────────

  describe("GitIntegrityViolationError", () => {
    it("has name 'GitIntegrityViolationError'", () => {
      const err = new GitIntegrityViolationError([
        { kind: "dirty_workspace", message: "Workspace has changes" },
      ]);
      expect(err.name).toBe("GitIntegrityViolationError");
    });

    it("is an instance of Error", () => {
      const err = new GitIntegrityViolationError([]);
      expect(err).toBeInstanceOf(Error);
    });

    it("exposes the violations array", () => {
      const violations = [
        { kind: "dirty_workspace" as const, message: "test" },
      ];
      const err = new GitIntegrityViolationError(violations);
      expect(err.violations).toStrictEqual(violations);
    });

    it("includes violation messages in the error message", () => {
      const err = new GitIntegrityViolationError([
        { kind: "detached_head", message: "HEAD is detached" },
      ]);
      expect(err.message).toContain("HEAD is detached");
    });
  });

  // ── withRetry ─────────────────────────────────────────────────────────────

  describe("withRetry", () => {
    it("succeeds on the first attempt without retrying", async () => {
      const operation = vi.fn().mockResolvedValue("success");
      const result = await GitIntegrityChecker.withRetry(operation);
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("retries when a transient lock-file error occurs and then succeeds", async () => {
      const lockError = new Error(
        "fatal: Unable to create '.git/index.lock': File exists"
      );
      const operation = vi
        .fn()
        .mockRejectedValueOnce(lockError)
        .mockResolvedValue("recovered");

      const result = await GitIntegrityChecker.withRetry(operation, {
        maxAttempts: 3,
        backoffMs: 0,
      });
      expect(result).toBe("recovered");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("retries up to maxAttempts times before throwing", async () => {
      const lockError = new Error("fatal: Unable to create '.git/index.lock'");
      const operation = vi.fn().mockRejectedValue(lockError);

      await expect(
        GitIntegrityChecker.withRetry(operation, {
          maxAttempts: 3,
          backoffMs: 0,
        })
      ).rejects.toThrow(lockError.message);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("does not retry on non-transient errors (rethrows immediately)", async () => {
      const permError = new Error("permission denied: .git/objects/");
      const operation = vi.fn().mockRejectedValue(permError);

      await expect(
        GitIntegrityChecker.withRetry(operation, {
          maxAttempts: 3,
          backoffMs: 0,
        })
      ).rejects.toThrow("permission denied");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("retries on COMMIT_EDITMSG.lock errors (another transient lock pattern)", async () => {
      const editmsgLock = new Error(
        "fatal: Unable to create '.git/COMMIT_EDITMSG.lock'"
      );
      const operation = vi
        .fn()
        .mockRejectedValueOnce(editmsgLock)
        .mockResolvedValue("committed");

      const result = await GitIntegrityChecker.withRetry(operation, {
        maxAttempts: 3,
        backoffMs: 0,
      });
      expect(result).toBe("committed");
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it("returns immediately on first success with correct value", async () => {
      const operation = vi.fn().mockResolvedValue(42);
      const result = await GitIntegrityChecker.withRetry(operation, {
        maxAttempts: 5,
        backoffMs: 0,
      });
      expect(result).toBe(42);
    });
  });

  // ── returnResultFromVerify ────────────────────────────────────────────────

  describe("verifyWorkspace — result structure", () => {
    it("always returns an object with passed, isDirty, isDetachedHead, headReachable, violations", async () => {
      const result: IntegrityCheckResult =
        await checker.verifyWorkspace(projectPath);
      expect(result).toHaveProperty("passed");
      expect(result).toHaveProperty("isDirty");
      expect(result).toHaveProperty("isDetachedHead");
      expect(result).toHaveProperty("headReachable");
      expect(result).toHaveProperty("violations");
      expect(Array.isArray(result.violations)).toBe(true);
    });
  });
});
