import fs from 'fs/promises';
import fsSync from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

// Module-scoped set to track created temp directories for this process.
const _createdDirs: Set<string> = new Set();

/**
 * TempDirManager manages creation and lifecycle of secure temporary directories.
 *
 * Contract:
 * - Directories are created with exactly 0o700 permissions (owner rwx only).
 * - Prefix must match /^[a-zA-Z0-9_-]+$/ to avoid path-traversal.
 * - purge removes directories recursively and is idempotent (uses force:true).
 * - purgeAll attempts to purge all tracked dirs and throws an AggregateError if any fail.
 */
export class TempDirManager {
  /**
   * Create a secure temporary directory and return its absolute path.
   * @param prefix - Alphanumeric, underscore or dash only. Throws on invalid prefix.
   */
  static async create(prefix: string): Promise<string> {
    if (!/^[a-zA-Z0-9_-]+$/.test(prefix)) {
      throw new Error(`invalid prefix: ${prefix}`);
    }

    const dirPath = path.join(os.tmpdir(), `devs-${prefix}-${crypto.randomUUID()}`);
    // Create directory with requested mode; also chmod to ensure exact bits despite umask.
    await fs.mkdir(dirPath, { recursive: false, mode: 0o700 });
    try {
      await fs.chmod(dirPath, 0o700);
    } catch (_) {
      // Ignore chmod failures; directory was created but best-effort to set exact perms.
    }

    _createdDirs.add(dirPath);
    return dirPath;
  }

  /**
   * Remove a directory and its contents. Idempotent.
   */
  static async purge(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } finally {
      _createdDirs.delete(dirPath);
    }
  }

  /**
   * Purge all directories created in this session. Throws AggregateError if any purge failed.
   */
  static async purgeAll(): Promise<void> {
    const errors: any[] = [];
    const dirs = Array.from(_createdDirs);
    for (const d of dirs) {
      try {
        await this.purge(d);
      } catch (e) {
        errors.push(e);
      }
    }
    if (errors.length) {
      throw new AggregateError(errors, 'Errors purging temp dirs');
    }
  }

  /**
   * Returns a snapshot list of active temp directories tracked by this manager.
   */
  static listActive(): readonly string[] {
    return Array.from(_createdDirs);
  }
}

// Best-effort synchronous cleanup on normal process exit.
process.on('exit', () => {
  const dirs = Array.from(_createdDirs);
  for (const d of dirs) {
    try {
      fsSync.rmSync(d, { recursive: true, force: true });
    } catch (_) {
      // best-effort only
    }
    _createdDirs.delete(d);
  }
});
