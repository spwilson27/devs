import { simpleGit, type SimpleGit } from "simple-git";
import upath from "upath";
import { resolve } from "node:path";

export interface WorkspaceDirtyResult {
  isDirty: boolean;
  dirtyFiles: string[];
}

export class GitManager {
  private readonly git: SimpleGit;
  readonly workingDir: string;

  constructor(workingDir: string) {
    const normalized = upath.normalize(resolve(workingDir));
    this.workingDir = normalized;
    this.git = simpleGit({ baseDir: normalized });
  }

  async isWorkspaceDirty(): Promise<WorkspaceDirtyResult> {
    try {
      const status = await this.git.status();
      const staged = [...status.staged];
      const stagedSet = new Set(staged);
      const unstaged = status.modified.filter((f) => !stagedSet.has(f));
      const untracked = [...status.not_added];
      const rawDirty = [...staged, ...unstaged, ...untracked];

      const dirtyFiles = rawDirty
        .map((f) => upath.normalize(f))
        .filter((f) => !(f.startsWith(".devs/") || f.startsWith(".agent/")));

      return { isDirty: dirtyFiles.length > 0, dirtyFiles };
    } catch (err) {
      return { isDirty: true, dirtyFiles: [] };
    }
  }

  async stash(message = "devs: pre-task auto-stash"): Promise<void> {
    try {
      await this.git.raw(["stash", "push", "-u", "-m", message]);
    } catch (err) {
      throw new Error(`Git stash failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async discard(): Promise<void> {
    try {
      await this.git.raw(["reset", "--hard", "HEAD"]);
      await this.git.raw(["clean", "-fd"]);
    } catch (err) {
      throw new Error(`Git discard failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
