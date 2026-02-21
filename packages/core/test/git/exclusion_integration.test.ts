/**
 * @devs/core — Git exclusion integration tests
 *
 * Requirements: UNKNOWN-601, UNKNOWN-602
 *
 * Uses REAL git operations (simple-git is NOT mocked) to verify that:
 * 1. `.devs/` appears in the ignored file list after `ensureStandardIgnores()`.
 * 2. `.devs/state.sqlite` is NOT staged by `git add .`.
 * 3. `.agent/` files ARE tracked (not excluded).
 * 4. `.env` is ignored but `.env.example` is not.
 * 5. `SnapshotManager.initialize()` correctly wires gitignore exclusions before staging.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { simpleGit } from "simple-git";
import { GitIgnoreManager } from "../../src/git/GitIgnoreManager.js";
import { SnapshotManager } from "../../src/git/SnapshotManager.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function initTmpRepo(
  dir: string
): Promise<ReturnType<typeof simpleGit>> {
  const sg = simpleGit(dir);
  await sg.init();
  await sg.addConfig("user.name", "devs-test", false, "local");
  await sg.addConfig("user.email", "devs-test@local", false, "local");
  return sg;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Git exclusion integration", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "devs-git-excl-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  // ── .devs/ exclusion via GitIgnoreManager ─────────────────────────────────

  it("does not stage .devs/state.sqlite after ensureStandardIgnores + git add .", async () => {
    const sg = await initTmpRepo(tmpDir);

    // Create Flight Recorder state file
    fs.mkdirSync(path.join(tmpDir, ".devs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".devs", "state.sqlite"),
      "dummy sqlite data"
    );

    // Create a legitimate project file
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Project");

    // Apply standard ignore rules
    GitIgnoreManager.ensureStandardIgnores(tmpDir);

    // Stage everything
    await sg.add(".");

    const status = await sg.status();
    const staged = status.staged;

    // .devs/state.sqlite must NOT be staged
    expect(staged).not.toContain(".devs/state.sqlite");
    expect(staged.some((f) => f.startsWith(".devs/"))).toBe(false);

    // README.md and .gitignore must be staged
    expect(staged).toContain("README.md");
    expect(staged).toContain(".gitignore");
  });

  it("shows .devs/ as ignored in git status --ignored", async () => {
    const sg = await initTmpRepo(tmpDir);

    fs.mkdirSync(path.join(tmpDir, ".devs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".devs", "state.sqlite"),
      "dummy sqlite data"
    );

    GitIgnoreManager.ensureStandardIgnores(tmpDir);

    // git status --ignored --porcelain lists ignored entries prefixed with "!!"
    const raw = await sg.raw([
      "status",
      "--ignored",
      "--porcelain",
    ]);

    expect(raw).toContain(".devs/");
  });

  it("tracks .agent/ files (not excluded from git staging)", async () => {
    const sg = await initTmpRepo(tmpDir);

    // Create .agent/ documentation file
    fs.mkdirSync(path.join(tmpDir, ".agent"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".agent", "memory.md"),
      "# Agent Memory"
    );

    GitIgnoreManager.ensureStandardIgnores(tmpDir);

    await sg.add(".");
    const status = await sg.status();
    const staged = status.staged;

    // .agent/memory.md must be staged (tracked devs artifact)
    expect(staged).toContain(".agent/memory.md");
  });

  it("does not stage .env but does stage .env.example", async () => {
    const sg = await initTmpRepo(tmpDir);

    fs.writeFileSync(path.join(tmpDir, ".env"), "SECRET=abc123");
    fs.writeFileSync(path.join(tmpDir, ".env.example"), "SECRET=");

    GitIgnoreManager.ensureStandardIgnores(tmpDir);

    await sg.add(".");
    const status = await sg.status();
    const staged = status.staged;

    expect(staged).not.toContain(".env");
    expect(staged).toContain(".env.example");
  });

  // ── SnapshotManager integration ───────────────────────────────────────────

  it("SnapshotManager.initialize() wires .gitignore so .devs/state.sqlite is not staged", async () => {
    // Create files before initialization
    fs.mkdirSync(path.join(tmpDir, ".devs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".devs", "state.sqlite"),
      "flight recorder db"
    );
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Generated project");

    const sm = new SnapshotManager({ projectPath: tmpDir });
    await sm.initialize();

    // Manually stage to verify exclusion (takeSnapshot would commit, which
    // requires at least one file — but the .gitignore would already be staged)
    const sg = simpleGit(tmpDir);
    await sg.add(".");

    const status = await sg.status();
    const staged = status.staged;

    expect(staged).not.toContain(".devs/state.sqlite");
    expect(staged.some((f) => f.startsWith(".devs/"))).toBe(false);
    expect(staged).toContain("README.md");
  });

  it("SnapshotManager.takeSnapshot() creates a commit that excludes .devs/", async () => {
    // Initialize project with both devs state and real project files
    fs.mkdirSync(path.join(tmpDir, ".devs"), { recursive: true });
    fs.writeFileSync(
      path.join(tmpDir, ".devs", "state.sqlite"),
      "runtime state"
    );
    fs.writeFileSync(path.join(tmpDir, "README.md"), "# Project");

    const sm = new SnapshotManager({ projectPath: tmpDir });
    await sm.initialize();
    const sha = await sm.takeSnapshot("chore: initial project snapshot");

    // SHA should be a non-empty string
    expect(typeof sha).toBe("string");
    expect(sha.length).toBeGreaterThan(0);

    // Verify the committed tree does not contain .devs/state.sqlite
    const sg = simpleGit(tmpDir);
    const showOutput = await sg.raw(["show", "--name-only", "--format=", "HEAD"]);
    expect(showOutput).not.toContain("state.sqlite");
    expect(showOutput).not.toContain(".devs/");
    expect(showOutput).toContain("README.md");
  });
});
