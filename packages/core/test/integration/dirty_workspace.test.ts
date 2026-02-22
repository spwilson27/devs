import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { Orchestrator, DirtyWorkspaceError } from "../../src/orchestration/Orchestrator.js";

async function initTmpRepo(dir: string) {
  const sg = simpleGit(dir);
  await sg.init();
  await sg.addConfig("user.name", "devs-test", false, "local");
  await sg.addConfig("user.email", "devs-test@local", false, "local");
  return sg;
}

describe("Dirty workspace detection", () => {
  let tmpDir: string;
  let sg: ReturnType<typeof simpleGit>;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-dirty-"));
    sg = await initTmpRepo(tmpDir);
    // Initial commit
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Project\n");
    await sg.add(".");
    await sg.commit("chore: initial commit");
  });

  afterEach(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it("proceeds when workspace is clean", async () => {
    const orch = new Orchestrator(tmpDir, { interactive: false });
    await expect(orch.startTask()).resolves.toBeUndefined();
  });

  it("throws DirtyWorkspaceError when file is untracked", async () => {
    fs.writeFileSync(path.join(tmpDir, "untracked.txt"), "hello");
    const orch = new Orchestrator(tmpDir);
    await expect(orch.startTask()).rejects.toThrowError(DirtyWorkspaceError);
  });

  it("stashes changes when stash flag is provided", async () => {
    fs.writeFileSync(path.join(tmpDir, "untracked2.txt"), "hello");
    const orch = new Orchestrator(tmpDir);
    await expect(orch.startTask({ stash: true })).resolves.toBeUndefined();
    const status = await sg.status();
    expect(status.isClean()).toBe(true);
    const stashList = await sg.raw(["stash", "list"]);
    expect(stashList).toContain("devs: pre-task auto-stash");
  });
});
