import { describe, it, expect, vi, beforeEach } from "vitest";
import { simpleGit } from "simple-git";
import { GitClient } from "./GitClient.js";

vi.mock("simple-git");

describe("GitClient.checkout", () => {
  const workingDir = "/test/repo";
  let mockGit: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGit = {
      raw: vi.fn().mockResolvedValue(undefined),
      init: vi.fn().mockResolvedValue({}),
      checkIsRepo: vi.fn().mockResolvedValue(true),
      status: vi.fn().mockResolvedValue({ isClean: () => true, staged: [], modified: [], not_added: [] }),
      add: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue({ commit: "abc123" }),
      getConfig: vi.fn().mockResolvedValue({ value: "existing-value" }),
      addConfig: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(simpleGit).mockReturnValue(mockGit as unknown as ReturnType<typeof simpleGit>);
  });

  it("calls git.raw with checkout and --force when force=true", async () => {
    const client = new GitClient(workingDir);
    await client.checkout("deadbeef", true);
    expect(mockGit.raw).toHaveBeenCalledWith(["checkout", "deadbeef", "--force"]);
  });

  it("calls git.raw with checkout without --force when force=false", async () => {
    const client = new GitClient(workingDir);
    await client.checkout("deadbeef", false);
    expect(mockGit.raw).toHaveBeenCalledWith(["checkout", "deadbeef"]);
  });

  it("throws GitError when git.raw rejects", async () => {
    mockGit.raw.mockRejectedValue(new Error("checkout failed"));
    const client = new GitClient(workingDir);
    await expect(client.checkout("deadbeef", true)).rejects.toThrow();
  });
});
