// Filesystem barrel for FilesystemManager and adapters.
// Minimal FilesystemManager interface for PreflightService injection and tests.

export interface FilesystemManager {
  sync(sourcePath: string, sandboxId: string, opts?: { exclude?: string[] }): Promise<void>;
}

export const NoopFilesystemManager: FilesystemManager = {
  async sync() {
    throw new Error('No FilesystemManager implementation available in this environment.');
  }
};
