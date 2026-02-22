import fs from "fs/promises";
import path from "path";

export type ProjectStatus = "ACTIVE" | "PAUSED" | "UNKNOWN";

export class ProjectManager {
  private persistencePath: string;

  constructor(persistencePath?: string) {
    this.persistencePath = persistencePath ?? path.resolve(process.cwd(), "packages/core/.project_status.json");
  }

  private async readState(): Promise<Record<string, ProjectStatus>> {
    try {
      const raw = await fs.readFile(this.persistencePath, "utf8");
      return JSON.parse(raw) as Record<string, ProjectStatus>;
    } catch (err) {
      return {};
    }
  }

  private async writeState(state: Record<string, ProjectStatus>) {
    await fs.mkdir(path.dirname(this.persistencePath), { recursive: true }).catch(()=>{});
    await fs.writeFile(this.persistencePath, JSON.stringify(state, null, 2), "utf8");
  }

  async pause(projectId = "default") {
    const state = await this.readState();
    state[projectId] = "PAUSED";
    await this.writeState(state);
  }

  async resume(projectId = "default") {
    const state = await this.readState();
    state[projectId] = "ACTIVE";
    await this.writeState(state);
  }

  async status(projectId = "default") {
    const state = await this.readState();
    const current = state[projectId] ?? "UNKNOWN";
    return {
      projectId,
      status: current,
      phase: null,
      milestone: null,
      epics: [],
      progress: 0,
      logs: [],
    };
  }
}
