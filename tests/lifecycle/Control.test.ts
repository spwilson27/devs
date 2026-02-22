import { describe, it, expect, beforeEach } from "vitest";
import { ProjectManager } from "../../packages/core/src/lifecycle/ProjectManager";

describe("Lifecycle Control API", () => {
  let pm: ProjectManager;

  beforeEach(() => {
    pm = new ProjectManager();
  });

  it("pause() sets status to PAUSED", async () => {
    await pm.resume();
    await pm.pause();
    const s = await pm.status();
    expect(s.status).toBe("PAUSED");
  });

  it("resume() sets status to ACTIVE", async () => {
    await pm.pause();
    await pm.resume();
    const s = await pm.status();
    expect(s.status).toBe("ACTIVE");
  });

  it("status() returns phase, milestone, epics and logs fields", async () => {
    const s = await pm.status();
    expect(s).toHaveProperty("phase");
    expect(s).toHaveProperty("milestone");
    expect(s).toHaveProperty("epics");
    expect(Array.isArray(s.epics)).toBeTruthy();
    expect(s).toHaveProperty("logs");
  });
});
