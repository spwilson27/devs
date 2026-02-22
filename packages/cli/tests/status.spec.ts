import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { init, status } from "../src/index.js";

function makeTempProject(): string {
  const dir = mkdtempSync(resolve(tmpdir(), "devs-cli-test-"));
  // Create a package.json marking this as the project root
  writeFileSync(resolve(dir, "package.json"), JSON.stringify({ name: "cli-test-project", private: true }));
  return dir;
}

describe("devs status CLI", () => {
  let tmp: string;

  beforeEach(() => {
    tmp = makeTempProject();
  });

  afterEach(() => {
    try {
      if (existsSync(tmp)) rmSync(tmp, { recursive: true, force: true });
    } catch (err) {
      // ignore
    }
  });

  it("fails in an uninitialized directory", async () => {
    await expect(status({ projectDir: tmp })).rejects.toThrow(/not initialized/);
  });

  it("returns project state after init", async () => {
    const rc = await init({ projectDir: tmp, force: true });
    expect(rc).toBe(0);

    const st = await status({ projectDir: tmp });
    expect(st).toBeDefined();
    expect(st.project).toBeDefined();
    expect(st.project.name).toBe("cli-test-project");
    expect(typeof st.progress).toBe("object");
  });

  it("supports json output shape", async () => {
    await init({ projectDir: tmp, force: true });
    const st = await status({ projectDir: tmp, json: true });
    expect(st).toHaveProperty("project");
    expect(st).toHaveProperty("active_epic");
    expect(st).toHaveProperty("active_task");
    expect(st).toHaveProperty("progress");
  });
});
