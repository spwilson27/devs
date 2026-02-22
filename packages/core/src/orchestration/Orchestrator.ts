import { GitManager } from "../git/GitManager.js";

export class DirtyWorkspaceError extends Error {
  constructor(message?: string) {
    super(message ?? "Dirty workspace detected");
    this.name = "DirtyWorkspaceError";
  }
}

export class Orchestrator {
  private readonly gitManager: GitManager;
  private readonly interactive: boolean;

  constructor(workingDir: string, options?: { interactive?: boolean }) {
    this.gitManager = new GitManager(workingDir);
    this.interactive = options?.interactive ?? false;
  }

  /**
   * Start a task after performing pre-flight checks.
   * options.force: skip dirty checks
   * options.stash: automatically stash changes and proceed
   */
  async startTask(options?: { force?: boolean; stash?: boolean }): Promise<void> {
    const force = options?.force ?? false;
    const stash = options?.stash ?? false;

    if (force) return;

    const { isDirty, dirtyFiles } = await this.gitManager.isWorkspaceDirty();
    if (!isDirty) return;

    if (stash) {
      await this.gitManager.stash();
      return;
    }

    if (this.interactive) {
      // Interactive prompting not implemented in this minimal guard.
      throw new DirtyWorkspaceError(
        `Interactive resolution required. Dirty files: ${dirtyFiles.join(", ")}`
      );
    }

    throw new DirtyWorkspaceError(
      `Dirty workspace: ${dirtyFiles.slice(0, 10).join(", ")}${dirtyFiles.length > 10 ? " …" : ""}`
    );
  }
}
