/**
 * @devs/core — GitClient unit tests
 *
 * Requirement: TAS-012
 *
 * All simple-git interactions are mocked so no real git process is spawned.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { simpleGit } from "simple-git";
import { GitClient, GitError } from "./GitClient.js";

vi.mock("simple-git");

// ---------------------------------------------------------------------------
// Mock helpers
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

describe("GitClient", () => {
  const workingDir = "/test/repo";
  let mockGit: MockGitInstance;

  beforeEach(() => {
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

  // ── Constructor ────────────────────────────────────────────────────────────

  describe("constructor", () => {
    it("initializes simple-git with the normalized working directory", () => {
      new GitClient(workingDir);
      expect(simpleGit).toHaveBeenCalledWith(
        expect.objectContaining({ baseDir: workingDir })
      );
    });
  });

  // ── initRepository ─────────────────────────────────────────────────────────

  describe("initRepository", () => {
    it("calls git.init() when no repository exists at the given path", async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      const client = new GitClient(workingDir);
      await client.initRepository("/test/new-repo");
      expect(mockGit.init).toHaveBeenCalledOnce();
    });

    it("skips git.init() when a repository already exists at the given path", async () => {
      mockGit.checkIsRepo.mockResolvedValue(true);
      const client = new GitClient(workingDir);
      await client.initRepository("/test/existing-repo");
      expect(mockGit.init).not.toHaveBeenCalled();
    });

    it("throws GitError when git.init() fails", async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      mockGit.init.mockRejectedValue(new Error("permission denied"));
      const client = new GitClient(workingDir);
      await expect(client.initRepository("/test/error-repo")).rejects.toThrow(
        GitError
      );
    });

    it("throws GitError with the target path in the message", async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      mockGit.init.mockRejectedValue(new Error("permission denied"));
      const client = new GitClient(workingDir);
      await expect(
        client.initRepository("/test/error-repo")
      ).rejects.toThrow(/\/test\/error-repo/);
    });

    it("wraps the underlying error as cause in GitError", async () => {
      const underlying = new Error("disk full");
      mockGit.checkIsRepo.mockResolvedValue(false);
      mockGit.init.mockRejectedValue(underlying);
      const client = new GitClient(workingDir);
      let thrown: unknown;
      try {
        await client.initRepository("/test/error-repo");
      } catch (err) {
        thrown = err;
      }
      expect(thrown).toBeInstanceOf(GitError);
      expect((thrown as GitError).cause).toBe(underlying);
    });

    it("normalizes the path using upath (converts backslashes to forward slashes)", async () => {
      mockGit.checkIsRepo.mockResolvedValue(false);
      const client = new GitClient(workingDir);
      // On all platforms, upath normalizes Windows-style separators
      await client.initRepository("/test/normalized");
      // simpleGit is called for the target path with a normalized baseDir
      expect(simpleGit).toHaveBeenCalledWith(
        expect.objectContaining({ baseDir: "/test/normalized" })
      );
    });
  });

  // ── status ─────────────────────────────────────────────────────────────────

  describe("status", () => {
    it("returns isClean: true when the workspace is clean", async () => {
      mockGit.status.mockResolvedValue(makeCleanStatusResult());
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.isClean).toBe(true);
    });

    it("returns isClean: false when the workspace is dirty", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: ["a.ts"],
        modified: ["b.ts"],
        not_added: [],
      });
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.isClean).toBe(false);
    });

    it("returns empty staged, unstaged, and untracked arrays for a clean repo", async () => {
      mockGit.status.mockResolvedValue(makeCleanStatusResult());
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.staged).toEqual([]);
      expect(result.unstaged).toEqual([]);
      expect(result.untracked).toEqual([]);
    });

    it("returns staged files", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: ["src/a.ts", "src/b.ts"],
        modified: [],
        not_added: [],
      });
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.staged).toEqual(["src/a.ts", "src/b.ts"]);
    });

    it("returns untracked files", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: [],
        not_added: ["new-file.ts"],
      });
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.untracked).toEqual(["new-file.ts"]);
    });

    it("returns unstaged (modified but not staged) files", async () => {
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: [],
        modified: ["dirty.ts"],
        not_added: [],
      });
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.unstaged).toEqual(["dirty.ts"]);
    });

    it("does not include staged files in the unstaged list", async () => {
      // A file that is both staged AND has further unstaged changes
      mockGit.status.mockResolvedValue({
        isClean: () => false,
        staged: ["partial.ts"],
        modified: ["partial.ts", "other.ts"],
        not_added: [],
      });
      const client = new GitClient(workingDir);
      const result = await client.status();
      expect(result.staged).toEqual(["partial.ts"]);
      expect(result.unstaged).toEqual(["other.ts"]);
    });

    it("calls git.status() internally", async () => {
      const client = new GitClient(workingDir);
      await client.status();
      expect(mockGit.status).toHaveBeenCalledOnce();
    });

    it("throws GitError when git.status() fails", async () => {
      mockGit.status.mockRejectedValue(new Error("git error"));
      const client = new GitClient(workingDir);
      await expect(client.status()).rejects.toThrow(GitError);
    });
  });

  // ── add ────────────────────────────────────────────────────────────────────

  describe("add", () => {
    it("stages a single file string", async () => {
      const client = new GitClient(workingDir);
      await client.add("src/file.ts");
      expect(mockGit.add).toHaveBeenCalledWith(["src/file.ts"]);
    });

    it("stages an array of files", async () => {
      const client = new GitClient(workingDir);
      await client.add(["src/a.ts", "src/b.ts"]);
      expect(mockGit.add).toHaveBeenCalledWith(["src/a.ts", "src/b.ts"]);
    });

    it("normalizes file paths from Windows-style separators to forward slashes", async () => {
      const client = new GitClient(workingDir);
      await client.add("src\\windows\\path.ts");
      expect(mockGit.add).toHaveBeenCalledWith(["src/windows/path.ts"]);
    });

    it("supports wildcard glob patterns", async () => {
      const client = new GitClient(workingDir);
      await client.add("src/**/*.ts");
      expect(mockGit.add).toHaveBeenCalledWith(["src/**/*.ts"]);
    });

    it("throws GitError when git.add() fails", async () => {
      mockGit.add.mockRejectedValue(new Error("pathspec error"));
      const client = new GitClient(workingDir);
      await expect(client.add("nonexistent.ts")).rejects.toThrow(GitError);
    });

    it("throws GitError that mentions the failed file path", async () => {
      mockGit.add.mockRejectedValue(new Error("pathspec error"));
      const client = new GitClient(workingDir);
      await expect(client.add("target.ts")).rejects.toThrow(/target\.ts/);
    });
  });

  // ── commit ─────────────────────────────────────────────────────────────────

  describe("commit", () => {
    it("creates a commit and returns the commit hash", async () => {
      mockGit.commit.mockResolvedValue({ commit: "deadbeef1234" });
      const client = new GitClient(workingDir);
      const hash = await client.commit("feat: add git client wrapper");
      expect(hash).toBe("deadbeef1234");
    });

    it("passes the commit message to git.commit()", async () => {
      const client = new GitClient(workingDir);
      await client.commit("my descriptive commit message");
      expect(mockGit.commit).toHaveBeenCalledWith(
        "my descriptive commit message"
      );
    });

    it("throws GitError when git.commit() fails", async () => {
      mockGit.commit.mockRejectedValue(new Error("nothing to commit"));
      const client = new GitClient(workingDir);
      await expect(client.commit("empty commit")).rejects.toThrow(GitError);
    });

    it("throws GitError that includes the commit message", async () => {
      mockGit.commit.mockRejectedValue(new Error("nothing to commit"));
      const client = new GitClient(workingDir);
      await expect(client.commit("my commit message")).rejects.toThrow(
        /my commit message/
      );
    });

    it("sets user.name default when git user.name is not configured", async () => {
      mockGit.getConfig.mockImplementation((key: string) => {
        if (key === "user.name") return Promise.resolve({ value: null });
        return Promise.resolve({ value: "existing-email@local" });
      });
      const client = new GitClient(workingDir);
      await client.commit("test commit");
      expect(mockGit.addConfig).toHaveBeenCalledWith(
        "user.name",
        "devs-agent",
        false,
        "local"
      );
    });

    it("sets user.email default when git user.email is not configured", async () => {
      mockGit.getConfig.mockImplementation((key: string) => {
        if (key === "user.email") return Promise.resolve({ value: null });
        return Promise.resolve({ value: "Existing User" });
      });
      const client = new GitClient(workingDir);
      await client.commit("test commit");
      expect(mockGit.addConfig).toHaveBeenCalledWith(
        "user.email",
        "devs@local",
        false,
        "local"
      );
    });

    it("does not override user.name when it is already configured", async () => {
      mockGit.getConfig.mockResolvedValue({ value: "Existing User" });
      const client = new GitClient(workingDir);
      await client.commit("test commit");
      expect(mockGit.addConfig).not.toHaveBeenCalledWith(
        "user.name",
        expect.anything(),
        expect.anything(),
        expect.anything()
      );
    });
  });

  // ── GitError ───────────────────────────────────────────────────────────────

  describe("GitError", () => {
    it("has name 'GitError'", () => {
      const err = new GitError("test error");
      expect(err.name).toBe("GitError");
    });

    it("is an instance of Error", () => {
      const err = new GitError("test error");
      expect(err).toBeInstanceOf(Error);
    });

    it("is an instance of GitError", () => {
      const err = new GitError("test error");
      expect(err).toBeInstanceOf(GitError);
    });

    it("preserves the message", () => {
      const err = new GitError("something went wrong");
      expect(err.message).toBe("something went wrong");
    });

    it("preserves the cause when provided", () => {
      const cause = new Error("underlying git failure");
      const err = new GitError("wrapper error", { cause });
      expect(err.cause).toBe(cause);
    });
  });
});
