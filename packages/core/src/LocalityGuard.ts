import type { StateRepository } from "./persistence/state_repository.js";

export class LocalityGuard {
  private repo: StateRepository;
  private projectId: number;
  private allowedKeys = new Set(["config", "apiKeys", "id", "role", "name"]);

  constructor(repo: StateRepository, projectId: number) {
    this.repo = repo;
    this.projectId = projectId;
  }

  /**
   * Execute an agent turn while enforcing data locality.
   * - Detects newly-added ephemeral properties (e.g., `findings`, `state`).
   * - Persists findings/state to the Flight Recorder and removes them from the agent.
   */
  async runTurn(agent: any, turnFn: () => Promise<any> | any): Promise<any> {
    const before = new Set(Object.getOwnPropertyNames(agent));
    const result = await Promise.resolve(turnFn());
    const after = new Set(Object.getOwnPropertyNames(agent));

    const newKeys = [...after].filter((k) => !before.has(k) && !k.startsWith("_") && !this.allowedKeys.has(k));

    for (const k of newKeys) {
      const val = agent[k];

      try {
        // Findings -> persist as documents (one doc per finding if possible)
        if (k === "findings" && Array.isArray(val)) {
          for (const f of val) {
            if (f && typeof f === "object") {
              const name = f.name ?? "finding";
              const content = f.content ?? JSON.stringify(f);
              this.repo.addDocument({ project_id: this.projectId, name, content });
            } else {
              this.repo.addDocument({ project_id: this.projectId, name: String(k), content: String(f) });
            }
          }
        }

        // Generic state/privateState -> persist as a document with serialized JSON
        else if ((k === "state" || k === "privateState") && val !== undefined) {
          this.repo.addDocument({ project_id: this.projectId, name: String(k), content: JSON.stringify(val) });
        }
      } catch (err) {
        // Best-effort persistence: swallow DB errors to avoid breaking the agent turn.
      }

      // Remove ephemeral property from the agent instance to enforce locality.
      try {
        delete agent[k];
      } catch (err) {
        // Ignore deletion failures.
      }
    }

    return result;
  }
}
